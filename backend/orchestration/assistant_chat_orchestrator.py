from __future__ import annotations

import asyncio
import logging
from typing import Any, AsyncIterator

try:
    from app.models.user import User
    from memory import memory_tools
    from orchestration.synthesis import stream_synthesize_response
    from orchestration.supervisor_workflow import execute_doctor_match_workflow
    from tools.medication_tools import medication_pipeline
except ImportError:  # Fallback for backend package context
    from app.models.user import User
    from backend.memory import memory_tools
    from backend.orchestration.synthesis import stream_synthesize_response
    from backend.orchestration.supervisor_workflow import execute_doctor_match_workflow
    from backend.tools.medication_tools import medication_pipeline

log = logging.getLogger(__name__)


def _build_user_profile(user: User) -> dict[str, Any]:
    return {
        "user_id": str(user.user_id),
        "first_name": user.first_name,
        "last_name": user.last_name,
        "age": None,
        "gender": user.gender,
        "allergies": user.allergies or [],
        "chronic_conditions": user.chronic_conditions or [],
    }


def _detect_intents(message: str) -> dict[str, bool]:
    lowered = (message or "").lower()
    return {
        "medication": any(k in lowered for k in ["medication", "medicine", "drug", "prescription", "dose", "dosage"]),
        "appointment": any(k in lowered for k in ["appointment", "schedule", "book", "doctor", "visit", "clinic"]),
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

    if intents["medication"]:
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

    if intents["appointment"]:
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

    async for chunk in stream_synthesize_response(
        patient_profile=patient_profile,
        symptom=contextual_message,
        need_text=contextual_message,
        medication_result=med_result,
        doctor_result=doctor_result,
        structured_errors=errors,
    ):
        yield chunk
