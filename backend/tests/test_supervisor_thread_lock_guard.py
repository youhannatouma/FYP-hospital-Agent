import asyncio
import os
import time
import uuid

os.environ.setdefault("GOOGLE_API_KEY", "test-key")

from backend.orchestration import supervisor_workflow as swf


def test_same_thread_concurrent_execute_serializes_booking(monkeypatch):
    calls = {"book": 0}
    timings: list[tuple[str, float]] = []

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
        timings.append(("start", time.monotonic()))
        time.sleep(0.08)
        timings.append(("end", time.monotonic()))
        return {
            "status": "booked",
            "appointment_id": "appt-1",
            "doctor_id": "doc-1",
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

    async def _run_two_requests():
        return await asyncio.gather(
            swf.execute_doctor_match_workflow(dict(base_state)),
            swf.execute_doctor_match_workflow(dict(base_state)),
        )

    first, second = asyncio.run(_run_two_requests())

    assert calls["book"] == 1
    assert first["booking_committed"] is True
    assert second["booking_committed"] is True
    assert len(timings) == 2
    assert timings[0][0] == "start"
    assert timings[1][0] == "end"
    assert timings[1][1] > timings[0][1]
