import asyncio
import os
import uuid

os.environ.setdefault("GOOGLE_API_KEY", "test-key")

from backend.orchestration import supervisor_workflow as swf


def test_interruption_then_resume_commits_booking_once(monkeypatch):
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
    actor_id = f"actor-{uuid.uuid4()}"
    patient_id = f"patient-{uuid.uuid4()}"

    # Simulate interrupted run by seeding checkpoint with pre-booking state.
    config = swf.build_graph_config(thread_id)
    interrupted_state = {
        "thread_id": thread_id,
        "actor_user_id": actor_id,
        "patient_user_id": patient_id,
        "need_text": "severe cough",
        "cards_emitted": True,
        "booking_ready": True,
        "booking_attempted": False,
        "booking_committed": False,
        "selected_doctor": {"doctor_id": "doc-1", "doctor_name": "Dr One"},
        "selected_appointment_date": "2026-04-21",
        "selected_appointment_time": "09:30:00",
    }
    asyncio.run(swf._DOCTOR_WORKFLOW.aupdate_state(config, interrupted_state))

    resume_state: swf.SupervisorState = {
        "thread_id": thread_id,
        "actor_user_id": actor_id,
        "patient_user_id": patient_id,
        "need_text": "severe cough",
        "max_suggestions": 3,
        "selected_doctor": {"doctor_id": "doc-1", "doctor_name": "Dr One"},
        "selected_appointment_date": "2026-04-21",
        "selected_appointment_time": "09:30:00",
    }

    first_resume = asyncio.run(swf.execute_doctor_match_workflow(resume_state))
    second_resume = asyncio.run(swf.execute_doctor_match_workflow(resume_state))

    assert first_resume["booking_committed"] is True
    assert second_resume["booking_committed"] is True
    assert calls["book"] == 1
