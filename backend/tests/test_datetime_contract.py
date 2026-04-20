from datetime import date, time

import pytest
from pydantic import ValidationError

from backend.app.schemas.doctor_matching_agent import BookingOutcome, BookingSelectionInput


def test_booking_selection_parses_iso_date_time_strings():
    payload = {
        "doctor_name": "Dr. X",
        "appointment_date": "2026-04-15",
        "appointment_time": "14:30:00",
    }
    parsed = BookingSelectionInput(**payload)

    assert parsed.appointment_date == date(2026, 4, 15)
    assert parsed.appointment_time == time(14, 30, 0)


def test_booking_outcome_parses_iso_date_time_strings():
    payload = {
        "status": "booked",
        "message": "ok",
        "appointment_date": "2026-04-15",
        "appointment_time": "09:45:00",
    }
    parsed = BookingOutcome(**payload)

    assert parsed.appointment_date == date(2026, 4, 15)
    assert parsed.appointment_time == time(9, 45, 0)


def test_booking_selection_rejects_invalid_date_format():
    with pytest.raises(ValidationError):
        BookingSelectionInput(
            doctor_name="Dr. X",
            appointment_date="15-04-2026",
            appointment_time="14:30:00",
        )


def test_booking_outcome_rejects_invalid_time_format():
    with pytest.raises(ValidationError):
        BookingOutcome(
            status="booked",
            message="ok",
            appointment_date="2026-04-15",
            appointment_time="25:99:99",
        )
