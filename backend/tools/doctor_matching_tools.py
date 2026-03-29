"""SQLAlchemy-backed tools for doctor matching and conditional booking."""
from __future__ import annotations

import hashlib
import logging
import os
import uuid
from datetime import date, datetime, time, timedelta
from typing import Any

from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.pool import QueuePool

load_dotenv()
log = logging.getLogger(__name__)

_DATABASE_URL = os.getenv("DATABASE_URL")
_DB = dict(
    dbname=os.getenv("DB_NAME", "FYP"),
    user=os.getenv("DB_USER", "postgres"),
    password=os.getenv("DB_PASSWORD", "1234567890"),
    host=os.getenv("DB_HOST", "localhost"),
    port=int(os.getenv("DB_PORT", "5432")),
)

_ENGINE = None


_SPECIALTY_HINTS: dict[str, set[str]] = {
    "pulmonology": {
        "breath", "breathing", "asthma", "cough", "lung", "wheez", "chest tight",
    },
    "cardiology": {
        "heart", "palpitation", "chest pain", "hypertension", "blood pressure",
    },
    "neurology": {
        "migraine", "headache", "seizure", "numb", "vertigo", "memory",
    },
    "dermatology": {
        "rash", "skin", "itch", "eczema", "acne", "hives",
    },
    "gastroenterology": {
        "stomach", "abdomen", "nausea", "vomit", "diarrhea", "constipation", "reflux",
    },
    "orthopedics": {
        "joint", "knee", "back pain", "fracture", "sprain", "shoulder",
    },
    "psychiatry": {
        "anxiety", "depression", "panic", "sleep", "insomnia", "stress",
    },
    "ent": {
        "sinus", "ear", "throat", "hearing", "tonsil", "nose",
    },
    "general medicine": {
        "fever", "fatigue", "viral", "infection", "checkup", "general",
    },
}


def _engine():
    global _ENGINE
    if _ENGINE is not None:
        return _ENGINE

    if _DATABASE_URL:
        url = _DATABASE_URL
    else:
        if not _DB.get("password"):
            raise RuntimeError("Missing DB_PASSWORD for doctor matching tools")
        url = (
            f"postgresql+psycopg2://{_DB['user']}:{_DB['password']}@"
            f"{_DB['host']}:{_DB['port']}/{_DB['dbname']}"
        )
    _ENGINE = create_engine(
        url,
        poolclass=QueuePool,
        pool_size=5,
        max_overflow=10,
        pool_timeout=30,
        pool_pre_ping=True,
        pool_recycle=1800,
    )
    return _ENGINE


def _normalize_text(v: str | None) -> str:
    return (v or "").strip().lower()


def _as_uuid(value: str) -> uuid.UUID:
    return uuid.UUID(str(value).strip())


def _to_mappings(result) -> list[dict[str, Any]]:
    return [dict(r._mapping) for r in result.fetchall()]


def _token_overlap_ratio(a: str | None, b: str | None) -> float:
    ta = {t for t in _normalize_text(a).replace(",", " ").split() if t}
    tb = {t for t in _normalize_text(b).replace(",", " ").split() if t}
    if not ta or not tb:
        return 0.0
    common = ta.intersection(tb)
    return len(common) / max(len(ta), 1)


def _infer_specialties(need_text: str) -> list[str]:
    q = _normalize_text(need_text)
    scores: list[tuple[str, int]] = []
    for specialty, hints in _SPECIALTY_HINTS.items():
        matches = sum(1 for h in hints if h in q)
        if matches:
            scores.append((specialty, matches))
    if not scores:
        return ["general medicine"]
    scores.sort(key=lambda x: x[1], reverse=True)
    return [s for s, _ in scores]


def _optional_llm_refine(
    need_text: str,
    candidates: list[dict[str, Any]],
    use_llm_refinement: bool,
) -> list[dict[str, Any]]:
    if not use_llm_refinement or not candidates:
        return candidates

    try:
        llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)
        prompt = (
            "Given the patient need and candidate doctors, reorder candidates from best to worst. "
            "Return JSON only: {\"ordered_doctor_ids\":[\"...\"]}.\n"
            f"Need: {need_text}\n"
            f"Candidates: {candidates}"
        )
        resp = llm.invoke(prompt)
        content = str(resp.content)
        start = content.find("[")
        end = content.find("]", start + 1)
        if start == -1 or end == -1:
            return candidates

        ordered = [x.strip().strip('"').strip("'") for x in content[start + 1:end].split(",") if x.strip()]
        index = {c["doctor_id"]: c for c in candidates}
        out: list[dict[str, Any]] = []
        seen: set[str] = set()
        for did in ordered:
            if did in index:
                out.append(index[did])
                seen.add(did)
        for c in candidates:
            if c["doctor_id"] not in seen:
                out.append(c)
        return out
    except Exception as exc:  # pragma: no cover
        log.warning("LLM refinement failed, using deterministic order: %s", exc)
        return candidates


def profile_user(user_id: str) -> dict[str, Any]:
    """Return a user profile snapshot with soft-delete filtering."""
    uid = _as_uuid(user_id)
    sql = text(
        """
        SELECT
            user_id, email, first_name, last_name, role, status,
            specialty, clinic_address,
            address, date_of_birth, gender, allergies, chronic_conditions
        FROM usr
        WHERE user_id = :uid AND deleted_at IS NULL
        LIMIT 1
        """
    )
    try:
        with _engine().connect() as conn:
            row = conn.execute(sql, {"uid": uid}).mappings().first()
            if not row:
                raise ValueError("User not found")
            data = dict(row)
            data["user_id"] = str(data["user_id"])
            return data
    except SQLAlchemyError as exc:
        raise RuntimeError(f"Failed to profile user: {exc}") from exc


def search_user(query: str, role: str | None = None, limit: int = 10) -> list[dict[str, Any]]:
    """Search users by email/name with optional role filter and soft-delete filtering."""
    q = _normalize_text(query)
    if len(q) < 2:
        return []

    sql = text(
        """
        SELECT user_id, email, first_name, last_name, role, status
        FROM usr
        WHERE deleted_at IS NULL
          AND (
            email ILIKE :pat
            OR COALESCE(first_name, '') ILIKE :pat
            OR COALESCE(last_name, '') ILIKE :pat
            OR (COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')) ILIKE :pat
          )
          AND (:role_filter IS NULL OR role = :role_filter)
        ORDER BY updated_at DESC NULLS LAST
        LIMIT :lim
        """
    )

    try:
        with _engine().connect() as conn:
            rows = conn.execute(
                sql,
                {"pat": f"%{q}%", "role_filter": role, "lim": int(limit)},
            ).mappings().all()
            out = [dict(r) for r in rows]
            for row in out:
                row["user_id"] = str(row["user_id"])
            return out
    except SQLAlchemyError as exc:
        raise RuntimeError(f"Failed to search user: {exc}") from exc


def get_doctor_profile(doctor_id: str) -> dict[str, Any]:
    """Get doctor profile with soft-delete filtering and role enforcement."""
    did = _as_uuid(doctor_id)
    sql = text(
        """
        SELECT
            user_id, email, first_name, last_name, role, status,
            specialty, clinic_address, years_of_experience, qualifications
        FROM usr
        WHERE user_id = :did
          AND role = 'doctor'
          AND deleted_at IS NULL
        LIMIT 1
        """
    )
    try:
        with _engine().connect() as conn:
            row = conn.execute(sql, {"did": did}).mappings().first()
            if not row:
                raise ValueError("Doctor not found")
            data = dict(row)
            data["user_id"] = str(data["user_id"])
            return data
    except SQLAlchemyError as exc:
        raise RuntimeError(f"Failed to get doctor profile: {exc}") from exc


def list_available_slots(
    doctor_id: str,
    on_date: date | None = None,
    days_ahead: int = 14,
    limit: int = 30,
) -> list[dict[str, Any]]:
    """List available future slots for a doctor with soft-delete filtering."""
    did = _as_uuid(doctor_id)
    start_dt = datetime.utcnow()
    end_dt = start_dt + timedelta(days=max(1, days_ahead))

    filters = [
        "doctor_id = :did",
        "is_available = TRUE",
        "deleted_at IS NULL",
        "start_time >= :start_dt",
        "start_time <= :end_dt",
    ]
    params: dict[str, Any] = {
        "did": did,
        "start_dt": start_dt,
        "end_dt": end_dt,
        "lim": int(limit),
    }
    if on_date is not None:
        filters.append("DATE(start_time) = :on_date")
        params["on_date"] = on_date

    sql = text(
        f"""
        SELECT slot_id, doctor_id, start_time, end_time, is_available
        FROM time_slot
        WHERE {' AND '.join(filters)}
        ORDER BY start_time ASC
        LIMIT :lim
        """
    )

    try:
        with _engine().connect() as conn:
            rows = conn.execute(sql, params).mappings().all()
            out = [dict(r) for r in rows]
            for row in out:
                row["slot_id"] = str(row["slot_id"])
                row["doctor_id"] = str(row["doctor_id"])
            return out
    except SQLAlchemyError as exc:
        raise RuntimeError(f"Failed to list available slots: {exc}") from exc


def search_doctors_for_need(
    need_text: str,
    patient_user_id: str,
    max_results: int = 5,
    use_llm_refinement: bool = False,
) -> dict[str, Any]:
    """Deterministic ranking: specialty match -> availability -> proximity -> price tie-break."""
    patient = profile_user(patient_user_id)
    inferred = _infer_specialties(need_text)
    patient_address = patient.get("address")

    specialty_sql = text(
        """
        SELECT
            d.user_id,
            d.first_name,
            d.last_name,
            d.specialty,
            d.clinic_address,
            d.status,
            MIN(ts.start_time) AS earliest_available_at,
            AVG(a.fee) FILTER (WHERE a.fee IS NOT NULL) AS avg_fee
        FROM usr d
        LEFT JOIN time_slot ts
            ON ts.doctor_id = d.user_id
           AND ts.deleted_at IS NULL
           AND ts.is_available = TRUE
           AND ts.start_time >= NOW()
        LEFT JOIN appointment a
            ON a.doctor_id = d.user_id
           AND a.deleted_at IS NULL
        WHERE d.deleted_at IS NULL
          AND d.role = 'doctor'
          AND COALESCE(LOWER(d.status), 'active') != 'suspended'
          AND (
            LOWER(COALESCE(d.specialty, '')) = ANY(:specialties)
            OR :allow_fallback = TRUE
          )
        GROUP BY d.user_id, d.first_name, d.last_name, d.specialty, d.clinic_address, d.status
        HAVING MIN(ts.start_time) IS NOT NULL
        """
    )

    specialties = [s.lower() for s in inferred]
    candidates: list[dict[str, Any]] = []

    try:
        with _engine().connect() as conn:
            rows = conn.execute(
                specialty_sql,
                {
                    "specialties": specialties,
                    "allow_fallback": False,
                },
            ).mappings().all()

            # Fallback to any active doctors with availability.
            if not rows:
                rows = conn.execute(
                    specialty_sql,
                    {
                        "specialties": specialties,
                        "allow_fallback": True,
                    },
                ).mappings().all()

            for r in rows:
                specialty = _normalize_text(r.get("specialty"))
                specialty_match = 0 if specialty in specialties else 1
                earliest = r.get("earliest_available_at")
                proximity = _token_overlap_ratio(patient_address, r.get("clinic_address"))
                avg_fee = float(r.get("avg_fee")) if r.get("avg_fee") is not None else 10**9

                candidates.append(
                    {
                        "doctor_id": str(r["user_id"]),
                        "doctor_name": f"{r.get('first_name') or ''} {r.get('last_name') or ''}".strip(),
                        "specialty": r.get("specialty"),
                        "clinic_address": r.get("clinic_address"),
                        "earliest_available_at": earliest.isoformat() if earliest else None,
                        "avg_session_price": None if avg_fee == 10**9 else avg_fee,
                        "ranking_features": {
                            "specialty_match_rank": specialty_match,
                            "earliest_available_at": earliest.isoformat() if earliest else None,
                            "proximity_score": round(proximity, 6),
                            "avg_fee": None if avg_fee == 10**9 else avg_fee,
                        },
                        "ranking_reason": "specialty+availability+proximity+price",
                    }
                )

        candidates.sort(
            key=lambda c: (
                c["ranking_features"]["specialty_match_rank"],
                c["earliest_available_at"] or "9999-12-31T23:59:59",
                -float(c["ranking_features"]["proximity_score"]),
                c["ranking_features"]["avg_fee"] if c["ranking_features"]["avg_fee"] is not None else 10**9,
                c["doctor_name"].lower(),
            )
        )
        limited = candidates[: max(1, int(max_results))]
        refined = _optional_llm_refine(need_text, limited, use_llm_refinement)

        return {
            "inferred_specialties": inferred,
            "candidates": refined,
            "deterministic_ordering": [
                "specialty_match",
                "earliest_availability",
                "proximity",
                "price",
            ],
            "llm_refinement_applied": bool(use_llm_refinement),
        }
    except SQLAlchemyError as exc:
        raise RuntimeError(f"Failed to search doctors for need: {exc}") from exc


def _idempotency_key(thread_id: str, patient_id: str, doctor_id: str, dt: datetime) -> str:
    payload = f"{thread_id.strip()}|{patient_id.strip()}|{doctor_id.strip()}|{dt.isoformat()}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def _advisory_lock_int(key_hex: str) -> int:
    return int(key_hex[:16], 16) & ((1 << 63) - 1)


def book_appointment(
    *,
    thread_id: str,
    actor_user_id: str,
    patient_user_id: str,
    doctor_id: str,
    appointment_date: date,
    appointment_time: time,
    doctor_name: str | None = None,
    appointment_type: str | None = None,
    fee: float | None = None,
) -> dict[str, Any]:
    """Book an appointment atomically with idempotency and slot locking safeguards."""
    if not thread_id.strip():
        raise ValueError("thread_id is required")

    actor_uuid = _as_uuid(actor_user_id)
    patient_uuid = _as_uuid(patient_user_id)
    doctor_uuid = _as_uuid(doctor_id)

    if not isinstance(appointment_date, date) or not isinstance(appointment_time, time):
        raise ValueError("appointment_date and appointment_time are required")

    target_dt = datetime.combine(appointment_date, appointment_time)
    key_hex = _idempotency_key(thread_id, patient_user_id, doctor_id, target_dt)
    lock_key = _advisory_lock_int(key_hex)

    doctor_sql = text(
        """
        SELECT user_id, first_name, last_name, role, deleted_at
        FROM usr
        WHERE user_id = :did AND role = 'doctor' AND deleted_at IS NULL
        LIMIT 1
        """
    )

    actor_sql = text(
        """
        SELECT user_id, role, deleted_at
        FROM usr
        WHERE user_id = :aid AND deleted_at IS NULL
        LIMIT 1
        """
    )

    slot_lock_sql = text(
        """
        SELECT slot_id, doctor_id, start_time, end_time, is_available
        FROM time_slot
        WHERE doctor_id = :did
          AND deleted_at IS NULL
                    AND DATE(start_time) = :appt_date
                    AND :target_dt >= start_time
                    AND :target_dt < end_time
        ORDER BY start_time ASC
        LIMIT 1
        FOR UPDATE
        """
    )

    existing_for_key_sql = text(
        """
        SELECT a.appointment_id, a.status, a.slot_id, ts.start_time, ts.end_time
        FROM appointment a
        JOIN time_slot ts ON ts.slot_id = a.slot_id
        WHERE a.deleted_at IS NULL
          AND ts.deleted_at IS NULL
          AND a.patient_id = :pid
          AND a.doctor_id = :did
          AND a.status IN ('scheduled', 'completed')
          AND DATE(ts.start_time) = :appt_date
                    AND :target_dt >= ts.start_time
                    AND :target_dt < ts.end_time
        LIMIT 1
        """
    )

    existing_for_slot_sql = text(
        """
        SELECT appointment_id, patient_id, status
        FROM appointment
        WHERE slot_id = :sid
          AND deleted_at IS NULL
          AND status IN ('scheduled', 'completed')
        LIMIT 1
        """
    )

    insert_sql = text(
        """
        INSERT INTO appointment (
            patient_id, doctor_id, slot_id, status,
            appointment_type, fee
        ) VALUES (
            :pid, :did, :sid, 'scheduled',
            :appt_type, :fee
        )
        RETURNING appointment_id
        """
    )

    mark_slot_unavailable_sql = text(
        """
        UPDATE time_slot
        SET is_available = FALSE, updated_at = NOW()
        WHERE slot_id = :sid
        """
    )

    try:
        with _engine().begin() as conn:
            actor = conn.execute(actor_sql, {"aid": actor_uuid}).mappings().first()
            if not actor:
                raise ValueError("Actor user not found")
            if actor["role"] not in {"admin", "doctor"}:
                raise PermissionError("Only admin or doctor can book on behalf of a patient")

            doctor = conn.execute(doctor_sql, {"did": doctor_uuid}).mappings().first()
            if not doctor:
                raise ValueError("Doctor not found")

            if doctor_name:
                db_name = f"{doctor.get('first_name') or ''} {doctor.get('last_name') or ''}".strip().lower()
                if doctor_name.strip().lower() not in {db_name, str(doctor_uuid)}:
                    raise ValueError("Provided doctor_name does not match doctor_id")

            conn.execute(text("SELECT pg_advisory_xact_lock(:k)"), {"k": lock_key})

            existing_key = conn.execute(
                existing_for_key_sql,
                {
                    "pid": patient_uuid,
                    "did": doctor_uuid,
                    "appt_date": appointment_date,
                    "target_dt": target_dt,
                },
            ).mappings().first()
            if existing_key:
                return {
                    "status": "booked",
                    "idempotent_replay": True,
                    "idempotency_key": key_hex,
                    "appointment_id": str(existing_key["appointment_id"]),
                    "slot_id": str(existing_key["slot_id"]),
                    "doctor_id": str(doctor_uuid),
                    "patient_id": str(patient_uuid),
                    "appointment_date": appointment_date.isoformat(),
                    "appointment_time": appointment_time.isoformat(),
                    "message": "Existing appointment returned for idempotent retry.",
                }

            slot = conn.execute(
                slot_lock_sql,
                {
                    "did": doctor_uuid,
                    "appt_date": appointment_date,
                    "target_dt": target_dt,
                },
            ).mappings().first()
            if not slot:
                raise ValueError("No matching time slot found for doctor/date/time")

            if not slot["is_available"]:
                raise ValueError("Requested slot is not available")

            existing_slot = conn.execute(existing_for_slot_sql, {"sid": slot["slot_id"]}).mappings().first()
            if existing_slot:
                raise ValueError("Requested slot is already booked")

            created = conn.execute(
                insert_sql,
                {
                    "pid": patient_uuid,
                    "did": doctor_uuid,
                    "sid": slot["slot_id"],
                    "appt_type": appointment_type,
                    "fee": fee,
                },
            ).mappings().first()

            conn.execute(mark_slot_unavailable_sql, {"sid": slot["slot_id"]})

            return {
                "status": "booked",
                "idempotent_replay": False,
                "idempotency_key": key_hex,
                "appointment_id": str(created["appointment_id"]),
                "slot_id": str(slot["slot_id"]),
                "doctor_id": str(doctor_uuid),
                "patient_id": str(patient_uuid),
                "appointment_date": appointment_date.isoformat(),
                "appointment_time": appointment_time.isoformat(),
                "message": "Appointment booked successfully.",
            }
    except (SQLAlchemyError, ValueError, PermissionError) as exc:
        log.error("Appointment booking failed: %s", exc)
        raise


__all__ = [
    "book_appointment",
    "get_doctor_profile",
    "list_available_slots",
    "profile_user",
    "search_doctors_for_need",
    "search_user",
]
