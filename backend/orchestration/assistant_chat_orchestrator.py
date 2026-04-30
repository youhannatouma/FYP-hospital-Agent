from __future__ import annotations

import asyncio
import logging
import re
from datetime import date
from typing import Any, AsyncIterator, Literal, TypedDict

try:
    from app.models.user import User
    from memory import memory_tools
    from orchestration.synthesis import stream_synthesize_response
    from orchestration.supervisor_workflow import execute_doctor_match_workflow
    from tools.medication_tools import medication_pipeline
    from shared.gemini import AssistantConfigError, assistant_llm_is_configured, log_assistant_llm_status_once
except ImportError:  # Fallback for backend package context
    from app.models.user import User
    from backend.memory import memory_tools
    from backend.orchestration.synthesis import stream_synthesize_response
    from backend.orchestration.supervisor_workflow import execute_doctor_match_workflow
    from backend.tools.medication_tools import medication_pipeline
    from backend.shared.gemini import AssistantConfigError, assistant_llm_is_configured, log_assistant_llm_status_once

log = logging.getLogger(__name__)


AssistantRoute = Literal[
    "appointment_only",
    "combined",
    "general_health",
    "medication_only",
]


class DetectedIntents(TypedDict):
    medication: bool
    appointment: bool
    general_health: bool
    combined: bool
    route: AssistantRoute


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
    }


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

    intents = _detect_intents(message)
    patient_profile = _build_user_profile(user)
    med_result = None
    doctor_result = None
    errors: list[dict[str, Any]] = []
    recent_messages = recent_messages or []

    try:
        memory_context = memory_tools.memory_context(str(user.user_id), message, k=5)
    except Exception as exc:
        log.warning("Memory recall failed: %s", exc)
        memory_context = ""

    context_parts = []
    recent_context = _format_recent_messages(recent_messages)
    if recent_context:
        context_parts.append(f"Recent context:\n{recent_context}")
    if memory_context:
        context_parts.append(memory_context)
    contextual_message = message
    if context_parts:
        contextual_message = f"{message}\n\n" + "\n\n".join(context_parts)

    route = str(intents.get("route") or "")
    if route in {"appointment_only", "combined"}:
        try:
            doctor_result = await execute_doctor_match_workflow(
                {
                    "thread_id": str(thread_id),
                    "actor_user_id": str(user.user_id),
                    "patient_user_id": str(user.user_id),
                    "need_text": message,
                    "max_suggestions": max_suggestions,
                }
            )
        except Exception as exc:
            log.warning("Doctor workflow failed: %s", exc)
            errors.append({"code": "DoctorWorkflowFailed", "message": str(exc)})

    if route in {"medication_only", "combined"}:
        try:
            med_result = await asyncio.to_thread(
                medication_pipeline,
                message,
                str(user.user_id),
                user_profile=patient_profile,
            )
        except Exception as exc:
            log.warning("Medication pipeline failed: %s", exc)
            errors.append({"code": "MedicationPipelineFailed", "message": str(exc)})

    # Health education prompts should not fall into the generic error-only path.
    if intents.get("general_health") and med_result is None and doctor_result is None and not errors:
        log.info("Assistant general-health guidance intent selected for thread=%s", thread_id)

    async for chunk in stream_synthesize_response(
        patient_profile=patient_profile,
        symptom=contextual_message,
        need_text=contextual_message,
        medication_result=med_result,
        doctor_result=doctor_result,
        structured_errors=errors,
    ):
        yield chunk
