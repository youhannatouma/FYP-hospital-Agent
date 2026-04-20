import asyncio
import os
import uuid

os.environ.setdefault("GOOGLE_API_KEY", "test-key")

from backend.orchestration import supervisor_workflow as swf


def test_incomplete_booking_routes_to_suggestion_only(monkeypatch):
    calls = {"book": 0}

    def fake_profile_user(_patient_user_id: str):
        return {"user_id": _patient_user_id, "first_name": "P"}

    def fake_search_doctors_for_need(_need_text: str, _patient_user_id: str, _max: int):
        return {
            "candidates": [
                {
                    "doctor_id": "doc-1",
                    "doctor_name": "Dr One",
                    "specialty": "general medicine",
                    "clinic_address": "A",
                    "earliest_available_at": "2026-04-20T10:00:00",
                    "avg_session_price": 100.0,
                    "ranking_features": {"proximity_score": 0.6},
                    "ranking_reason": "deterministic",
                }
            ]
        }

    def fake_book_appointment(**_kwargs):
        calls["book"] += 1
        return {"status": "booked", "appointment_id": "appt-1"}

    monkeypatch.setattr(swf, "profile_user", fake_profile_user)
    monkeypatch.setattr(swf, "search_doctors_for_need", fake_search_doctors_for_need)
    monkeypatch.setattr(swf, "book_appointment", fake_book_appointment)

    state: swf.SupervisorState = {
        "thread_id": f"thread-{uuid.uuid4()}",
        "actor_user_id": f"actor-{uuid.uuid4()}",
        "patient_user_id": f"patient-{uuid.uuid4()}",
        "need_text": "severe cough",
        "max_suggestions": 3,
        # Intentionally missing selected_doctor/date/time
    }

    out = asyncio.run(swf.execute_doctor_matching_workflow(state))

    assert out["booking_mode"] == "suggest_only"
    assert out["booking_attempted"] is False
    assert out["booking_committed"] is False
    assert out["booking_blocked_reason"] == "missing_required_booking_fields"
    assert set(out["booking_missing_fields"]) == {
        "selected_doctor",
        "selected_appointment_date",
        "selected_appointment_time",
    }
    assert set(out["booking_blocked_missing_fields"]) == {
        "selected_doctor",
        "selected_appointment_date",
        "selected_appointment_time",
    }
    assert out["booking_failed_validation"] is False
    assert out["cards_emitted"] is True
    assert calls["book"] == 0


def test_complete_booking_enters_booking_node(monkeypatch):
    calls = {"book": 0}

    def fake_profile_user(_patient_user_id: str):
        return {"user_id": _patient_user_id, "first_name": "P"}

    def fake_search_doctors_for_need(_need_text: str, _patient_user_id: str, _max: int):
        return {
            "candidates": [
                {
                    "doctor_id": "doc-1",
                    "doctor_name": "Dr One",
                    "specialty": "general medicine",
                    "clinic_address": "A",
                    "earliest_available_at": "2026-04-20T10:00:00",
                    "avg_session_price": 100.0,
                    "ranking_features": {"proximity_score": 0.6},
                    "ranking_reason": "deterministic",
                }
            ]
        }

    def fake_book_appointment(**_kwargs):
        calls["book"] += 1
        return {
            "status": "booked",
            "appointment_id": "appt-1",
            "doctor_id": "doc-1",
        }

    monkeypatch.setattr(swf, "profile_user", fake_profile_user)
    monkeypatch.setattr(swf, "search_doctors_for_need", fake_search_doctors_for_need)
    monkeypatch.setattr(swf, "book_appointment", fake_book_appointment)

    state: swf.SupervisorState = {
        "thread_id": f"thread-{uuid.uuid4()}",
        "actor_user_id": f"actor-{uuid.uuid4()}",
        "patient_user_id": f"patient-{uuid.uuid4()}",
        "need_text": "severe cough",
        "max_suggestions": 3,
        "selected_doctor": {"doctor_id": "doc-1", "doctor_name": "Dr One"},
        "selected_appointment_date": "2026-04-21",
        "selected_appointment_time": "09:30:00",
    }

    out = asyncio.run(swf.execute_doctor_matching_workflow(state))

    assert out["booking_mode"] == "booked"
    assert out["booking_attempted"] is True
    assert out["booking_committed"] is True
    assert out["booking_blocked_reason"] == "ready_for_booking"
    assert out["booking_missing_fields"] == []
    assert out["booking_blocked_missing_fields"] == []
    assert out["booking_failed_validation"] is False
    assert calls["book"] == 1
