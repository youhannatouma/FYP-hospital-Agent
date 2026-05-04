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


def test_slot_id_booking_does_not_require_datetime(monkeypatch):
    calls = {"book": 0}
    captured: dict = {}

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

    def fake_book_appointment(**kwargs):
        calls["book"] += 1
        captured.update(kwargs)
        return {
            "status": "booked",
            "appointment_id": "appt-1",
            "doctor_id": "doc-1",
            "slot_id": kwargs.get("slot_id"),
            "resolution_mode": "slot_id",
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
        "selected_slot_id": "slot-abc-1",
    }

    out = asyncio.run(swf.execute_doctor_matching_workflow(state))

    assert out["booking_mode"] == "booked"
    assert out["booking_committed"] is True
    assert captured["slot_id"] == "slot-abc-1"
    assert calls["book"] == 1


def test_booking_timezone_and_reason_are_passed_through(monkeypatch):
    captured: dict = {}

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

    def fake_book_appointment(**kwargs):
        captured.update(kwargs)
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
        "booking_timezone": "Asia/Beirut",
        "booking_reason": "Cross-patient booking approved",
    }

    out = asyncio.run(swf.execute_doctor_matching_workflow(state))

    assert out["booking_mode"] == "booked"
    assert captured["booking_timezone"] == "Asia/Beirut"
    assert captured["booking_reason"] == "Cross-patient booking approved"


def test_booking_policy_context_is_passed_and_normalized(monkeypatch):
    captured: dict = {}

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

    def fake_book_appointment(**kwargs):
        captured.update(kwargs)
        return {
            "status": "booked",
            "appointment_id": "appt-1",
            "doctor_id": "doc-1",
        }

    monkeypatch.setattr(swf, "profile_user", fake_profile_user)
    monkeypatch.setattr(swf, "search_doctors_for_need", fake_search_doctors_for_need)
    monkeypatch.setattr(swf, "book_appointment", fake_book_appointment)

    state_with_policy: swf.SupervisorState = {
        "thread_id": f"thread-{uuid.uuid4()}",
        "actor_user_id": f"actor-{uuid.uuid4()}",
        "patient_user_id": f"patient-{uuid.uuid4()}",
        "need_text": "severe cough",
        "max_suggestions": 3,
        "selected_doctor": {"doctor_id": "doc-1", "doctor_name": "Dr One"},
        "selected_appointment_date": "2026-04-21",
        "selected_appointment_time": "09:30:00",
        "policy_context": {"high_risk": True, "reason": "policy-test"},
    }

    out_with_policy = asyncio.run(swf.execute_doctor_matching_workflow(state_with_policy))

    assert out_with_policy["booking_mode"] == "booked"
    assert captured["policy_context"] == {"high_risk": True, "reason": "policy-test"}

    captured.clear()
    state_non_dict_policy = dict(state_with_policy)
    state_non_dict_policy["thread_id"] = f"thread-{uuid.uuid4()}"
    state_non_dict_policy["policy_context"] = "invalid"

    out_non_dict = asyncio.run(swf.execute_doctor_matching_workflow(state_non_dict_policy))

    assert out_non_dict["booking_mode"] == "booked"
    assert captured["policy_context"] == {}


def test_booking_timezone_defaults_to_utc_when_absent(monkeypatch):
    captured: dict = {}

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

    def fake_book_appointment(**kwargs):
        captured.update(kwargs)
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
    assert captured["booking_timezone"] == "UTC"


def test_approval_required_returns_pending_mode(monkeypatch):
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
        raise swf.BookingDomainError(
            "ApprovalRequired",
            "Human approval required before booking",
            detail={
                "approval_id": "approval-1",
                "requested_at": "2026-05-04T10:00:00",
                "expires_at": "2026-05-04T10:05:00",
                "review_context_summary": {"high_risk_flag": True},
            },
        )

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
    assert out["booking_mode"] == "booking_pending_approval"
    assert out["booking_committed"] is False
    assert out["approval_outcome"]["approval_id"] == "approval-1"
