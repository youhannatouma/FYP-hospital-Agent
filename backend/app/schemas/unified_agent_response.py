"""Unified response schema for AI-generated assistant messages.

Returns both a rich natural-language message and structured data
so the frontend can render the message and attach interactive actions.
"""
from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


class ActionButton(BaseModel):
    """Suggested UI action extracted from the AI message."""

    model_config = ConfigDict(extra="forbid")

    label: str
    action: Literal["book", "expand_meds", "call_doctor", "view_profile", "retry", "none"]
    payload: dict[str, Any] = Field(default_factory=dict)


class MedicationResult(BaseModel):
    """Structured medication outcome for frontend display."""

    model_config = ConfigDict(extra="forbid")

    drugs_found: int = 0
    safe_count: int = 0
    flagged_count: int = 0
    top_candidates: list[dict[str, Any]] = Field(default_factory=list)
    response: str = ""


class AppointmentResult(BaseModel):
    """Structured appointment outcome for frontend display."""

    model_config = ConfigDict(extra="forbid")

    booking_mode: Literal["suggest_only", "booked", "booking_failed"] = "suggest_only"
    booking_ready: bool = False
    suggestions: list[dict[str, Any]] = Field(default_factory=list)
    booking_outcome: dict[str, Any] | None = None
    missing_fields: list[str] = Field(default_factory=list)


class UnifiedAgentRequest(BaseModel):
    """Request for the unified assistant endpoint.

    Combines fields for medication + doctor matching so a single
    call can run either or both pipelines.
    """

    model_config = ConfigDict(extra="forbid")

    thread_id: str = Field(min_length=1)
    actor_user_id: str = Field(min_length=1)
    patient_user_id: str = Field(min_length=1)
    need_text: str = Field(min_length=2, max_length=500)

    # Medication scope
    include_medication: bool = True
    symptom: str | None = Field(default=None, max_length=500)

    # Appointment scope
    include_appointment: bool = True
    booking: dict[str, Any] | None = Field(default=None)
    max_suggestions: int = Field(default=5, ge=1, le=10)

    # Streaming
    stream: bool = False


class UnifiedAgentResponse(BaseModel):
    """Response that carries both an AI message and structured data."""

    model_config = ConfigDict(extra="forbid")

    message: str
    message_type: Literal["medication", "appointment", "combined", "error"]

    # Structured payloads for frontend interactive elements
    medication_result: MedicationResult | None = None
    appointment_result: AppointmentResult | None = None

    # Actionable UI elements
    suggested_actions: list[ActionButton] = Field(default_factory=list)

    # Debug / telemetry
    thread_id: str = ""
    patient_user_id: str = ""
    synthesis_source: list[str] = Field(default_factory=list)


__all__ = [
    "ActionButton",
    "MedicationResult",
    "AppointmentResult",
    "UnifiedAgentRequest",
    "UnifiedAgentResponse",
]
