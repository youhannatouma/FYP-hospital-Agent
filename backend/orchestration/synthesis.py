"""Unified AI response synthesis — generates a single elaborate message
from medication and/or appointment tool outputs.

Phase 5: Adds a LangGraph synthesis node and a standalone synthesizer
so the backend returns both a rich AI message and structured JSON.
"""
from __future__ import annotations

import asyncio
import json
import logging
from typing import Any, AsyncIterator, Literal

from langchain_google_genai import ChatGoogleGenerativeAI

try:
    from app.schemas.unified_agent_response import (
        ActionButton,
        AppointmentResult,
        MedicationResult,
        UnifiedAgentResponse,
    )
except ImportError:  # Fallback for backend package context
    from ..app.schemas.unified_agent_response import (
        ActionButton,
        AppointmentResult,
        MedicationResult,
        UnifiedAgentResponse,
    )

log = logging.getLogger(__name__)

_llm: ChatGoogleGenerativeAI | None = None


def _get_llm() -> ChatGoogleGenerativeAI:
    global _llm
    if _llm is None:
        _llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.7)
    return _llm


# ── Prompt templates ────────────────────────────────────────────────────

_MEDICATION_ONLY_PROMPT = (
    "You are a licensed hospital pharmacist writing a professional medication recommendation.\n"
    "Tone: authoritative yet caring, like a senior pharmacist explaining a prescription.\n"
    "Instructions:\n"
    "  - Greet the patient by name if available.\n"
    "  - Summarize the symptom briefly.\n"
    "  - Recommend 1–2 medications with brand names, active substances, and dosage.\n"
    "  - Highlight any allergy warnings or contraindications explicitly.\n"
    "  - End with a mandatory disclaimer: 'Please consult your physician or pharmacist before starting any new medication.'\n"
    "  - Keep under 200 words.\n\n"
    "Patient Profile: {patient_summary}\n"
    "Symptom: {symptom}\n"
    "Medications found in formulary: {medication_summary}\n"
    "Top safe candidates (verified against allergies/interactions): {top_candidates}\n\n"
    "Pharmacist's recommendation:"
)

_APPOINTMENT_ONLY_PROMPT = (
    "You are a professional hospital secretary scheduling appointments.\n"
    "Tone: courteous, efficient, and reassuring — like a front-desk coordinator.\n"
    "Instructions:\n"
    "  - Greet the patient by name if available.\n"
    "  - Acknowledge their health need.\n"
    "  - Present the top 1–2 doctor matches with name, specialty, and next availability.\n"
    "  - Mention session price if available.\n"
    "  - If a booking was successful, confirm date, time, and doctor.\n"
    "  - If not booked, politely explain what information is still needed.\n"
    "  - Keep under 200 words.\n\n"
    "Patient Profile: {patient_summary}\n"
    "Health Need: {need_text}\n"
    "Doctor Matches: {doctor_summary}\n"
    "Booking Status: {booking_summary}\n\n"
    "Secretary's message:"
)

_COMBINED_PROMPT = (
    "You are a unified hospital AI assistant — part pharmacist, part secretary.\n"
    "Tone: professional, warm, and organized. Address the patient by name if known.\n"
    "Structure your response in two clear sections:\n\n"
    "  **Medication Guidance** (pharmacist voice):\n"
    "    - Summarize the symptom.\n"
    "    - Recommend 1–2 safe medications with dosage.\n"
    "    - Highlight allergy/interaction warnings.\n\n"
    "  **Appointment Scheduling** (secretary voice):\n"
    "    - Acknowledge the health need.\n"
    "    - Present the best doctor match with specialty and availability.\n"
    "    - Confirm booking details if booked, or list missing info.\n\n"
    "Rules:\n"
    "  - Cross-reference when relevant (e.g., allergies affecting both meds and doctor specialty).\n"
    "  - End with: 'Please consult your physician or pharmacist before starting any new medication.'\n"
    "  - Keep total under 280 words.\n\n"
    "Patient Profile: {patient_summary}\n"
    "Symptom / Need: {symptom}\n"
    "Medications found: {medication_summary}\n"
    "Top safe candidates: {top_candidates}\n"
    "Doctor Matches: {doctor_summary}\n"
    "Booking Status: {booking_summary}\n\n"
    "Unified Assistant Response:"
)

_ERROR_PROMPT = (
    "You are a hospital support assistant.\n"
    "Something went wrong while helping the patient.\n"
    "Write a brief, empathetic apology (under 80 words) explaining the issue\n"
    "and suggesting next steps (try again, contact support, or visit the front desk).\n\n"
    "Error context: {error_context}\n\n"
    "Support message:"
)


# ── Formatting helpers ──────────────────────────────────────────────────

def _patient_summary(patient: dict[str, Any]) -> str:
    parts = []
    name = f"{patient.get('first_name', '')} {patient.get('last_name', '')}".strip()
    if name:
        parts.append(name)
    age = patient.get("age")
    if age is not None:
        parts.append(f"{age} years old")
    gender = patient.get("gender")
    if gender:
        parts.append(gender)
    allergies = patient.get("allergies")
    if allergies:
        parts.append(f"allergies: {', '.join(str(a) for a in allergies)}")
    conditions = patient.get("chronic_conditions")
    if conditions:
        parts.append(f"conditions: {', '.join(str(c) for c in conditions)}")
    return "; ".join(parts) or "Unknown patient"


def _medication_summary(med_result: dict[str, Any] | None) -> str:
    if not med_result:
        return "No medication data available."
    drugs_found = med_result.get("drugs_found", 0)
    safe = med_result.get("safe", [])
    flagged = med_result.get("flagged", [])
    lines = [f"{drugs_found} drug(s) queried."]
    if safe:
        lines.append(f"{len(safe)} passed safety screening.")
    if flagged:
        lines.append(f"{len(flagged)} flagged for review.")
    return " ".join(lines)


def _top_candidates_summary(med_result: dict[str, Any] | None) -> str:
    top = med_result.get("top_candidates", []) if med_result else []
    if not top:
        return "None available."
    out = []
    for c in top[:2]:
        brands = c.get("brand_names", [])
        name = brands[0] if brands else "Unknown"
        substances = c.get("substances", [])
        subs = f" (active: {', '.join(substances)})" if substances else ""
        dosage = c.get("dosage", "")
        dose_str = f" — Dosage: {dosage}" if dosage else ""
        out.append(f"{name}{subs}{dose_str}")
    return "; ".join(out)


def _doctor_summary(doctor_result: dict[str, Any] | None) -> str:
    if not doctor_result:
        return "No doctor data available."
    cards = doctor_result.get("suggestion_cards", [])
    if not cards:
        return "No matching doctors found."
    lines = []
    for c in cards[:2]:
        name = c.get("doctor_name", "Unknown")
        specialty = c.get("specialty", "")
        price = c.get("session_price")
        price_str = f", ${price:.0f}/session" if price else ""
        avail = c.get("earliest_available_at", "")
        avail_str = f", next available: {avail}" if avail else ""
        lines.append(f"{name} ({specialty}){price_str}{avail_str}")
    return "; ".join(lines)


def _booking_summary(doctor_result: dict[str, Any] | None) -> str:
    if not doctor_result:
        return "No booking attempted."
    mode = doctor_result.get("booking_mode", "suggest_only")
    if mode == "suggest_only":
        missing = doctor_result.get("booking_missing_fields", [])
        if missing:
            return f"Suggestion only — awaiting: {', '.join(missing)}."
        return "Suggestion only — no booking made."
    if mode == "booked":
        booking = doctor_result.get("booking_result", {})
        doctor_name = booking.get("doctor_name") or booking.get("doctor_id", "Unknown")
        date = booking.get("appointment_date", "")
        time = booking.get("appointment_time", "")
        return f"Confirmed with {doctor_name} on {date} at {time}."
    if mode == "booking_failed":
        code = doctor_result.get("booking_result", {}).get("code", "Unknown")
        return f"Booking failed — reason: {code}."
    return "Unknown booking state."


def _error_context(state: dict[str, Any]) -> str:
    errors = state.get("structured_errors", [])
    if not errors:
        return "An unexpected error occurred."
    return "; ".join(f"{e.get('code')}: {e.get('message')}" for e in errors[:3])


# ── Action extraction ───────────────────────────────────────────────────

def _extract_actions(
    doctor_result: dict[str, Any] | None,
    med_result: dict[str, Any] | None,
) -> list[ActionButton]:
    actions: list[ActionButton] = []

    if doctor_result:
        mode = doctor_result.get("booking_mode", "suggest_only")
        cards = doctor_result.get("suggestion_cards", [])
        if mode == "suggest_only" and cards:
            top = cards[0]
            actions.append(ActionButton(
                label="Book Appointment",
                action="book",
                payload={
                    "doctor_id": top.get("doctor_id"),
                    "doctor_name": top.get("doctor_name"),
                },
            ))
        elif mode == "booked":
            booking = doctor_result.get("booking_result", {})
            actions.append(ActionButton(
                label="View Appointment",
                action="view_profile",
                payload={
                    "appointment_id": booking.get("appointment_id"),
                    "doctor_id": booking.get("doctor_id"),
                },
            ))

    if med_result and med_result.get("top_candidates"):
        actions.append(ActionButton(
            label="View Medications",
            action="expand_meds",
            payload={"drug_count": med_result.get("drugs_found", 0)},
        ))

    return actions


# ── Core synthesis ──────────────────────────────────────────────────────

def synthesize_response(
    *,
    patient_profile: dict[str, Any],
    symptom: str,
    need_text: str,
    medication_result: dict[str, Any] | None = None,
    doctor_result: dict[str, Any] | None = None,
    structured_errors: list[dict[str, Any]] | None = None,
) -> UnifiedAgentResponse:
    """Generate a single cohesive AI message from tool outputs.

    Returns both the natural-language message and structured data.
    """
    patient_summary = _patient_summary(patient_profile)
    has_med = medication_result is not None and medication_result.get("drugs_found", 0) > 0
    has_appt = doctor_result is not None

    # Determine message type
    if structured_errors and not has_med and not has_appt:
        message_type: Literal["medication", "appointment", "combined", "error"] = "error"
    elif has_med and has_appt:
        message_type = "combined"
    elif has_med:
        message_type = "medication"
    elif has_appt:
        message_type = "appointment"
    else:
        message_type = "error"

    # Build prompt
    if message_type == "error":
        prompt = _ERROR_PROMPT.format(
            error_context=_error_context({"structured_errors": structured_errors or []}),
        )
    elif message_type == "medication":
        prompt = _MEDICATION_ONLY_PROMPT.format(
            patient_summary=patient_summary,
            symptom=symptom or need_text,
            medication_summary=_medication_summary(medication_result),
            top_candidates=_top_candidates_summary(medication_result),
        )
    elif message_type == "appointment":
        prompt = _APPOINTMENT_ONLY_PROMPT.format(
            patient_summary=patient_summary,
            need_text=need_text,
            doctor_summary=_doctor_summary(doctor_result),
            booking_summary=_booking_summary(doctor_result),
        )
    else:  # combined
        prompt = _COMBINED_PROMPT.format(
            patient_summary=patient_summary,
            symptom=symptom or need_text,
            medication_summary=_medication_summary(medication_result),
            top_candidates=_top_candidates_summary(medication_result),
            doctor_summary=_doctor_summary(doctor_result),
            booking_summary=_booking_summary(doctor_result),
        )

    # Invoke LLM
    try:
        llm = _get_llm()
        resp = llm.invoke(prompt)
        message = str(resp.content).strip()
    except Exception as exc:
        log.error("Synthesis LLM call failed: %s", exc)
        message = (
            "I apologize, but I'm unable to generate a detailed response at the moment. "
            "Please contact our front desk for assistance."
        )
        message_type = "error"

    # Build structured results
    med_struct = None
    if medication_result:
        med_struct = MedicationResult(
            drugs_found=medication_result.get("drugs_found", 0),
            safe_count=len(medication_result.get("safe", [])),
            flagged_count=len(medication_result.get("flagged", [])),
            top_candidates=medication_result.get("top_candidates", []),
            response=medication_result.get("response", ""),
        )

    appt_struct = None
    if doctor_result:
        appt_struct = AppointmentResult(
            booking_mode=doctor_result.get("booking_mode", "suggest_only"),
            booking_ready=doctor_result.get("booking_ready", False),
            suggestions=doctor_result.get("suggestion_cards", []),
            booking_outcome=doctor_result.get("booking_result"),
            missing_fields=doctor_result.get("booking_missing_fields", []),
        )

    actions = _extract_actions(doctor_result, medication_result)

    return UnifiedAgentResponse(
        message=message,
        message_type=message_type,
        medication_result=med_struct,
        appointment_result=appt_struct,
        suggested_actions=actions,
        thread_id=str(doctor_result.get("thread_id", "") if doctor_result else ""),
        patient_user_id=str(patient_profile.get("user_id", "")),
        synthesis_source=[
            *("medication" if has_med else []),
            *("appointment" if has_appt else []),
        ],
    )


# ── Streaming synthesis ─────────────────────────────────────────────────

async def stream_synthesize_response(
    *,
    patient_profile: dict[str, Any],
    symptom: str,
    need_text: str,
    medication_result: dict[str, Any] | None = None,
    doctor_result: dict[str, Any] | None = None,
    structured_errors: list[dict[str, Any]] | None = None,
) -> AsyncIterator[dict[str, Any]]:
    """Stream the AI message token-by-token (ChatGPT-style).

    Yields:
        {"type": "delta", "content": "..."}  — text chunks
        {"type": "complete", "response": UnifiedAgentResponse} — final payload
    """
    # First, build the prompt exactly like the non-streaming version
    patient_summary = _patient_summary(patient_profile)
    has_med = medication_result is not None and medication_result.get("drugs_found", 0) > 0
    has_appt = doctor_result is not None

    if structured_errors and not has_med and not has_appt:
        message_type = "error"
    elif has_med and has_appt:
        message_type = "combined"
    elif has_med:
        message_type = "medication"
    elif has_appt:
        message_type = "appointment"
    else:
        message_type = "error"

    if message_type == "error":
        prompt = _ERROR_PROMPT.format(
            error_context=_error_context({"structured_errors": structured_errors or []}),
        )
    elif message_type == "medication":
        prompt = _MEDICATION_ONLY_PROMPT.format(
            patient_summary=patient_summary,
            symptom=symptom or need_text,
            medication_summary=_medication_summary(medication_result),
            top_candidates=_top_candidates_summary(medication_result),
        )
    elif message_type == "appointment":
        prompt = _APPOINTMENT_ONLY_PROMPT.format(
            patient_summary=patient_summary,
            need_text=need_text,
            doctor_summary=_doctor_summary(doctor_result),
            booking_summary=_booking_summary(doctor_result),
        )
    else:
        prompt = _COMBINED_PROMPT.format(
            patient_summary=patient_summary,
            symptom=symptom or need_text,
            medication_summary=_medication_summary(medication_result),
            top_candidates=_top_candidates_summary(medication_result),
            doctor_summary=_doctor_summary(doctor_result),
            booking_summary=_booking_summary(doctor_result),
        )

    # Stream tokens
    full_message = ""
    try:
        llm = _get_llm()
        # Gemini via langchain-google-genai supports streaming via astream
        for chunk in llm.stream(prompt):
            text = str(chunk.content)
            full_message += text
            yield {"type": "delta", "content": text}
    except Exception as exc:
        log.error("Streaming synthesis failed: %s", exc)
        fallback = (
            "I apologize, but I'm unable to generate a detailed response at the moment. "
            "Please contact our front desk for assistance."
        )
        if not full_message:
            full_message = fallback
            yield {"type": "delta", "content": fallback}
        message_type = "error"

    # Build final structured response
    med_struct = None
    if medication_result:
        med_struct = MedicationResult(
            drugs_found=medication_result.get("drugs_found", 0),
            safe_count=len(medication_result.get("safe", [])),
            flagged_count=len(medication_result.get("flagged", [])),
            top_candidates=medication_result.get("top_candidates", []),
            response=medication_result.get("response", ""),
        )

    appt_struct = None
    if doctor_result:
        appt_struct = AppointmentResult(
            booking_mode=doctor_result.get("booking_mode", "suggest_only"),
            booking_ready=doctor_result.get("booking_ready", False),
            suggestions=doctor_result.get("suggestion_cards", []),
            booking_outcome=doctor_result.get("booking_result"),
            missing_fields=doctor_result.get("booking_missing_fields", []),
        )

    actions = _extract_actions(doctor_result, medication_result)

    final_response = UnifiedAgentResponse(
        message=full_message.strip(),
        message_type=message_type,
        medication_result=med_struct,
        appointment_result=appt_struct,
        suggested_actions=actions,
        thread_id=str(doctor_result.get("thread_id", "") if doctor_result else ""),
        patient_user_id=str(patient_profile.get("user_id", "")),
        synthesis_source=[
            *("medication" if has_med else []),
            *("appointment" if has_appt else []),
        ],
    )

    yield {"type": "complete", "response": final_response.model_dump(mode="json")}


# ── LangGraph node wrapper ──────────────────────────────────────────────

async def synthesize_node(state: dict[str, Any]) -> dict[str, Any]:
    """LangGraph-compatible synthesis node.

    Expects state keys:
        - patient_profile_snapshot
        - need_text
        - inferred_need
        - medication_result (optional, injected upstream)
        - suggestion_cards, booking_mode, booking_result, booking_missing_fields
        - structured_errors
    """
    patient = state.get("patient_profile_snapshot", {})
    need = str(state.get("need_text") or state.get("inferred_need") or "").strip()
    med = state.get("medication_result")

    # Build doctor_result subset from state
    doctor = {
        "thread_id": state.get("thread_id"),
        "suggestion_cards": state.get("suggestion_cards", []),
        "booking_mode": state.get("booking_mode", "suggest_only"),
        "booking_result": state.get("booking_result"),
        "booking_missing_fields": state.get("booking_missing_fields", []),
        "booking_ready": state.get("booking_ready", False),
    } if state.get("suggestion_cards") is not None else None

    errors = state.get("structured_errors", [])

    result = await asyncio.to_thread(
        synthesize_response,
        patient_profile=patient,
        symptom=need,
        need_text=need,
        medication_result=med,
        doctor_result=doctor,
        structured_errors=errors,
    )

    return {
        "ai_message": result.message,
        "ai_message_type": result.message_type,
        "unified_response": result.model_dump(mode="json"),
    }


__all__ = [
    "synthesize_response",
    "stream_synthesize_response",
    "synthesize_node",
]
