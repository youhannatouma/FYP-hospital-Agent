from __future__ import annotations

from datetime import date, time
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class PhaseScopeBoundaries(BaseModel):
    """Explicit phase scope contract for v1 implementation planning and responses."""

    model_config = ConfigDict(extra="forbid")

    included: tuple[str, ...] = (
        "profile",
        "matching",
        "suggestions",
        "conditional_booking",
    )
    excluded: tuple[str, ...] = (
        "payment_processing",
        "reminders",
    )


class PatientProfileSnapshot(BaseModel):
    model_config = ConfigDict(extra="forbid")

    user_id: str
    first_name: str | None = None
    last_name: str | None = None
    age: int | None = None
    gender: str | None = None
    allergies: list[str] = Field(default_factory=list)
    chronic_conditions: list[str] = Field(default_factory=list)


class DoctorSuggestionCard(BaseModel):
    model_config = ConfigDict(extra="forbid")

    doctor_id: str
    doctor_name: str
    specialty: str | None = None
    clinic_address: str | None = None
    session_price: float | None = None
    earliest_available_at: str | None = None
    ranking_score: float = Field(ge=0)
    rationale: str


class BookingSelectionInput(BaseModel):
    """Optional booking fields.

    If any required booking field is missing, the workflow must not book and should
    return suggestion-only output.
    """

    model_config = ConfigDict(extra="forbid")

    slot_id: str | None = None
    doctor_name: str | None = None
    appointment_date: date | None = None
    appointment_time: time | None = None
    booking_timezone: str = "UTC"
    booking_reason: str | None = None
    policy_context: dict[str, Any] = Field(default_factory=dict)

    def uses_slot_id(self) -> bool:
        return bool(self.slot_id)

    def missing_fields(self) -> list[str]:
        missing: list[str] = []
        if not self.doctor_name:
            missing.append("doctor_name")
        if self.slot_id:
            return missing
        if not self.appointment_date:
            missing.append("appointment_date")
        if not self.appointment_time:
            missing.append("appointment_time")
        return missing

    def is_complete(self) -> bool:
        return len(self.missing_fields()) == 0


class DoctorMatchAgentRequest(BaseModel):
    """Request contract for the specialized doctor match and conditional booking flow."""

    model_config = ConfigDict(extra="forbid")

    thread_id: str = Field(min_length=1)
    actor_user_id: str = Field(min_length=1)
    patient_user_id: str = Field(min_length=1)
    need_text: str = Field(min_length=2, max_length=500)
    booking: BookingSelectionInput | None = None
    max_suggestions: int = Field(default=5, ge=1, le=10)

    def to_booking_readiness(self) -> "BookingReadiness":
        if self.booking is None:
            return BookingReadiness(
                ready=False,
                missing_fields=["doctor_name", "slot_id or (appointment_date+appointment_time)"],
                reason="No booking payload provided; returning suggestion-only output.",
            )

        missing = self.booking.missing_fields()
        if missing:
            return BookingReadiness(
                ready=False,
                missing_fields=missing,
                reason="Missing one or more required booking fields.",
            )

        return BookingReadiness(
            ready=True,
            missing_fields=[],
            reason=(
                "Slot-based booking fields are present."
                if self.booking.uses_slot_id()
                else "Datetime fallback booking fields are present."
            ),
        )


class BookingReadiness(BaseModel):
    model_config = ConfigDict(extra="forbid")

    ready: bool
    missing_fields: list[str] = Field(default_factory=list)
    reason: str


class BookingOutcome(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: Literal["booked", "failed"]
    appointment_id: str | None = None
    slot_id: str | None = None
    doctor_id: str | None = None
    doctor_name: str | None = None
    appointment_date: date | None = None
    appointment_time: time | None = None
    resolution_mode: Literal["slot_id", "datetime_fallback"] | None = None
    normalized_booking_time_utc: str | None = None
    message: str


class StructuredError(BaseModel):
    model_config = ConfigDict(extra="forbid")

    code: str
    message: str
    node: str | None = None
    detail: dict[str, Any] = Field(default_factory=dict)


class DoctorMatchAgentResponse(BaseModel):
    """Strict response schema that enforces conditional booking behavior."""

    model_config = ConfigDict(extra="forbid")

    thread_id: str
    actor_user_id: str
    patient_user_id: str
    inferred_need: str
    patient_profile_snapshot: PatientProfileSnapshot
    suggestions: list[DoctorSuggestionCard] = Field(default_factory=list)
    booking_readiness: BookingReadiness
    booking_mode: Literal["suggest_only", "booked", "booking_failed"]
    booking_outcome: BookingOutcome | None = None
    scope: PhaseScopeBoundaries = Field(default_factory=PhaseScopeBoundaries)
    errors: list[StructuredError] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_conditional_booking_rule(self) -> "DoctorMatchAgentResponse":
        """Hard rule: incomplete booking inputs must never trigger a booking."""
        if not self.booking_readiness.ready:
            if self.booking_mode != "suggest_only":
                raise ValueError("booking_mode must be 'suggest_only' when booking is not ready")
            if self.booking_outcome is not None:
                raise ValueError("booking_outcome must be null when booking is not ready")
            return self

        if self.booking_mode == "suggest_only":
            raise ValueError("booking_mode cannot be 'suggest_only' when booking is ready")

        if self.booking_mode in {"booked", "booking_failed"} and self.booking_outcome is None:
            raise ValueError("booking_outcome is required when booking_mode is booked/booking_failed")

        return self


__all__ = [
    "BookingOutcome",
    "BookingReadiness",
    "BookingSelectionInput",
    "DoctorMatchAgentRequest",
    "DoctorMatchAgentResponse",
    "DoctorSuggestionCard",
    "PatientProfileSnapshot",
    "PhaseScopeBoundaries",
    "StructuredError",
]
