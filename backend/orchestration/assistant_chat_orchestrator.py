from __future__ import annotations

import asyncio
import difflib
import logging
import re
from datetime import date
from typing import Any, AsyncIterator, Literal, TypedDict

from langgraph.graph import END, START, StateGraph

try:
    from app.models.user import User
    from memory import memory_tools
    from orchestration.checkpoint_store import get_checkpoint_saver
    from orchestration.synthesis import synthesize_response
    from orchestration.supervisor_workflow import execute_doctor_match_workflow
    from tools.medication_tools import medication_pipeline
    from shared.gemini import (
        AssistantConfigError,
        assistant_llm_is_configured,
        classify_llm_error,
        invoke_with_model_fallback,
        log_assistant_llm_status_once,
    )
except ImportError:  # Fallback for backend package context
    from app.models.user import User
    from backend.memory import memory_tools
    from backend.orchestration.checkpoint_store import get_checkpoint_saver
    from backend.orchestration.synthesis import synthesize_response
    from backend.orchestration.supervisor_workflow import execute_doctor_match_workflow
    from backend.tools.medication_tools import medication_pipeline
    from backend.shared.gemini import (
        AssistantConfigError,
        assistant_llm_is_configured,
        classify_llm_error,
        invoke_with_model_fallback,
        log_assistant_llm_status_once,
    )

log = logging.getLogger(__name__)


AssistantRoute = Literal[
    "appointment_only",
    "combined",
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
    user_id: str
    thread_id: str
    message: str
    max_suggestions: int
    recent_messages: list[dict[str, str]]

    patient_profile: dict[str, Any]
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
    return {
        "user_id": str(user.user_id),
        "first_name": user.first_name,
        "last_name": user.last_name,
        "age": age,
        "gender": user.gender,
        "allergies": user.allergies or [],
        "chronic_conditions": user.chronic_conditions or [],
    }


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
    patient_profile = dict(state.get("patient_profile") or {})
    if not patient_profile.get("user_id") and state.get("user_id"):
        patient_profile["user_id"] = state["user_id"]
    return {"patient_profile": patient_profile}


async def load_memory_node(state: AssistantChatState) -> AssistantChatState:
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

    return {
        "memory_context": memory_context,
        "contextual_message": contextual_message,
        "synthesis_context": synthesis_context,
        "structured_errors": errors,
    }


async def classify_intent_node(state: AssistantChatState) -> AssistantChatState:
    message = str(state.get("message") or "")
    base = _detect_intents(message)
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
            assisted = _detect_intents(context_text)
            route = assisted["route"]
            confidence = max(confidence, float(assisted.get("confidence") or 0.65))
            source = "context_assisted"

    if confidence < 0.4:
        clarification_required = True
        source = "clarified"
        route = "general_health"

    intents = dict(base)
    intents["route"] = route
    intents["confidence"] = confidence
    intents["source"] = source
    return {
        "intents": intents,
        "intent": route,
        "intent_confidence": confidence,
        "intent_source": source,
        "clarification_required": clarification_required,
    }


async def doctor_node(state: AssistantChatState) -> AssistantChatState:
    thread_id = str(state.get("thread_id") or "").strip()
    user_id = str(state.get("user_id") or "").strip()
    try:
        result = await execute_doctor_match_workflow(
            {
                "thread_id": f"doctor:{thread_id}",
                "actor_user_id": user_id,
                "patient_user_id": user_id,
                "need_text": str(state.get("message") or ""),
                "max_suggestions": int(state.get("max_suggestions") or 5),
            }
        )
        return {"doctor_result": result}
    except Exception as exc:
        log.warning("Doctor workflow failed: %s", exc)
        return {
            "structured_errors": _append_error(
                state,
                code="DoctorWorkflowFailed",
                message=str(exc),
                node="doctor_node",
            )
        }


async def medication_node(state: AssistantChatState) -> AssistantChatState:
    try:
        result = await asyncio.to_thread(
            medication_pipeline,
            str(state.get("message") or ""),
            str(state.get("user_id") or ""),
            user_profile=dict(state.get("patient_profile") or {}),
        )
        return {"medication_result": result}
    except Exception as exc:
        log.warning("Medication pipeline failed: %s", exc)
        return {
            "structured_errors": _append_error(
                state,
                code="MedicationPipelineFailed",
                message=str(exc),
                node="medication_node",
            )
        }


async def general_chat_node(state: AssistantChatState) -> AssistantChatState:
    if state.get("clarification_required"):
        return {"general_response": _clarification_message()}

    patient = dict(state.get("patient_profile") or {})
    prompt = (
        "You are a professional hospital AI assistant for a patient portal.\n"
        "Help with general health education, hospital app questions, conversation summaries, "
        "and navigation support.\n"
        "Rules:\n"
        "- Do not diagnose disease.\n"
        "- Do not prescribe medication or dosages.\n"
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
            invoke_with_model_fallback,
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

    return {"general_response": text}


async def synthesis_node(state: AssistantChatState) -> AssistantChatState:
    general_response = str(state.get("general_response") or "").strip()
    user_id = str(state.get("user_id") or "")
    if general_response:
        unified = {
            "message": general_response,
            "message_type": "general_health",
            "patient_user_id": user_id,
            "synthesis_source": ["general"],
            "metadata": {
                "intent_confidence": float(state.get("intent_confidence") or 0.0),
                "intent_source": str(state.get("intent_source") or "message_only"),
                "repeat_guard_triggered": False,
                "clarification_required": bool(state.get("clarification_required") or False),
            },
        }
        return {
            "ai_message": general_response,
            "ai_message_type": "general_health",
            "unified_response": unified,
        }

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
    }

    return {
        "ai_message": result.message,
        "ai_message_type": result.message_type,
        "unified_response": unified,
    }


def _route_after_intent(state: AssistantChatState) -> str:
    intent = state.get("intent")
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
) -> AsyncIterator[dict[str, Any]]:
    log_assistant_llm_status_once()
    if not assistant_llm_is_configured():
        raise AssistantConfigError(
            "Assistant is unavailable: GOOGLE_API_KEY is missing in backend runtime."
        )

    patient_profile = _build_user_profile(user)
    initial_state: AssistantChatState = {
        "user_id": str(user.user_id),
        "thread_id": str(thread_id),
        "message": message,
        "max_suggestions": max_suggestions,
        "recent_messages": list(recent_messages or []),
        "patient_profile": patient_profile,
        "structured_errors": [],
    }
    final_state = await _ASSISTANT_GRAPH.ainvoke(
        initial_state,
        config=_assistant_graph_config(str(thread_id)),
    )

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
    unified_response["metadata"] = metadata
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
    "general_chat_node",
    "load_memory_node",
    "load_profile_node",
    "medication_node",
    "stream_assistant_response",
    "synthesis_node",
]
