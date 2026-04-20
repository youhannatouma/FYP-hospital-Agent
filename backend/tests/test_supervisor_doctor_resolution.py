import asyncio
import os
import uuid

os.environ.setdefault("GOOGLE_API_KEY", "test-key")

from backend.orchestration import supervisor_workflow as swf


def _base_state() -> swf.SupervisorState:
    return {
        "thread_id": f"thread-{uuid.uuid4()}",
        "actor_user_id": f"actor-{uuid.uuid4()}",
        "patient_user_id": f"patient-{uuid.uuid4()}",
        "need_text": "severe cough",
        "max_suggestions": 3,
        "selected_appointment_date": "2026-04-21",
        "selected_appointment_time": "09:30:00",
    }


def test_name_resolution_from_ranked_candidates(monkeypatch):
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

    def fake_search_user(_query: str, role: str | None = None, limit: int = 10):
        assert role == "doctor"
        return []

    def fake_book_appointment(**kwargs):
        calls["book"] += 1
        assert kwargs["doctor_id"] == "doc-1"
        return {
            "status": "booked",
            "appointment_id": "appt-1",
            "doctor_id": "doc-1",
        }

    monkeypatch.setattr(swf, "profile_user", fake_profile_user)
    monkeypatch.setattr(swf, "search_doctors_for_need", fake_search_doctors_for_need)
    monkeypatch.setattr(swf, "search_user", fake_search_user)
    monkeypatch.setattr(swf, "book_appointment", fake_book_appointment)

    state = _base_state()
    state["selected_doctor"] = {"doctor_name": "Dr One"}

    out = asyncio.run(swf.execute_doctor_match_workflow(state))

    assert out["doctor_resolution_status"] == "resolved"
    assert out["booking_mode"] == "booked"
    assert out["booking_committed"] is True
    assert out["booking_blocked_missing_fields"] == []
    assert out["booking_failed_validation"] is False
    assert calls["book"] == 1


def test_name_resolution_from_db_fallback(monkeypatch):
    calls = {"book": 0}

    def fake_profile_user(_patient_user_id: str):
        return {"user_id": _patient_user_id, "first_name": "P"}

    def fake_search_doctors_for_need(_need_text: str, _patient_user_id: str, _max: int):
        return {"candidates": []}

    def fake_search_user(_query: str, role: str | None = None, limit: int = 10):
        assert role == "doctor"
        return [
            {
                "user_id": "doc-2",
                "first_name": "Dr",
                "last_name": "Two",
                "email": "dr.two@example.com",
            }
        ]

    def fake_book_appointment(**kwargs):
        calls["book"] += 1
        assert kwargs["doctor_id"] == "doc-2"
        return {
            "status": "booked",
            "appointment_id": "appt-2",
            "doctor_id": "doc-2",
        }

    monkeypatch.setattr(swf, "profile_user", fake_profile_user)
    monkeypatch.setattr(swf, "search_doctors_for_need", fake_search_doctors_for_need)
    monkeypatch.setattr(swf, "search_user", fake_search_user)
    monkeypatch.setattr(swf, "book_appointment", fake_book_appointment)

    state = _base_state()
    state["selected_doctor"] = {"doctor_name": "Dr Two"}

    out = asyncio.run(swf.execute_doctor_match_workflow(state))

    assert out["doctor_resolution_status"] == "resolved"
    assert out["booking_mode"] == "booked"
    assert out["booking_committed"] is True
    assert out["booking_blocked_missing_fields"] == []
    assert out["booking_failed_validation"] is False
    assert calls["book"] == 1


def test_wrong_name_stays_suggestion_only(monkeypatch):
    calls = {"book": 0}

    def fake_profile_user(_patient_user_id: str):
        return {"user_id": _patient_user_id, "first_name": "P"}

    def fake_search_doctors_for_need(_need_text: str, _patient_user_id: str, _max: int):
        return {
            "candidates": [
                {
                    "doctor_id": "doc-x",
                    "doctor_name": "Dr Existing",
                    "specialty": "general medicine",
                    "clinic_address": "A",
                    "earliest_available_at": "2026-04-20T10:00:00",
                    "avg_session_price": 100.0,
                    "ranking_features": {"proximity_score": 0.6},
                    "ranking_reason": "deterministic",
                }
            ]
        }

    def fake_search_user(_query: str, role: str | None = None, limit: int = 10):
        assert role == "doctor"
        return []

    def fake_book_appointment(**_kwargs):
        calls["book"] += 1
        return {"status": "booked", "appointment_id": "appt-x"}

    monkeypatch.setattr(swf, "profile_user", fake_profile_user)
    monkeypatch.setattr(swf, "search_doctors_for_need", fake_search_doctors_for_need)
    monkeypatch.setattr(swf, "search_user", fake_search_user)
    monkeypatch.setattr(swf, "book_appointment", fake_book_appointment)

    state = _base_state()
    state["selected_doctor"] = {"doctor_name": "Unknown Name"}

    out = asyncio.run(swf.execute_doctor_match_workflow(state))

    assert out["booking_mode"] == "suggest_only"
    assert out["booking_blocked_reason"] == "doctor_name_not_found"
    assert out["booking_attempted"] is False
    assert out["booking_committed"] is False
    assert "selected_doctor" in out["booking_missing_fields"]
    assert "selected_doctor" in out["booking_blocked_missing_fields"]
    assert out["booking_failed_validation"] is False
    assert calls["book"] == 0


def test_ambiguous_name_stays_suggestion_only(monkeypatch):
    calls = {"book": 0}

    def fake_profile_user(_patient_user_id: str):
        return {"user_id": _patient_user_id, "first_name": "P"}

    def fake_search_doctors_for_need(_need_text: str, _patient_user_id: str, _max: int):
        return {"candidates": []}

    def fake_search_user(_query: str, role: str | None = None, limit: int = 10):
        assert role == "doctor"
        return [
            {
                "user_id": "doc-a",
                "first_name": "Dr",
                "last_name": "Same",
                "email": "same.a@example.com",
            },
            {
                "user_id": "doc-b",
                "first_name": "Dr",
                "last_name": "Same",
                "email": "same.b@example.com",
            },
        ]

    def fake_book_appointment(**_kwargs):
        calls["book"] += 1
        return {"status": "booked", "appointment_id": "appt-y"}

    monkeypatch.setattr(swf, "profile_user", fake_profile_user)
    monkeypatch.setattr(swf, "search_doctors_for_need", fake_search_doctors_for_need)
    monkeypatch.setattr(swf, "search_user", fake_search_user)
    monkeypatch.setattr(swf, "book_appointment", fake_book_appointment)

    state = _base_state()
    state["selected_doctor"] = {"doctor_name": "Dr Same"}

    out = asyncio.run(swf.execute_doctor_match_workflow(state))

    assert out["booking_mode"] == "suggest_only"
    assert out["booking_blocked_reason"] == "doctor_name_ambiguous"
    assert out["booking_attempted"] is False
    assert out["booking_committed"] is False
    assert "selected_doctor" in out["booking_missing_fields"]
    assert "selected_doctor" in out["booking_blocked_missing_fields"]
    assert out["booking_failed_validation"] is False
    assert len(out["doctor_resolution_candidates"]) >= 2
    assert calls["book"] == 0


def test_missing_fields_still_suggestion_only(monkeypatch):
    calls = {"book": 0}

    def fake_profile_user(_patient_user_id: str):
        return {"user_id": _patient_user_id, "first_name": "P"}

    def fake_search_doctors_for_need(_need_text: str, _patient_user_id: str, _max: int):
        return {"candidates": []}

    def fake_search_user(_query: str, role: str | None = None, limit: int = 10):
        assert role == "doctor"
        return []

    def fake_book_appointment(**_kwargs):
        calls["book"] += 1
        return {"status": "booked", "appointment_id": "appt-z"}

    monkeypatch.setattr(swf, "profile_user", fake_profile_user)
    monkeypatch.setattr(swf, "search_doctors_for_need", fake_search_doctors_for_need)
    monkeypatch.setattr(swf, "search_user", fake_search_user)
    monkeypatch.setattr(swf, "book_appointment", fake_book_appointment)

    state = _base_state()
    # Missing selected_doctor and time to preserve existing suggestion-only behavior.
    state.pop("selected_appointment_time")

    out = asyncio.run(swf.execute_doctor_match_workflow(state))

    assert out["booking_mode"] == "suggest_only"
    assert out["booking_blocked_reason"] == "missing_required_booking_fields"
    assert out["booking_attempted"] is False
    assert out["booking_committed"] is False
    assert "selected_doctor" in out["booking_missing_fields"]
    assert "selected_appointment_time" in out["booking_missing_fields"]
    assert "selected_doctor" in out["booking_blocked_missing_fields"]
    assert "selected_appointment_time" in out["booking_blocked_missing_fields"]
    assert out["booking_failed_validation"] is False
    assert calls["book"] == 0


def test_single_fuzzy_db_hit_stays_ambiguous(monkeypatch):
    calls = {"book": 0}

    def fake_profile_user(_patient_user_id: str):
        return {"user_id": _patient_user_id, "first_name": "P"}

    def fake_search_doctors_for_need(_need_text: str, _patient_user_id: str, _max: int):
        return {"candidates": []}

    def fake_search_user(_query: str, role: str | None = None, limit: int = 10):
        assert role == "doctor"
        return [
            {
                "user_id": "doc-fuzzy",
                "first_name": "Dr",
                "last_name": "Nearby",
                "email": "dr.nearby@example.com",
            }
        ]

    def fake_book_appointment(**_kwargs):
        calls["book"] += 1
        return {"status": "booked", "appointment_id": "appt-fuzzy"}

    monkeypatch.setattr(swf, "profile_user", fake_profile_user)
    monkeypatch.setattr(swf, "search_doctors_for_need", fake_search_doctors_for_need)
    monkeypatch.setattr(swf, "search_user", fake_search_user)
    monkeypatch.setattr(swf, "book_appointment", fake_book_appointment)

    state = _base_state()
    state["selected_doctor"] = {"doctor_name": "Dr Near"}

    out = asyncio.run(swf.execute_doctor_match_workflow(state))

    assert out["doctor_resolution_status"] == "ambiguous"
    assert out["booking_mode"] == "suggest_only"
    assert out["booking_blocked_reason"] == "doctor_name_ambiguous"
    assert len(out["doctor_resolution_candidates"]) == 1
    assert calls["book"] == 0


def test_missing_thread_id_sets_booking_failed_validation_true():
    state: swf.SupervisorState = {
        "thread_id": "",
        "actor_user_id": f"actor-{uuid.uuid4()}",
        "patient_user_id": f"patient-{uuid.uuid4()}",
        "need_text": "severe cough",
        "selected_doctor": {"doctor_id": "doc-1", "doctor_name": "Dr One"},
        "selected_appointment_date": "2026-04-21",
        "selected_appointment_time": "09:30:00",
    }

    out = asyncio.run(swf.execute_doctor_match_workflow(state))

    assert out["booking_mode"] == "booking_failed"
    assert out["booking_result"]["code"] == "MissingThreadId"
    assert out["booking_failed_validation"] is True
