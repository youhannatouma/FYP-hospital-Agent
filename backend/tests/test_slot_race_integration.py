import asyncio
from datetime import datetime, timedelta, timezone
import os
import threading
import uuid

import pytest
from sqlalchemy import create_engine, text

os.environ.setdefault("GOOGLE_API_KEY", "test-key")

from backend.orchestration import supervisor_workflow as swf
from backend.tools.doctor_matching_tools import BookingDomainError, book_appointment


def _base_state(thread_id: str) -> swf.SupervisorState:
    return {
        "thread_id": thread_id,
        "actor_user_id": f"actor-{uuid.uuid4()}",
        "patient_user_id": f"patient-{uuid.uuid4()}",
        "need_text": "persistent cough",
        "max_suggestions": 3,
        "selected_doctor": {"doctor_id": "doc-1", "doctor_name": "Dr One"},
        "selected_slot_id": "slot-1",
        "selected_appointment_date": "2026-05-01",
        "selected_appointment_time": "09:30:00",
    }


def _install_fake_tooling(monkeypatch):
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

    lock = threading.Lock()
    slot_owners: dict[str, str] = {}
    idempotent_bookings: dict[str, dict] = {}
    counter = {"n": 0}

    def fake_book_appointment(**kwargs):
        thread_id = str(kwargs["thread_id"])
        patient_user_id = str(kwargs["patient_user_id"])
        doctor_id = str(kwargs["doctor_id"])
        slot_ref = str(kwargs.get("slot_id") or f"{kwargs.get('appointment_date')}:{kwargs.get('appointment_time')}")
        replay_key = f"{thread_id}|{patient_user_id}|{doctor_id}|{slot_ref}"

        with lock:
            if replay_key in idempotent_bookings:
                existing = dict(idempotent_bookings[replay_key])
                existing["idempotent_replay"] = True
                return existing

            owner = slot_owners.get(slot_ref)
            if owner is not None and owner != replay_key:
                raise swf.BookingDomainError("BookingSlotAlreadyBooked", "Requested slot is already booked")

            slot_owners[slot_ref] = replay_key
            counter["n"] += 1
            created = {
                "status": "booked",
                "idempotent_replay": False,
                "appointment_id": f"appt-{counter['n']}",
                "slot_id": slot_ref,
                "doctor_id": doctor_id,
                "patient_id": patient_user_id,
                "resolution_mode": "datetime_fallback",
                "message": "Appointment booked successfully.",
            }
            idempotent_bookings[replay_key] = dict(created)
            return created

    monkeypatch.setattr(swf, "profile_user", fake_profile_user)
    monkeypatch.setattr(swf, "search_doctors_for_need", fake_search_doctors_for_need)
    monkeypatch.setattr(swf, "book_appointment", fake_book_appointment)
    return counter


def test_two_thread_same_slot_race_one_wins(monkeypatch):
    _install_fake_tooling(monkeypatch)

    async def _run_race():
        state_a = _base_state(f"thread-{uuid.uuid4()}")
        state_b = _base_state(f"thread-{uuid.uuid4()}")
        state_b["patient_user_id"] = state_a["patient_user_id"]
        return await asyncio.gather(
            swf.execute_doctor_match_workflow(state_a),
            swf.execute_doctor_match_workflow(state_b),
        )

    first, second = asyncio.run(_run_race())
    outcomes = [first, second]

    booked = [o for o in outcomes if o["booking_mode"] == "booked"]
    failed = [o for o in outcomes if o["booking_mode"] == "booking_failed"]

    assert len(booked) == 1
    assert len(failed) == 1
    assert failed[0]["booking_result"]["code"] == "BookingSlotAlreadyBooked"


def test_same_thread_triple_invoke_is_idempotent(monkeypatch):
    calls = _install_fake_tooling(monkeypatch)

    thread_id = f"thread-{uuid.uuid4()}"
    state = _base_state(thread_id)

    first = asyncio.run(swf.execute_doctor_match_workflow(dict(state)))
    second = asyncio.run(swf.execute_doctor_match_workflow(dict(state)))
    third = asyncio.run(swf.execute_doctor_match_workflow(dict(state)))

    assert first["booking_mode"] == "booked"
    assert second["booking_mode"] == "booked"
    assert third["booking_mode"] == "booked"
    assert first["booking_result"]["appointment_id"] == second["booking_result"]["appointment_id"]
    assert second["booking_result"]["appointment_id"] == third["booking_result"]["appointment_id"]
    # One physical booking operation, subsequent calls resolved from committed checkpoint.
    assert calls["n"] == 1


def test_five_thread_slot_contention_single_winner(monkeypatch):
    _install_fake_tooling(monkeypatch)

    async def _run_contention():
        states = []
        shared_patient = f"patient-{uuid.uuid4()}"
        for _ in range(5):
            state = _base_state(f"thread-{uuid.uuid4()}")
            state["patient_user_id"] = shared_patient
            states.append(state)
        return await asyncio.gather(*[swf.execute_doctor_match_workflow(s) for s in states])

    results = asyncio.run(_run_contention())
    booked = [r for r in results if r["booking_mode"] == "booked"]
    failed = [r for r in results if r["booking_mode"] == "booking_failed"]

    assert len(booked) == 1
    assert len(failed) == 4
    assert all(r["booking_result"]["code"] == "BookingSlotAlreadyBooked" for r in failed)


def test_real_db_same_slot_race_one_wins():
    if os.getenv("RUN_DB_SLOT_RACE_TEST", "0") != "1":
        pytest.skip("Set RUN_DB_SLOT_RACE_TEST=1 to run DB-backed slot race test")

    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        pytest.skip("DATABASE_URL is required for DB-backed slot race test")

    engine = create_engine(database_url)

    actor_id = uuid.uuid4()
    patient_id = uuid.uuid4()
    doctor_id = uuid.uuid4()
    slot_id = uuid.uuid4()
    start_time = datetime.now(timezone.utc).replace(tzinfo=None, microsecond=0) + timedelta(days=7)
    end_time = start_time + timedelta(minutes=30)

    cleanup_sql = [
        text("DELETE FROM appointment WHERE slot_id = :slot_id"),
        text("DELETE FROM time_slot WHERE slot_id = :slot_id"),
        text("DELETE FROM usr WHERE user_id IN (:actor_id, :patient_id, :doctor_id)"),
    ]

    with engine.begin() as conn:
        # CI ephemeral schema can miss UUID defaults on appointment_id; enforce one for this test path.
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS pgcrypto"))
        conn.execute(text("ALTER TABLE appointment ALTER COLUMN appointment_id SET DEFAULT gen_random_uuid()"))
        conn.execute(
            text(
                """
                INSERT INTO usr (user_id, email, first_name, last_name, role, status)
                VALUES
                    (:actor_id, :actor_email, 'Admin', 'Actor', 'admin', 'Active'),
                    (:patient_id, :patient_email, 'Pat', 'Ient', 'patient', 'Active'),
                    (:doctor_id, :doctor_email, 'Doc', 'Tor', 'doctor', 'Active')
                """
            ),
            {
                "actor_id": actor_id,
                "patient_id": patient_id,
                "doctor_id": doctor_id,
                "actor_email": f"actor-{actor_id}@example.test",
                "patient_email": f"patient-{patient_id}@example.test",
                "doctor_email": f"doctor-{doctor_id}@example.test",
            },
        )
        conn.execute(
            text(
                """
                INSERT INTO time_slot (slot_id, doctor_id, start_time, end_time, is_available)
                VALUES (:slot_id, :doctor_id, :start_time, :end_time, TRUE)
                """
            ),
            {
                "slot_id": slot_id,
                "doctor_id": doctor_id,
                "start_time": start_time,
                "end_time": end_time,
            },
        )

    barrier = threading.Barrier(2)
    outcomes: list[tuple[str, object]] = []
    outcomes_lock = threading.Lock()

    def _attempt_booking(thread_id: str) -> None:
        try:
            barrier.wait(timeout=5)
            result = book_appointment(
                thread_id=thread_id,
                actor_user_id=str(actor_id),
                patient_user_id=str(patient_id),
                doctor_id=str(doctor_id),
                slot_id=str(slot_id),
                booking_reason="db race integration",
            )
            with outcomes_lock:
                outcomes.append(("ok", result))
        except Exception as exc:  # noqa: BLE001 - assertion checks type/code explicitly
            with outcomes_lock:
                outcomes.append(("err", exc))

    t1 = threading.Thread(target=_attempt_booking, args=(f"thread-{uuid.uuid4()}",), daemon=True)
    t2 = threading.Thread(target=_attempt_booking, args=(f"thread-{uuid.uuid4()}",), daemon=True)
    t1.start()
    t2.start()
    t1.join(timeout=10)
    t2.join(timeout=10)

    try:
        assert len(outcomes) == 2
        successes = [payload for kind, payload in outcomes if kind == "ok"]
        failures = [payload for kind, payload in outcomes if kind == "err"]

        assert len(successes) == 1
        assert len(failures) == 1
        assert isinstance(failures[0], BookingDomainError)
        assert failures[0].code == "BookingSlotAlreadyBooked"
    finally:
        with engine.begin() as conn:
            for stmt in cleanup_sql:
                conn.execute(
                    stmt,
                    {
                        "slot_id": slot_id,
                        "actor_id": actor_id,
                        "patient_id": patient_id,
                        "doctor_id": doctor_id,
                    },
                )
