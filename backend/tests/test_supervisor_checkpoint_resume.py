import asyncio
import os
import uuid

os.environ.setdefault("GOOGLE_API_KEY", "test-key")

from backend.orchestration import supervisor_workflow as swf


def test_resume_preserves_committed_booking_and_avoids_replay(monkeypatch):
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
            "appointment_date": "2026-04-21",
            "appointment_time": "09:30:00",
        }

    monkeypatch.setattr(swf, "profile_user", fake_profile_user)
    monkeypatch.setattr(swf, "search_doctors_for_need", fake_search_doctors_for_need)
    monkeypatch.setattr(swf, "book_appointment", fake_book_appointment)

    thread_id = f"thread-{uuid.uuid4()}"
    base_state: swf.SupervisorState = {
        "thread_id": thread_id,
        "actor_user_id": f"actor-{uuid.uuid4()}",
        "patient_user_id": f"patient-{uuid.uuid4()}",
        "need_text": "severe cough",
        "max_suggestions": 3,
        "selected_doctor": {"doctor_id": "doc-1", "doctor_name": "Dr One"},
        "selected_appointment_date": "2026-04-21",
        "selected_appointment_time": "09:30:00",
    }

    first = asyncio.run(swf.execute_doctor_matching_workflow(base_state))
    assert first["booking_mode"] == "booked"
    assert first["booking_committed"] is True
    assert calls["book"] == 1

    restored = asyncio.run(swf.load_thread_state(thread_id))
    assert restored is not None
    assert restored.get("booking_committed") is True

    replay_state: swf.SupervisorState = {
        **base_state,
        "need_text": "different text should not replay booking",
        "selected_appointment_date": "2026-04-25",
        "selected_appointment_time": "11:00:00",
    }
    second = asyncio.run(swf.execute_doctor_matching_workflow(replay_state))

    assert second["resume_from_checkpoint"] is True
    assert second["booking_committed"] is True
    assert second["booking_mode"] == "booked"
    assert second["booking_result"]["appointment_id"] == "appt-1"
    assert calls["book"] == 1


def test_conditional_book_short_circuits_when_already_committed(monkeypatch):
    called = {"book": False}

    def fake_book_appointment(**_kwargs):
        called["book"] = True
        return {"status": "booked"}

    monkeypatch.setattr(swf, "book_appointment", fake_book_appointment)

    state: swf.SupervisorState = {
        "booking_committed": True,
        "booking_mode": "booked",
        "booking_result": {"status": "booked", "appointment_id": "appt-1"},
        "structured_errors": [],
    }

    out = asyncio.run(swf.conditional_book_node(state))

    assert out["booking_committed"] is True
    assert out["booking_attempted"] is True
    assert out["booking_result"]["appointment_id"] == "appt-1"
    assert called["book"] is False
