from __future__ import annotations

import asyncio
import difflib
import logging
import re
from datetime import date, datetime, time, timedelta
from time import perf_counter
from typing import Any, AsyncIterator, Literal, TypedDict
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from langgraph.graph import END, START, StateGraph

try:
    from app.models.user import User
    from memory import memory_tools
    from orchestration.checkpoint_store import get_checkpoint_saver
    from orchestration.synthesis import synthesize_response
    from orchestration.supervisor_workflow import execute_doctor_match_workflow
    from tools.doctor_appointment_tools import list_doctor_appointments_for_day
    from tools.medication_tools import medication_pipeline
    from shared.gemini import (
        AssistantConfigError,
        assistant_llm_is_configured,
        classify_llm_error,
        invoke_with_model_fallback_cached,
        log_assistant_llm_status_once,
    )
    from telemetry import emit_workflow_trace_event, new_run_id
except ImportError:  # Fallback for backend package context
    from app.models.user import User
    from backend.memory import memory_tools
    from backend.orchestration.checkpoint_store import get_checkpoint_saver
    from backend.orchestration.synthesis import synthesize_response
    from backend.orchestration.supervisor_workflow import execute_doctor_match_workflow
    from backend.tools.doctor_appointment_tools import list_doctor_appointments_for_day
    from backend.tools.medication_tools import medication_pipeline
    from backend.shared.gemini import (
        AssistantConfigError,
        assistant_llm_is_configured,
        classify_llm_error,
        invoke_with_model_fallback_cached,
        log_assistant_llm_status_once,
    )
    from backend.telemetry import emit_workflow_trace_event, new_run_id

log = logging.getLogger(__name__)


AssistantRoute = Literal[
    "appointment_only",
    "combined",
    "doctor_schedule",
    "doctor_medication_decision_support",
    "doctor_general",
    "general_health",
    "medication_only",
]
IntentSource = Literal["message_only", "context_assisted", "clarified"]


class DetectedIntents(TypedDict):
    medication: bool
    appointment: bool
    general_health: bool
    combined: bool
    route: AssistantRoute
    confidence: float
    source: IntentSource


class AssistantChatState(TypedDict, total=False):
    trace_run_id: str
    user_id: str
    thread_id: str
    message: str
    max_suggestions: int
    recent_messages: list[dict[str, str]]
    assistant_context: dict[str, Any]

    patient_profile: dict[str, Any]
    actor_role: str
    actor_role_source: str
    memory_context: str
    contextual_message: str
    synthesis_context: str

    intent: str
    intents: dict[str, Any]
    intent_confidence: float
    intent_source: IntentSource
    clarification_required: bool

    medication_result: dict[str, Any] | None
    doctor_result: dict[str, Any] | None
    booking_selection: dict[str, Any]
    doctor_schedule_result: dict[str, Any] | None
    general_response: str | None

    structured_errors: list[dict[str, Any]]
    ai_message: str
    ai_message_type: str
    unified_response: dict[str, Any]


def _build_user_profile(user: User) -> dict[str, Any]:
    age = None
    if user.date_of_birth:
        today = date.today()
        dob = user.date_of_birth
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    raw_role = getattr(user, "role", None)
    role_value = str(raw_role.value if hasattr(raw_role, "value") else raw_role or "").strip().lower()
    return {
        "user_id": str(user.user_id),
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": role_value,
        "age": age,
        "gender": user.gender,
        "allergies": user.allergies or [],
        "chronic_conditions": user.chronic_conditions or [],
    }


def _actor_role_from_context(context: dict[str, Any] | None) -> str | None:
    if not isinstance(context, dict):
        return None
    mode = context.get("mode")
    metadata = context.get("metadata")
    if not mode and isinstance(metadata, dict):
        mode = metadata.get("mode")
    value = str(mode or "").strip().lower()
    if value in {"doctor", "patient", "admin"}:
        return value
    return None


def _timezone_from_context(context: dict[str, Any] | None) -> str:
    value = None
    if isinstance(context, dict):
        value = context.get("timezone") or context.get("time_zone")
        metadata = context.get("metadata")
        if not value and isinstance(metadata, dict):
            value = metadata.get("timezone") or metadata.get("time_zone")
    normalized = str(value or "UTC").strip() or "UTC"
    try:
        ZoneInfo(normalized)
    except ZoneInfoNotFoundError:
        return "UTC"
    return normalized


def _today_in_timezone(timezone_name: str) -> date:
    return datetime.now(ZoneInfo(timezone_name)).date()


def _parse_relative_or_iso_day(message: str, timezone_name: str) -> date | None:
    lowered = (message or "").lower()
    today = _today_in_timezone(timezone_name)
    if re.search(r"\btoday\b", lowered):
        return today
    if re.search(r"\btomorrow\b", lowered):
        return today + timedelta(days=1)

    iso_match = re.search(r"\b(20\d{2}-\d{2}-\d{2})\b", lowered)
    if iso_match:
        try:
            return date.fromisoformat(iso_match.group(1))
        except ValueError:
            return None

    weekdays = {
        "monday": 0,
        "tuesday": 1,
        "wednesday": 2,
        "thursday": 3,
        "friday": 4,
        "saturday": 5,
        "sunday": 6,
    }
    for name, weekday in weekdays.items():
        if re.search(rf"\b{name}\b", lowered):
            days_ahead = (weekday - today.weekday()) % 7
            if days_ahead == 0 and "next " in lowered:
                days_ahead = 7
            return today + timedelta(days=days_ahead)
    return None


def _parse_time_from_message(message: str) -> time | None:
    text = message or ""
    patterns = [
        r"\b(?:at|around|for)\s+([01]?\d|2[0-3])(?::([0-5]\d))?\s*(am|pm)\b",
        r"\b(?:at|around|for)\s+([01]?\d|2[0-3]):([0-5]\d)\b",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if not match:
            continue
        hour = int(match.group(1))
        minute = int(match.group(2) or 0)
        meridiem = (match.group(3) or "").lower() if len(match.groups()) >= 3 else ""
        if meridiem == "pm" and hour != 12:
            hour += 12
        elif meridiem == "am" and hour == 12:
            hour = 0
        try:
            return time(hour=hour, minute=minute)
        except ValueError:
            return None
    return None


def _extract_selected_doctor(message: str) -> dict[str, Any] | None:
    text = " ".join((message or "").split())
    match = re.search(
        r"\b(?:dr\.?|doctor)\s+([a-z][a-z'’-]*(?:\s+[a-z][a-z'’-]*){0,2})",
        text,
        re.IGNORECASE,
    )
    if not match:
        return None
    raw = match.group(1).strip(" .,:;")
    stop_words = {
        "today", "tomorrow", "monday", "tuesday", "wednesday", "thursday",
        "friday", "saturday", "sunday", "at", "for", "around", "on", "with",
    }
    parts = [p for p in raw.split() if p.lower() not in stop_words]
    if not parts:
        return None
    return {"doctor_name": " ".join(parts[:2])}


def _extract_patient_booking_selection(message: str, timezone_name: str) -> dict[str, Any]:
    doctor = _extract_selected_doctor(message)
    selected_day = _parse_relative_or_iso_day(message, timezone_name)
    selected_time = _parse_time_from_message(message)
    selection: dict[str, Any] = {}
    if doctor:
        selection["selected_doctor"] = doctor
    if selected_day:
        selection["selected_appointment_date"] = selected_day
    if selected_time:
        selection["selected_appointment_time"] = selected_time
    if selection:
        selection["booking_timezone"] = timezone_name
        selection["booking_reason"] = "assistant_patient_booking_request"
    return selection


def _detect_intents(message: str) -> DetectedIntents:
    lowered = (message or "").lower()
    medication_keywords = {
        "medication", "medicine", "drug", "prescription", "dose", "dosage",
        "pill", "tablet", "capsule", "pharmacy", "pharmacist", "take",
        "recommend", "relief", "treat", "safe to take",
    }
    symptom_keywords = {
        "headache", "migraine", "fever", "pain", "cough", "cold", "flu",
        "sore throat", "runny nose", "allergy", "allergies", "rash",
        "heartburn", "acid reflux", "indigestion", "diarrhea", "vomiting",
        "nausea", "stomach ache", "toothache", "muscle ache",
    }
    appointment_keywords = {"appointment", "schedule", "book", "doctor", "visit", "clinic"}
    health_guidance_keywords = {
        "cholesterol", "ldl", "hdl", "triglycerides", "lipid", "lipids", "blood pressure",
        "glucose", "a1c", "hemoglobin a1c", "lab", "labs", "test result", "results",
        "wellness", "prevention", "healthy", "risk factor", "lifestyle", "diet", "exercise",
    }
    has_medication_keyword = any(k in lowered for k in medication_keywords)
    has_symptom_keyword = any(k in lowered for k in symptom_keywords)
    has_health_guidance_keyword = any(k in lowered for k in health_guidance_keywords)
    asks_for_help = bool(re.search(r"\b(what|which|can|should|help|need|recommend)\b", lowered))
    has_appointment = any(k in lowered for k in appointment_keywords)
    has_medication = has_medication_keyword or (has_symptom_keyword and asks_for_help)
    has_general_health = has_health_guidance_keyword and asks_for_help
    combined = has_appointment and has_medication

    route: AssistantRoute
    if combined:
        route = "combined"
    elif has_appointment:
        route = "appointment_only"
    elif has_medication:
        route = "medication_only"
    else:
        route = "general_health"

    return {
        "medication": has_medication,
        "appointment": has_appointment,
        "general_health": has_general_health,
        "combined": combined,
        "route": route,
        "confidence": 0.95 if (combined or has_appointment or has_medication) else (0.75 if has_general_health else 0.35),
        "source": "message_only",
    }


def _detect_doctor_intents(message: str) -> DetectedIntents:
    lowered = (message or "").lower()
    appointment_tokens = {
        "appointment", "appointments", "schedule", "calendar", "visit", "visits",
        "consultation", "consultations",
    }
    medication_tokens = {
        "medication", "medicine", "drug", "dose", "dosage", "prescribe",
        "prescription", "contraindication", "interaction",
    }
    has_day_reference = any(
        token in lowered
        for token in ("today", "tomorrow", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "20")
    )
    has_schedule_keyword = any(token in lowered for token in appointment_tokens)
    has_patient_day_pattern = bool(
        re.search(r"\bpatients?\b.{0,30}\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b", lowered)
        or re.search(r"\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b.{0,30}\bpatients?\b", lowered)
        or re.search(r"\bdo i have\b.{0,40}\bpatients?\b", lowered)
    )
    has_schedule = (has_schedule_keyword and has_day_reference) or has_patient_day_pattern
    asks_medication = any(token in lowered for token in medication_tokens)
    route: AssistantRoute
    if has_schedule:
        route = "doctor_schedule"
    elif asks_medication:
        route = "doctor_medication_decision_support"
    else:
        route = "doctor_general"
    return {
        "medication": asks_medication,
        "appointment": has_schedule,
        "general_health": route == "doctor_general",
        "combined": False,
        "route": route,
        "confidence": 0.95 if route != "doctor_general" else 0.55,
        "source": "message_only",
    }


def _is_short_followup(message: str) -> bool:
    lowered = (message or "").lower().strip()
    if len(lowered) > 80:
        return False
    followup_markers = (
        "what about", "and this", "and that", "for this", "for that",
        "then what", "what next", "same issue", "same topic", "can you expand",
    )
    return any(marker in lowered for marker in followup_markers)


def _recent_user_topic(recent_messages: list[dict[str, str]]) -> str:
    user_msgs = [str(m.get("content") or "").strip() for m in recent_messages if str(m.get("role") or "") == "user"]
    return user_msgs[-1] if user_msgs else ""


def _clarification_message() -> str:
    return "Do you want help with doctor search or lifestyle guidance for this topic?"


def _clarification_message_for_role(actor_role: str) -> str:
    if actor_role == "doctor":
        return (
            "Do you want me to check your schedule, review patient-specific context, "
            "or give general clinical workflow guidance?"
        )
    return _clarification_message()


def _last_assistant_message(recent_messages: list[dict[str, str]]) -> str:
    for msg in reversed(recent_messages):
        if str(msg.get("role") or "") == "assistant":
            return str(msg.get("content") or "").strip()
    return ""


def _similarity(a: str, b: str) -> float:
    if not a or not b:
        return 0.0
    return difflib.SequenceMatcher(a=a.strip().lower(), b=b.strip().lower()).ratio()


def _format_recent_messages(messages: list[dict[str, str]], max_chars: int = 1500) -> str:
    lines = []
    for msg in messages:
        role = msg.get("role", "")
        content = msg.get("content", "")
        if content:
            lines.append(f"{role}: {content}")
    joined = "\n".join(lines).strip()
    if len(joined) > max_chars:
        joined = joined[-max_chars:]
    return joined


def _append_error(
    state: AssistantChatState,
    *,
    code: str,
    message: str,
    node: str,
) -> list[dict[str, Any]]:
    return [
        *list(state.get("structured_errors") or []),
        {"code": code, "message": message, "node": node},
    ]


def _patient_summary(patient: dict[str, Any]) -> str:
    parts = []
    name = f"{patient.get('first_name', '')} {patient.get('last_name', '')}".strip()
    if name:
        parts.append(name)
    if patient.get("age") is not None:
        parts.append(f"{patient['age']} years old")
    if patient.get("gender"):
        parts.append(str(patient["gender"]))
    if patient.get("allergies"):
        parts.append("allergies: " + ", ".join(str(a) for a in patient["allergies"]))
    if patient.get("chronic_conditions"):
        parts.append("conditions: " + ", ".join(str(c) for c in patient["chronic_conditions"]))
    return "; ".join(parts) or "Unknown patient"


def _general_chat_fallback_message(state: AssistantChatState) -> str:
    message = str(state.get("message") or "").strip()
    lowered = message.lower()
    recent_messages = list(state.get("recent_messages") or [])
    actor_role = str(state.get("actor_role") or "").lower()

    if "summary" in lowered or "summarize" in lowered:
        summary_lines = []
        for item in recent_messages[-4:]:
            role = str(item.get("role") or "message").capitalize()
            content = " ".join(str(item.get("content") or "").split()).strip()
            if content:
                summary_lines.append(f"- {role}: {content}")
        if summary_lines:
            return "Here is a quick summary of this conversation so far:\n\n" + "\n".join(summary_lines)
        return "There is not much conversation history yet, but I can summarize new messages as we go."

    if any(token in lowered for token in ("how can you help", "what can you help", "what do you do")):
        return (
            "I can help you review symptoms in a general way, suggest medication safety guidance, "
            "find doctors, prepare appointment options, and summarize your recent conversation. "
            "If you tell me what you need, I will route it to the right workflow."
        )

    if any(token in lowered for token in ("hospital app", "portal", "book", "appointment", "thread")):
        return (
            f"You asked: {message}\n\n"
            "I can help with booking flow questions, doctor search, medication guidance, and chat history. "
            "If you are trying to schedule care, include the specialty or symptoms you want help with."
        )

    # Doctor-focused deterministic fallback for guideline-style clinical prompts.
    if actor_role == "doctor" and any(token in lowered for token in ("guideline", "guidelines", "latest treatment", "recommendation", "recommendations")):
        if "hypertension" in lowered or "blood pressure" in lowered:
            return (
                "For hypertension, a practical guideline-based approach is:\n\n"
                "1. Confirm diagnosis with repeated standardized BP readings or out-of-office BP.\n"
                "2. Start lifestyle therapy for all patients: sodium reduction, weight management, exercise, alcohol moderation.\n"
                "3. Initiate pharmacotherapy based on overall CV risk and BP stage; common first-line classes are thiazide-type diuretics, ACEi/ARB, and CCB.\n"
                "4. Typical treatment target is <130/80 mmHg for many high-risk adults, individualized by frailty/comorbidities/tolerability.\n"
                "5. Reassess in ~1 month after treatment start/intensification, then titrate or add combination therapy if not at target.\n"
                "6. Evaluate secondary causes and adherence if resistant/uncontrolled.\n\n"
                "If you want, I can convert this into a clinic-ready stepwise protocol for a specific patient profile."
            )
        return (
            "I can provide a structured guideline-style summary for that condition.\n\n"
            "Share the exact condition plus patient context (age, key comorbidities, renal/hepatic status, pregnancy status when relevant), "
            "and I will return a practical first-line approach, treatment targets, escalation criteria, and follow-up intervals."
        )

    return (
        f"You asked: {message}\n\n"
        "I can help with general health guidance, medication safety questions, doctor matching, "
        "appointment support, and conversation summaries. Share a symptom, specialty, or task and I will take it from there."
    )


def _assistant_graph_config(thread_id: str) -> dict[str, Any]:
    normalized = str(thread_id or "").strip()
    if not normalized:
        raise ValueError("thread_id is required")
    return {"configurable": {"thread_id": f"assistant:{normalized}"}}


async def load_profile_node(state: AssistantChatState) -> AssistantChatState:
    started = perf_counter()
    run_id = str(state.get("trace_run_id") or "")
    if run_id:
        emit_workflow_trace_event(
            workflow_family="assistant",
            thread_id=str(state.get("thread_id") or ""),
            run_id=run_id,
            event_type="node_started",
            node_name="load_profile_node",
            actor_user_id=str(state.get("user_id") or ""),
            patient_user_id=str(state.get("user_id") or ""),
        )
    patient_profile = dict(state.get("patient_profile") or {})
    if not patient_profile.get("user_id") and state.get("user_id"):
        patient_profile["user_id"] = state["user_id"]
    actor_role = str(state.get("actor_role") or patient_profile.get("role") or "").lower()
    if run_id:
        emit_workflow_trace_event(
            workflow_family="assistant",
            thread_id=str(state.get("thread_id") or ""),
            run_id=run_id,
            event_type="node_completed",
            node_name="load_profile_node",
            status="ok",
            duration_ms=int((perf_counter() - started) * 1000),
            actor_user_id=str(state.get("user_id") or ""),
            patient_user_id=str(state.get("user_id") or ""),
        )
    return {"patient_profile": patient_profile, "actor_role": actor_role}


async def load_memory_node(state: AssistantChatState) -> AssistantChatState:
    started = perf_counter()
    run_id = str(state.get("trace_run_id") or "")
    if run_id:
        emit_workflow_trace_event(
            workflow_family="assistant",
            thread_id=str(state.get("thread_id") or ""),
            run_id=run_id,
            event_type="node_started",
            node_name="load_memory_node",
            actor_user_id=str(state.get("user_id") or ""),
            patient_user_id=str(state.get("user_id") or ""),
        )
    message = str(state.get("message") or "")
    memory_context = ""
    errors = list(state.get("structured_errors") or [])

    try:
        memory_context = await asyncio.to_thread(
            memory_tools.memory_context,
            str(state.get("user_id") or ""),
            message,
            5,
        )
    except Exception as exc:
        log.warning("Memory recall failed: %s", exc)
        errors.append(
            {
                "code": "MemoryRecallFailed",
                "message": str(exc),
                "node": "load_memory_node",
            }
        )

    context_parts = []
    recent_context = _format_recent_messages(list(state.get("recent_messages") or []))
    if recent_context:
        context_parts.append(f"Recent context:\n{recent_context}")
    if memory_context:
        context_parts.append(memory_context)

    contextual_message = message
    if context_parts:
        contextual_message = f"{message}\n\n" + "\n\n".join(context_parts)
    synthesis_context = "\n\n".join(context_parts).strip()

    result = {
        "memory_context": memory_context,
        "contextual_message": contextual_message,
        "synthesis_context": synthesis_context,
        "structured_errors": errors,
    }
    if run_id:
        emit_workflow_trace_event(
            workflow_family="assistant",
            thread_id=str(state.get("thread_id") or ""),
            run_id=run_id,
            event_type="node_completed",
            node_name="load_memory_node",
            status="ok",
            duration_ms=int((perf_counter() - started) * 1000),
            actor_user_id=str(state.get("user_id") or ""),
            patient_user_id=str(state.get("user_id") or ""),
            payload={"structured_error_count": len(errors)},
        )
    return result


async def classify_intent_node(state: AssistantChatState) -> AssistantChatState:
    started = perf_counter()
    run_id = str(state.get("trace_run_id") or "")
    if run_id:
        emit_workflow_trace_event(
            workflow_family="assistant",
            thread_id=str(state.get("thread_id") or ""),
            run_id=run_id,
            event_type="node_started",
            node_name="classify_intent_node",
            actor_user_id=str(state.get("user_id") or ""),
            patient_user_id=str(state.get("user_id") or ""),
        )
    message = str(state.get("message") or "")
    actor_role = str(state.get("actor_role") or dict(state.get("patient_profile") or {}).get("role") or "").lower()
    base = _detect_doctor_intents(message) if actor_role == "doctor" else _detect_intents(message)
    route: AssistantRoute = base["route"]
    confidence = float(base.get("confidence") or 0.0)
    source: IntentSource = "message_only"
    clarification_required = False

    short_followup = _is_short_followup(message)
    if confidence < 0.7 and (confidence >= 0.4 or short_followup):
        recent_messages = list(state.get("recent_messages") or [])
        recent_topic = _recent_user_topic(recent_messages)
        context_text = "\n".join(
            part for part in (recent_topic, str(state.get("memory_context") or "")) if part
        ).strip()
        if context_text:
            assisted = _detect_doctor_intents(context_text) if actor_role == "doctor" else _detect_intents(context_text)
            route = assisted["route"]
            confidence = max(confidence, float(assisted.get("confidence") or 0.65))
            source = "context_assisted"

    if confidence < 0.4:
        clarification_required = True
        source = "clarified"
        route = "doctor_general" if actor_role == "doctor" else "general_health"

    intents = dict(base)
    intents["route"] = route
    intents["confidence"] = confidence
    intents["source"] = source
    result = {
        "intents": intents,
        "intent": route,
        "intent_confidence": confidence,
        "intent_source": source,
        "clarification_required": clarification_required,
    }
    if run_id:
        emit_workflow_trace_event(
            workflow_family="assistant",
            thread_id=str(state.get("thread_id") or ""),
            run_id=run_id,
            event_type="node_completed",
            node_name="classify_intent_node",
            status="ok",
            duration_ms=int((perf_counter() - started) * 1000),
            actor_user_id=str(state.get("user_id") or ""),
            patient_user_id=str(state.get("user_id") or ""),
            payload={
                "intent_route": route,
                "intent_confidence": round(confidence, 4),
                "intent_source": source,
                "clarification_required": clarification_required,
            },
        )
        emit_workflow_trace_event(
            workflow_family="assistant",
            thread_id=str(state.get("thread_id") or ""),
            run_id=run_id,
            event_type="route_selected",
            node_name="classify_intent_node",
            status="ok",
            actor_user_id=str(state.get("user_id") or ""),
            patient_user_id=str(state.get("user_id") or ""),
            payload={"next_route": _route_after_intent(result)},
        )
    return result


async def doctor_node(state: AssistantChatState) -> AssistantChatState:
    started = perf_counter()
    thread_id = str(state.get("thread_id") or "").strip()
    user_id = str(state.get("user_id") or "").strip()
    run_id = str(state.get("trace_run_id") or "")
    if run_id:
        emit_workflow_trace_event(
            workflow_family="assistant",
            thread_id=thread_id,
            run_id=run_id,
            event_type="node_started",
            node_name="doctor_node",
            actor_user_id=user_id,
            patient_user_id=user_id,
        )
    try:
        context = dict(state.get("assistant_context") or {})
        timezone_name = _timezone_from_context(context)
        booking_selection = _extract_patient_booking_selection(str(state.get("message") or ""), timezone_name)
        workflow_state = {
            "thread_id": f"doctor:{thread_id}",
            "actor_user_id": user_id,
            "patient_user_id": user_id,
            "need_text": str(state.get("message") or ""),
            "max_suggestions": int(state.get("max_suggestions") or 5),
        }
        workflow_state.update(booking_selection)
        result = await execute_doctor_match_workflow(workflow_state)
        output = {"doctor_result": result}
        if booking_selection:
            output["booking_selection"] = booking_selection
        if run_id:
            emit_workflow_trace_event(
                workflow_family="assistant",
                thread_id=thread_id,
                run_id=run_id,
                event_type="node_completed",
                node_name="doctor_node",
                status="ok",
                duration_ms=int((perf_counter() - started) * 1000),
                actor_user_id=user_id,
                patient_user_id=user_id,
                payload={"doctor_workflow_invoked": True},
            )
            emit_workflow_trace_event(
                workflow_family="assistant",
                thread_id=thread_id,
                run_id=run_id,
                event_type="route_selected",
                node_name="doctor_node",
                status="ok",
                actor_user_id=user_id,
                patient_user_id=user_id,
                payload={"next_route": _route_after_doctor(state)},
            )
        return output
    except Exception as exc:
        log.warning("Doctor workflow failed: %s", exc)
        output = {
            "structured_errors": _append_error(
                state,
                code="DoctorWorkflowFailed",
                message=str(exc),
                node="doctor_node",
            )
        }
        if run_id:
            emit_workflow_trace_event(
                workflow_family="assistant",
                thread_id=thread_id,
                run_id=run_id,
                event_type="node_completed",
                node_name="doctor_node",
                status="error",
                duration_ms=int((perf_counter() - started) * 1000),
                actor_user_id=user_id,
                patient_user_id=user_id,
                payload={"error_code": "DoctorWorkflowFailed"},
            )
        return output


def _format_doctor_schedule_response(result: dict[str, Any]) -> str:
    requested_date = str(result.get("date") or "")
    appointments = list(result.get("appointments") or [])
    if not appointments:
        return f"You have no scheduled appointments on {requested_date}."

    label = "appointment" if len(appointments) == 1 else "appointments"
    lines = [f"You have {len(appointments)} scheduled {label} on {requested_date}:"]
    for item in appointments:
        start = item.get("display_time") or item.get("start_time_local") or "time not set"
        end = item.get("display_end_time")
        time_label = f"{start} - {end}" if end else str(start)
        patient = item.get("patient_name") or "Patient"
        appointment_type = item.get("appointment_type")
        type_label = f" ({appointment_type})" if appointment_type else ""
        lines.append(f"- {time_label}: {patient}{type_label}")
    return "\n".join(lines)


async def doctor_schedule_node(state: AssistantChatState) -> AssistantChatState:
    started = perf_counter()
    run_id = str(state.get("trace_run_id") or "")
    user_id = str(state.get("user_id") or "")
    timezone_name = _timezone_from_context(dict(state.get("assistant_context") or {}))
    requested_day = _parse_relative_or_iso_day(str(state.get("message") or ""), timezone_name)
    if run_id:
        emit_workflow_trace_event(
            workflow_family="assistant",
            thread_id=str(state.get("thread_id") or ""),
            run_id=run_id,
            event_type="node_started",
            node_name="doctor_schedule_node",
            actor_user_id=user_id,
            patient_user_id="",
        )
    if not requested_day:
        text = "Which day should I check? You can say today, tomorrow, a weekday, or a date like 2026-05-10."
        return {
            "general_response": text,
            "doctor_schedule_result": None,
            "clarification_required": True,
        }
    try:
        result = await asyncio.to_thread(
            list_doctor_appointments_for_day,
            user_id,
            requested_day,
            timezone_name,
        )
        text = _format_doctor_schedule_response(result)
        output = {"general_response": text, "doctor_schedule_result": result}
        if run_id:
            emit_workflow_trace_event(
                workflow_family="assistant",
                thread_id=str(state.get("thread_id") or ""),
                run_id=run_id,
                event_type="node_completed",
                node_name="doctor_schedule_node",
                status="ok",
                duration_ms=int((perf_counter() - started) * 1000),
                actor_user_id=user_id,
                patient_user_id="",
                payload={"requested_date": requested_day.isoformat(), "appointment_count": result.get("count", 0)},
            )
        return output
    except Exception as exc:
        log.warning("Doctor schedule lookup failed: %s", exc)
        return {
            "structured_errors": _append_error(
                state,
                code="DoctorScheduleLookupFailed",
                message=str(exc),
                node="doctor_schedule_node",
            ),
            "general_response": "I could not load your schedule right now. Please try again or open the appointments page.",
            "doctor_schedule_result": None,
        }


async def doctor_medication_support_node(state: AssistantChatState) -> AssistantChatState:
    text = (
        "I can help as clinical decision support, but I should not prescribe or choose a dose for you. "
        "Use the patient's chart, allergies, current medications, renal/hepatic status, pregnancy status when relevant, "
        "and your local formulary or pharmacist review before finalizing medication decisions."
    )
    return {"general_response": text}


async def medication_node(state: AssistantChatState) -> AssistantChatState:
    started = perf_counter()
    run_id = str(state.get("trace_run_id") or "")
    if run_id:
        emit_workflow_trace_event(
            workflow_family="assistant",
            thread_id=str(state.get("thread_id") or ""),
            run_id=run_id,
            event_type="node_started",
            node_name="medication_node",
            actor_user_id=str(state.get("user_id") or ""),
            patient_user_id=str(state.get("user_id") or ""),
        )
    try:
        result = await asyncio.to_thread(
            medication_pipeline,
            str(state.get("message") or ""),
            str(state.get("user_id") or ""),
            user_profile=dict(state.get("patient_profile") or {}),
        )
        output = {"medication_result": result}
        if run_id:
            emit_workflow_trace_event(
                workflow_family="assistant",
                thread_id=str(state.get("thread_id") or ""),
                run_id=run_id,
                event_type="node_completed",
                node_name="medication_node",
                status="ok",
                duration_ms=int((perf_counter() - started) * 1000),
                actor_user_id=str(state.get("user_id") or ""),
                patient_user_id=str(state.get("user_id") or ""),
            )
        return output
    except Exception as exc:
        log.warning("Medication pipeline failed: %s", exc)
        output = {
            "structured_errors": _append_error(
                state,
                code="MedicationPipelineFailed",
                message=str(exc),
                node="medication_node",
            )
        }
        if run_id:
            emit_workflow_trace_event(
                workflow_family="assistant",
                thread_id=str(state.get("thread_id") or ""),
                run_id=run_id,
                event_type="node_completed",
                node_name="medication_node",
                status="error",
                duration_ms=int((perf_counter() - started) * 1000),
                actor_user_id=str(state.get("user_id") or ""),
                patient_user_id=str(state.get("user_id") or ""),
                payload={"error_code": "MedicationPipelineFailed"},
            )
        return output


async def general_chat_node(state: AssistantChatState) -> AssistantChatState:
    started = perf_counter()
    run_id = str(state.get("trace_run_id") or "")
    if run_id:
        emit_workflow_trace_event(
            workflow_family="assistant",
            thread_id=str(state.get("thread_id") or ""),
            run_id=run_id,
            event_type="node_started",
            node_name="general_chat_node",
            actor_user_id=str(state.get("user_id") or ""),
            patient_user_id=str(state.get("user_id") or ""),
        )
    if state.get("clarification_required"):
        actor_role = str(state.get("actor_role") or "").lower()
        output = {"general_response": _clarification_message_for_role(actor_role)}
        if run_id:
            emit_workflow_trace_event(
                workflow_family="assistant",
                thread_id=str(state.get("thread_id") or ""),
                run_id=run_id,
                event_type="node_completed",
                node_name="general_chat_node",
                status="ok",
                duration_ms=int((perf_counter() - started) * 1000),
                actor_user_id=str(state.get("user_id") or ""),
                patient_user_id=str(state.get("user_id") or ""),
                payload={"clarification_required": True},
            )
        return output

    patient = dict(state.get("patient_profile") or {})
    actor_role = str(state.get("actor_role") or "").lower()
    role_line = (
        "You are a professional hospital AI assistant for a doctor portal.\n"
        if actor_role == "doctor"
        else "You are a professional hospital AI assistant for a patient portal.\n"
    )
    prompt = (
        role_line +
        "Help with general health education, hospital app questions, conversation summaries, "
        "and navigation support.\n"
        "Rules:\n"
        "- Do not diagnose disease.\n"
        "- Do not prescribe medication or dosages.\n"
        "- For doctors, provide workflow support and clinical decision-support boundaries, not prescribing decisions.\n"
        "- Encourage urgent care for emergency symptoms.\n"
        "- Keep the answer clear, practical, and under 220 words.\n\n"
        f"Patient Profile: {_patient_summary(patient)}\n"
        f"Recent Messages:\n{_format_recent_messages(list(state.get('recent_messages') or [])) or 'None'}\n\n"
        f"Memory Context:\n{state.get('memory_context') or 'None'}\n\n"
        f"User Message: {state.get('message') or ''}\n\n"
        "Assistant response:"
    )

    try:
        response = await asyncio.to_thread(
            invoke_with_model_fallback_cached,
            prompt,
            temperature=0.7,
        )
        text = str(response.content).strip()
    except Exception as exc:
        classified = classify_llm_error(exc)
        if isinstance(classified, AssistantConfigError):
            raise classified from exc
        log.warning("General assistant LLM failed; using fallback: %s", exc)
        text = _general_chat_fallback_message(state)

    output = {"general_response": text}
    if run_id:
        emit_workflow_trace_event(
            workflow_family="assistant",
            thread_id=str(state.get("thread_id") or ""),
            run_id=run_id,
            event_type="node_completed",
            node_name="general_chat_node",
            status="ok",
            duration_ms=int((perf_counter() - started) * 1000),
            actor_user_id=str(state.get("user_id") or ""),
            patient_user_id=str(state.get("user_id") or ""),
        )
    return output


async def synthesis_node(state: AssistantChatState) -> AssistantChatState:
    started = perf_counter()
    run_id = str(state.get("trace_run_id") or "")
    if run_id:
        emit_workflow_trace_event(
            workflow_family="assistant",
            thread_id=str(state.get("thread_id") or ""),
            run_id=run_id,
            event_type="node_started",
            node_name="synthesis_node",
            actor_user_id=str(state.get("user_id") or ""),
            patient_user_id=str(state.get("user_id") or ""),
        )
    general_response = str(state.get("general_response") or "").strip()
    user_id = str(state.get("user_id") or "")
    if general_response:
        doctor_schedule = state.get("doctor_schedule_result")
        metadata_extra: dict[str, Any] = {
            "actor_role": str(state.get("actor_role") or ""),
        }
        if isinstance(doctor_schedule, dict):
            metadata_extra["doctor_tool_used"] = "list_doctor_appointments_for_day"
            metadata_extra["requested_date"] = doctor_schedule.get("date")
        unified = {
            "message": general_response,
            "message_type": "doctor_schedule" if isinstance(doctor_schedule, dict) else "general_health",
            "patient_user_id": user_id,
            "synthesis_source": ["general"],
            "metadata": {
                "intent_confidence": float(state.get("intent_confidence") or 0.0),
                "intent_source": str(state.get("intent_source") or "message_only"),
                "repeat_guard_triggered": False,
                "clarification_required": bool(state.get("clarification_required") or False),
                **metadata_extra,
            },
        }
        output = {
            "ai_message": general_response,
            "ai_message_type": unified["message_type"],
            "unified_response": unified,
        }
        if run_id:
            emit_workflow_trace_event(
                workflow_family="assistant",
                thread_id=str(state.get("thread_id") or ""),
                run_id=run_id,
                event_type="node_completed",
                node_name="synthesis_node",
                status="ok",
                duration_ms=int((perf_counter() - started) * 1000),
                actor_user_id=str(state.get("user_id") or ""),
                patient_user_id=str(state.get("user_id") or ""),
                payload={"message_type": "general_health"},
            )
        return output

    scoped_need = str(state.get("message") or "").strip()
    synthesis_context = str(state.get("synthesis_context") or "").strip()
    if synthesis_context:
        scoped_need = f"{scoped_need}\n\nContext for continuity only:\n{synthesis_context}"

    result = await asyncio.to_thread(
        synthesize_response,
        patient_profile=dict(state.get("patient_profile") or {}),
        symptom=scoped_need,
        need_text=scoped_need,
        medication_result=state.get("medication_result"),
        doctor_result=state.get("doctor_result"),
        structured_errors=list(state.get("structured_errors") or []),
    )

    unified = result.model_dump(mode="json")
    unified["metadata"] = {
        **dict(unified.get("metadata") or {}),
        "intent_confidence": float(state.get("intent_confidence") or 0.0),
        "intent_source": str(state.get("intent_source") or "message_only"),
        "repeat_guard_triggered": False,
        "clarification_required": bool(state.get("clarification_required") or False),
        "actor_role": str(state.get("actor_role") or ""),
    }

    output = {
        "ai_message": result.message,
        "ai_message_type": result.message_type,
        "unified_response": unified,
    }
    if run_id:
        emit_workflow_trace_event(
            workflow_family="assistant",
            thread_id=str(state.get("thread_id") or ""),
            run_id=run_id,
            event_type="node_completed",
            node_name="synthesis_node",
            status="ok",
            duration_ms=int((perf_counter() - started) * 1000),
            actor_user_id=str(state.get("user_id") or ""),
            patient_user_id=str(state.get("user_id") or ""),
            payload={"message_type": result.message_type},
        )
    return output


def _route_after_intent(state: AssistantChatState) -> str:
    intent = state.get("intent")
    if intent == "doctor_schedule":
        return "doctor_schedule"
    if intent == "doctor_medication_decision_support":
        return "doctor_medication_support"
    if intent == "doctor_general":
        return "general"
    if intent == "combined":
        return "doctor_then_medication"
    if intent == "appointment_only":
        return "doctor"
    if intent == "medication_only":
        return "medication"
    return "general"


def _route_after_doctor(state: AssistantChatState) -> str:
    return "medication" if state.get("intent") == "combined" else "synthesis"


def _build_assistant_graph():
    graph = StateGraph(AssistantChatState)
    graph.add_node("load_profile_node", load_profile_node)
    graph.add_node("load_memory_node", load_memory_node)
    graph.add_node("classify_intent_node", classify_intent_node)
    graph.add_node("doctor_node", doctor_node)
    graph.add_node("doctor_schedule_node", doctor_schedule_node)
    graph.add_node("doctor_medication_support_node", doctor_medication_support_node)
    graph.add_node("medication_node", medication_node)
    graph.add_node("general_chat_node", general_chat_node)
    graph.add_node("synthesis_node", synthesis_node)

    graph.add_edge(START, "load_profile_node")
    graph.add_edge("load_profile_node", "load_memory_node")
    graph.add_edge("load_memory_node", "classify_intent_node")
    graph.add_conditional_edges(
        "classify_intent_node",
        _route_after_intent,
        {
            "general": "general_chat_node",
            "medication": "medication_node",
            "doctor": "doctor_node",
            "doctor_then_medication": "doctor_node",
            "doctor_schedule": "doctor_schedule_node",
            "doctor_medication_support": "doctor_medication_support_node",
        },
    )
    graph.add_conditional_edges(
        "doctor_node",
        _route_after_doctor,
        {
            "medication": "medication_node",
            "synthesis": "synthesis_node",
        },
    )
    graph.add_edge("medication_node", "synthesis_node")
    graph.add_edge("doctor_schedule_node", "synthesis_node")
    graph.add_edge("doctor_medication_support_node", "synthesis_node")
    graph.add_edge("general_chat_node", "synthesis_node")
    graph.add_edge("synthesis_node", END)
    return graph


_ASSISTANT_GRAPH = _build_assistant_graph().compile(checkpointer=get_checkpoint_saver())


def _text_chunks(text: str, chunk_size: int = 80) -> list[str]:
    if not text:
        return []

    chunks: list[str] = []
    remaining = text
    while len(remaining) > chunk_size:
        split_at = max(
            remaining.rfind(". ", 0, chunk_size),
            remaining.rfind("? ", 0, chunk_size),
            remaining.rfind("! ", 0, chunk_size),
            remaining.rfind(" ", 0, chunk_size),
        )
        if split_at < max(20, chunk_size // 3):
            split_at = chunk_size
        else:
            split_at += 1
        chunks.append(remaining[:split_at])
        remaining = remaining[split_at:]
    if remaining:
        chunks.append(remaining)
    return chunks


async def stream_assistant_response(
    *,
    user: User,
    thread_id: str,
    message: str,
    max_suggestions: int = 5,
    recent_messages: list[dict[str, str]] | None = None,
    assistant_context: dict[str, Any] | None = None,
) -> AsyncIterator[dict[str, Any]]:
    log_assistant_llm_status_once()
    if not assistant_llm_is_configured():
        raise AssistantConfigError(
            "Assistant is unavailable: GOOGLE_API_KEY is missing in backend runtime."
        )

    patient_profile = _build_user_profile(user)
    context_role = _actor_role_from_context(dict(assistant_context or {}))
    actor_role = str(context_role or patient_profile.get("role") or "").lower()
    actor_role_source = "context_mode" if context_role else "profile"
    run_id = new_run_id()
    emit_workflow_trace_event(
        workflow_family="assistant",
        thread_id=str(thread_id),
        run_id=run_id,
        event_type="run_started",
        actor_user_id=str(user.user_id),
        patient_user_id=str(user.user_id),
        status="started",
    )
    initial_state: AssistantChatState = {
        "user_id": str(user.user_id),
        "thread_id": str(thread_id),
        "message": message,
        "max_suggestions": max_suggestions,
        "recent_messages": list(recent_messages or []),
        "assistant_context": dict(assistant_context or {}),
        "patient_profile": patient_profile,
        "actor_role": actor_role,
        "actor_role_source": actor_role_source,
        "structured_errors": [],
        "trace_run_id": run_id,
    }
    try:
        final_state = await _ASSISTANT_GRAPH.ainvoke(
            initial_state,
            config=_assistant_graph_config(str(thread_id)),
        )
    except Exception:
        emit_workflow_trace_event(
            workflow_family="assistant",
            thread_id=str(thread_id),
            run_id=run_id,
            event_type="run_failed",
            actor_user_id=str(user.user_id),
            patient_user_id=str(user.user_id),
            status="error",
        )
        raise

    ai_message = str(final_state.get("ai_message") or "").strip()
    if not ai_message:
        ai_message = "I am sorry, but I could not generate a response. Please try again."

    unified_response = dict(final_state.get("unified_response") or {})
    metadata = dict(unified_response.get("metadata") or {})
    repeat_guard_triggered = False
    clarification_required = bool(final_state.get("clarification_required") or metadata.get("clarification_required"))

    last_assistant = _last_assistant_message(list(recent_messages or []))
    similarity = _similarity(ai_message, last_assistant)
    if not clarification_required and last_assistant and similarity >= 0.86:
        repeat_guard_triggered = True
        intent = str(final_state.get("intent") or "")
        if intent == "appointment_only":
            ai_message = "I can help find the right doctor for your case. Share your main symptom or preferred specialty, and I will suggest the best available matches."
            final_state["ai_message_type"] = "appointment"
        elif intent == "medication_only":
            ai_message = "I can help with medication safety for your current symptoms. Tell me the symptom and any medications you already took so I can guide you safely."
            final_state["ai_message_type"] = "medication"
        else:
            ai_message = _clarification_message()
            clarification_required = True
            final_state["ai_message_type"] = "general_health"

    for chunk in _text_chunks(ai_message):
        yield {"type": "delta", "content": chunk}

    unified_response.setdefault("message", ai_message)
    unified_response.setdefault("message_type", final_state.get("ai_message_type") or "general_health")
    unified_response.setdefault("patient_user_id", str(user.user_id))
    unified_response["message"] = ai_message
    metadata = dict(unified_response.get("metadata") or {})
    metadata["intent_confidence"] = float(final_state.get("intent_confidence") or metadata.get("intent_confidence") or 0.0)
    metadata["intent_source"] = str(final_state.get("intent_source") or metadata.get("intent_source") or "message_only")
    metadata["repeat_guard_triggered"] = repeat_guard_triggered or bool(metadata.get("repeat_guard_triggered"))
    metadata["clarification_required"] = clarification_required
    metadata["trace_run_id"] = run_id
    metadata["actor_role"] = str(final_state.get("actor_role") or actor_role or metadata.get("actor_role") or "")
    metadata["role_source"] = str(final_state.get("actor_role_source") or actor_role_source)
    unified_response["metadata"] = metadata
    emit_workflow_trace_event(
        workflow_family="assistant",
        thread_id=str(thread_id),
        run_id=run_id,
        event_type="run_completed",
        actor_user_id=str(user.user_id),
        patient_user_id=str(user.user_id),
        status="ok",
        payload={
            "intent_route": str(final_state.get("intent") or ""),
            "intent_source": str(final_state.get("intent_source") or "message_only"),
            "intent_confidence": float(final_state.get("intent_confidence") or 0.0),
            "clarification_required": clarification_required,
            "message_type": unified_response.get("message_type"),
        },
    )
    yield {"type": "complete", "response": unified_response}


__all__ = [
    "AssistantChatState",
    "_ASSISTANT_GRAPH",
    "_assistant_graph_config",
    "_build_assistant_graph",
    "_build_user_profile",
    "_detect_intents",
    "_format_recent_messages",
    "classify_intent_node",
    "doctor_node",
    "doctor_schedule_node",
    "doctor_medication_support_node",
    "general_chat_node",
    "load_memory_node",
    "load_profile_node",
    "medication_node",
    "stream_assistant_response",
    "synthesis_node",
]
