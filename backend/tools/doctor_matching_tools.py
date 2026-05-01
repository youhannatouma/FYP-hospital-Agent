"""SQLAlchemy-backed tools for doctor matching and conditional booking."""
from __future__ import annotations

import hashlib
import json
import logging
import math
import os
import uuid
from datetime import date, datetime, time, timedelta, timezone
from typing import Any
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.pool import QueuePool

try:
    from middleware import approval_manager
except ImportError:  # Fallback for backend package context
    from ..middleware import approval_manager

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


class BookingDomainError(Exception):
    """Domain-level booking error with stable code and safe message."""

    def __init__(self, code: str, message: str):
        super().__init__(message)
        self.code = code
        self.message = message

    def to_dict(self) -> dict[str, str]:
        return {"code": self.code, "message": self.message}


def _is_patient_assigned_to_doctor(conn, doctor_id: uuid.UUID, patient_id: uuid.UUID) -> bool:
        sql = text(
                """
                SELECT 1
                FROM doctor_patient_assignment
                WHERE doctor_id = :did
                    AND patient_id = :pid
                    AND is_active = TRUE
                    AND deleted_at IS NULL
                LIMIT 1
                """
        )
        row = conn.execute(sql, {"did": doctor_id, "pid": patient_id}).first()
        return row is not None


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


def _normalize_address_for_geocoding(address: str | None) -> str:
    """Normalize free-text addresses for geocoding/fallback scoring consistency."""
    if not address:
        return ""
    normalized = str(address).strip().lower()
    for ch in [",", ".", ";", "#", "\\n", "\\t"]:
        normalized = normalized.replace(ch, " ")
    return " ".join(normalized.split())


def _coerce_coordinate(value: Any, minimum: float, maximum: float) -> float | None:
    """Return bounded float coordinate value or None when invalid."""
    if value is None:
        return None
    try:
        as_float = float(value)
    except (TypeError, ValueError):
        return None
    if minimum <= as_float <= maximum:
        return as_float
    return None


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Compute great-circle distance in kilometers."""
    r_earth_km = 6371.0088
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(d_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(max(1 - a, 0.0)))
    return r_earth_km * c


def _distance_to_proximity_score(distance_km: float | None) -> float:
    """Convert distance to a score where smaller distance is larger score."""
    if distance_km is None:
        return 0.0
    # Smooth monotonic transform to [0, 1], compatible with existing descending sort.
    return 1.0 / (1.0 + max(distance_km, 0.0))


def _proximity_score_with_fallback(
    patient: dict[str, Any],
    doctor_row: dict[str, Any],
) -> tuple[float, str, float | None]:
    """Prefer coordinate distance; fall back to token overlap when geodata is missing."""
    patient_lat = _coerce_coordinate(patient.get("patient_latitude"), -90.0, 90.0)
    patient_lon = _coerce_coordinate(patient.get("patient_longitude"), -180.0, 180.0)
    doctor_lat = _coerce_coordinate(doctor_row.get("clinic_latitude"), -90.0, 90.0)
    doctor_lon = _coerce_coordinate(doctor_row.get("clinic_longitude"), -180.0, 180.0)

    if None not in {patient_lat, patient_lon, doctor_lat, doctor_lon}:
        distance_km = _haversine_km(
            patient_lat,
            patient_lon,
            doctor_lat,
            doctor_lon,
        )
        return _distance_to_proximity_score(distance_km), "distance", round(distance_km, 3)

    patient_address = _normalize_address_for_geocoding(patient.get("address"))
    clinic_address = _normalize_address_for_geocoding(doctor_row.get("clinic_address"))
    return _token_overlap_ratio(patient_address, clinic_address), "token_overlap", None


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
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    meta: dict[str, Any] = {
        "requested": bool(use_llm_refinement),
        "applied": False,
        "reason": "refinement_disabled",
        "invalid_id_count": 0,
        "unknown_id_count": 0,
        "duplicate_id_count": 0,
    }

    if not use_llm_refinement or not candidates:
        return candidates, meta

    try:
        meta["reason"] = "parse_failed"

        llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)
        # Keep prompt payload compact and stable to reduce malformed responses.
        safe_need = " ".join(str(need_text).split())[:500]
        prompt_candidates = [
            {
                "doctor_id": c.get("doctor_id"),
                "specialty": c.get("specialty"),
                "earliest_available_at": c.get("earliest_available_at"),
                "avg_session_price": c.get("avg_session_price"),
            }
            for c in candidates
        ]
        prompt = (
            "Given the patient need and candidate doctors, reorder candidates from best to worst. "
            "Return JSON only: {\"ordered_doctor_ids\":[\"...\"]}.\n"
            f"Need: {safe_need}\n"
            f"Candidates: {json.dumps(prompt_candidates, ensure_ascii=True)}"
        )
        resp = llm.invoke(prompt)
        content = str(resp.content).strip()
        payload = json.loads(content)
        ordered_ids = payload.get("ordered_doctor_ids") if isinstance(payload, dict) else None
        if not isinstance(ordered_ids, list):
            meta["reason"] = "invalid_schema"
            return candidates, meta

        index: dict[str, dict[str, Any]] = {}
        for candidate in candidates:
            doctor_id = candidate.get("doctor_id")
            if not doctor_id:
                continue
            try:
                index[str(uuid.UUID(str(doctor_id)))] = candidate
            except (ValueError, TypeError, AttributeError):
                # Candidate IDs are expected to be valid UUIDs; skip malformed records safely.
                continue

        out: list[dict[str, Any]] = []
        seen: set[str] = set()
        for raw_id in ordered_ids:
            if not isinstance(raw_id, str):
                meta["invalid_id_count"] += 1
                continue

            try:
                did = str(uuid.UUID(raw_id))
            except ValueError:
                meta["invalid_id_count"] += 1
                continue

            if did not in index:
                meta["unknown_id_count"] += 1
                continue
            if did in seen:
                meta["duplicate_id_count"] += 1
                continue

            out.append(index[did])
            seen.add(did)

        if not out:
            meta["reason"] = "no_valid_ids"
            return candidates, meta

        for c in candidates:
            try:
                candidate_id = str(uuid.UUID(str(c["doctor_id"])))
            except (ValueError, TypeError, KeyError):
                out.append(c)
                continue
            if candidate_id not in seen:
                out.append(c)

        meta["applied"] = out != candidates
        meta["reason"] = "ok" if meta["applied"] else "valid_but_no_reordering"
        return out, meta
    except (json.JSONDecodeError, KeyError, TypeError, ValueError) as exc:  # pragma: no cover
        log.warning("LLM refinement parse failed, using deterministic order: %s", exc)
        meta["reason"] = "json_parse_error"
        return candidates, meta
    except Exception as exc:  # pragma: no cover
        log.warning("LLM refinement failed, using deterministic order: %s", exc)
        meta["reason"] = "llm_error"
        return candidates, meta


def profile_user(user_id: str) -> dict[str, Any]:
    """Return a user profile snapshot with soft-delete filtering."""
    uid = _as_uuid(user_id)
    sql = text(
        """
        SELECT
            user_id, email, first_name, last_name, role, status,
            specialty, clinic_address,
            clinic_latitude, clinic_longitude,
            address, patient_latitude, patient_longitude,
            date_of_birth, gender, allergies, chronic_conditions
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
            specialty, clinic_address, clinic_latitude, clinic_longitude,
            years_of_experience, qualifications
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
    booking_timezone: str = "UTC",
) -> list[dict[str, Any]]:
    """List available future slots for a doctor with soft-delete filtering."""
    did = _as_uuid(doctor_id)
    start_dt = datetime.now(timezone.utc).replace(tzinfo=None)
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
        try:
            tz = ZoneInfo(booking_timezone)
        except ZoneInfoNotFoundError as exc:
            raise ValueError(f"Invalid booking timezone: {booking_timezone}") from exc
        # Convert caller-local day boundaries to UTC for stable DB matching.
        local_day_start = datetime.combine(on_date, time.min).replace(tzinfo=tz)
        local_day_end = local_day_start + timedelta(days=1)
        params["on_start_utc"] = local_day_start.astimezone(timezone.utc).replace(tzinfo=None)
        params["on_end_utc"] = local_day_end.astimezone(timezone.utc).replace(tzinfo=None)
        filters.append("start_time >= :on_start_utc")
        filters.append("start_time < :on_end_utc")

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
    specialty_sql = text(
        """
        SELECT
            d.user_id,
            d.first_name,
            d.last_name,
            d.specialty,
            d.clinic_address,
            d.clinic_latitude,
            d.clinic_longitude,
            d.status,
            MIN(ts.start_time) AS earliest_available_at,
            AVG(a.fee) FILTER (WHERE a.fee IS NOT NULL) AS avg_fee
        FROM usr d
        LEFT JOIN time_slot ts
            ON ts.doctor_id = d.user_id
           AND ts.deleted_at IS NULL
           AND ts.is_available = TRUE
           AND ts.start_time >= timezone('UTC', now())
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
        GROUP BY d.user_id, d.first_name, d.last_name, d.specialty, d.clinic_address,
                 d.clinic_latitude, d.clinic_longitude, d.status
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
                proximity, proximity_mode, distance_km = _proximity_score_with_fallback(patient, dict(r))
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
                            "proximity_mode": proximity_mode,
                            "distance_km": distance_km,
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
        refined, refinement_details = _optional_llm_refine(need_text, limited, use_llm_refinement)

        return {
            "inferred_specialties": inferred,
            "candidates": refined,
            "deterministic_ordering": [
                "specialty_match",
                "earliest_availability",
                "proximity",
                "price",
            ],
            "llm_refinement_applied": bool(refinement_details.get("applied")),
            "refinement_details": refinement_details,
        }
    except SQLAlchemyError as exc:
        raise RuntimeError(f"Failed to search doctors for need: {exc}") from exc


def _normalize_booking_datetime_utc(
    appointment_date: date,
    appointment_time: time,
    booking_timezone: str = "UTC",
) -> datetime:
    try:
        tz = ZoneInfo(booking_timezone)
    except ZoneInfoNotFoundError as exc:
        raise ValueError(f"Invalid booking timezone: {booking_timezone}") from exc

    local_dt = datetime.combine(appointment_date, appointment_time)
    aware_local = local_dt.replace(tzinfo=tz)
    return aware_local.astimezone(timezone.utc).replace(tzinfo=None)


def _idempotency_key(
    thread_id: str,
    patient_id: str,
    doctor_id: str,
    *,
    slot_id: str | None = None,
    dt_utc: datetime | None = None,
) -> str:
    target = f"slot:{slot_id.strip()}" if slot_id else f"dt_utc:{dt_utc.isoformat() if dt_utc else ''}"
    payload = f"{thread_id.strip()}|{patient_id.strip()}|{doctor_id.strip()}|{target}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def _uint32_to_int32(value: int) -> int:
    """Convert unsigned 32-bit integer to signed int32."""
    return value - (1 << 32) if value >= (1 << 31) else value


def _advisory_lock_keys(key_hex: str) -> tuple[int, int]:
    """Use two int32 lock keys for better entropy than single truncated integer."""
    if len(key_hex) < 16:
        raise ValueError("idempotency hash is too short for advisory lock key derivation")
    key1_u32 = int(key_hex[:8], 16)
    key2_u32 = int(key_hex[8:16], 16)
    return _uint32_to_int32(key1_u32), _uint32_to_int32(key2_u32)


def book_appointment(
    *,
    thread_id: str,
    actor_user_id: str,
    patient_user_id: str,
    doctor_id: str,
    slot_id: str | None = None,
    appointment_date: date | None = None,
    appointment_time: time | None = None,
    booking_timezone: str = "UTC",
    booking_reason: str | None = None,
    policy_context: dict[str, Any] | None = None,
    doctor_name: str | None = None,
    appointment_type: str | None = None,
    fee: float | None = None,
) -> dict[str, Any]:
    """Book an appointment atomically with slot-first resolution and UTC fallback."""
    if not thread_id.strip():
        raise ValueError("thread_id is required")

    actor_uuid = _as_uuid(actor_user_id)
    patient_uuid = _as_uuid(patient_user_id)
    doctor_uuid = _as_uuid(doctor_id)

    resolved_slot_uuid: uuid.UUID | None = None
    target_dt_utc: datetime | None = None
    window_start: datetime | None = None
    window_end: datetime | None = None
    resolution_mode = "slot_id" if slot_id else "datetime_fallback"

    if slot_id:
        resolved_slot_uuid = _as_uuid(slot_id)
    else:
        if not isinstance(appointment_date, date) or not isinstance(appointment_time, time):
            raise ValueError("slot_id or (appointment_date and appointment_time) is required")
        target_dt_utc = _normalize_booking_datetime_utc(
            appointment_date,
            appointment_time,
            booking_timezone=booking_timezone,
        )
        # Bounded range protects against second/microsecond precision drift.
        window_start = target_dt_utc - timedelta(seconds=59)
        window_end = target_dt_utc + timedelta(seconds=59)

    key_hex = _idempotency_key(
        thread_id,
        patient_user_id,
        doctor_id,
        slot_id=slot_id,
        dt_utc=target_dt_utc,
    )
    lock_key_1, lock_key_2 = _advisory_lock_keys(key_hex)

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

    patient_sql = text(
        """
        SELECT user_id, role, deleted_at
        FROM usr
        WHERE user_id = :pid AND deleted_at IS NULL
        LIMIT 1
        """
    )

    slot_lock_by_id_sql = text(
        """
        SELECT slot_id, doctor_id, start_time, end_time, is_available
        FROM time_slot
        WHERE slot_id = :sid
          AND doctor_id = :did
          AND deleted_at IS NULL
        LIMIT 1
        FOR UPDATE
        """
    )

    slot_lock_by_dt_sql = text(
        """
        SELECT slot_id, doctor_id, start_time, end_time, is_available
        FROM time_slot
        WHERE doctor_id = :did
          AND deleted_at IS NULL
          AND start_time >= :window_start
          AND start_time <= :window_end
        ORDER BY start_time ASC
        LIMIT 1
        FOR UPDATE
        """
    )

    existing_for_key_by_slot_sql = text(
        """
        SELECT a.appointment_id, a.status, a.slot_id, ts.start_time, ts.end_time
        FROM appointment a
        JOIN time_slot ts ON ts.slot_id = a.slot_id
        WHERE a.deleted_at IS NULL
          AND ts.deleted_at IS NULL
          AND a.patient_id = :pid
          AND a.doctor_id = :did
          AND a.slot_id = :sid
          AND a.status IN ('scheduled', 'completed')
        LIMIT 1
        """
    )

    existing_for_key_by_dt_sql = text(
        """
        SELECT a.appointment_id, a.status, a.slot_id, ts.start_time, ts.end_time
        FROM appointment a
        JOIN time_slot ts ON ts.slot_id = a.slot_id
        WHERE a.deleted_at IS NULL
          AND ts.deleted_at IS NULL
          AND a.patient_id = :pid
          AND a.doctor_id = :did
          AND a.status IN ('scheduled', 'completed')
          AND ts.start_time >= :window_start
          AND ts.start_time <= :window_end
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
                raise BookingDomainError("ActorNotFound", "Actor user not found")
            if actor["role"] not in {"admin", "doctor"}:
                raise BookingDomainError(
                    "InvalidBookingActorRole",
                    "Only admin or doctor can book on behalf of a patient",
                )

            actor_role = str(actor.get("role"))
            is_cross_patient = actor_uuid != patient_uuid

            # Enforce explicit policy matrix:
            # - admin can book any patient
            # - doctor can book only assigned patients
            if actor_role == "doctor":
                try:
                    assigned = _is_patient_assigned_to_doctor(conn, actor_uuid, patient_uuid)
                except SQLAlchemyError as exc:
                    raise BookingDomainError(
                        "AuthorizationPolicyNotConfigured",
                        "Doctor-patient assignment policy is not configured",
                    ) from exc
                if not assigned:
                    raise BookingDomainError(
                        "ActorPatientScopeViolation",
                        "Doctor is not authorized to book for this patient",
                    )
                if is_cross_patient and not (booking_reason or "").strip():
                    raise BookingDomainError(
                        "MissingAuditReason",
                        "booking_reason is required for doctor on-behalf booking",
                    )

                context = dict(policy_context or {})
                is_high_risk = bool(context.get("high_risk", False))
                if is_cross_patient and is_high_risk:
                    approval = approval_manager.create_approval_request(
                        user_id=str(actor_uuid),
                        task_id=f"book_appointment:{thread_id}",
                        tool_name="book_appointment_cross_patient",
                        operation_type="write",
                        context={
                            "actor_user_id": str(actor_uuid),
                            "patient_user_id": str(patient_uuid),
                            "doctor_id": str(doctor_uuid),
                            "booking_reason": booking_reason,
                            "policy_context": context,
                        },
                    )
                    raise BookingDomainError(
                        "ApprovalRequired",
                        f"Human approval required before booking. approval_id={approval.approval_id}",
                    )

            patient = conn.execute(patient_sql, {"pid": patient_uuid}).mappings().first()
            if not patient:
                raise BookingDomainError(
                    "PatientNotFound",
                    "Patient not found or inactive",
                )
            if patient.get("role") != "patient":
                raise BookingDomainError(
                    "InvalidPatientRole",
                    "Target user must have patient role",
                )

            doctor = conn.execute(doctor_sql, {"did": doctor_uuid}).mappings().first()
            if not doctor:
                raise BookingDomainError("DoctorNotFound", "Doctor not found")

            if doctor_name:
                db_name = f"{doctor.get('first_name') or ''} {doctor.get('last_name') or ''}".strip().lower()
                if doctor_name.strip().lower() not in {db_name, str(doctor_uuid)}:
                    raise BookingDomainError(
                        "DoctorIdentityMismatch",
                        "Provided doctor_name does not match doctor_id",
                    )

            conn.execute(
                text("SELECT pg_advisory_xact_lock(:k1, :k2)"),
                {"k1": lock_key_1, "k2": lock_key_2},
            )

            if resolved_slot_uuid is not None:
                existing_key = conn.execute(
                    existing_for_key_by_slot_sql,
                    {
                        "pid": patient_uuid,
                        "did": doctor_uuid,
                        "sid": resolved_slot_uuid,
                    },
                ).mappings().first()
            else:
                existing_key = conn.execute(
                    existing_for_key_by_dt_sql,
                    {
                        "pid": patient_uuid,
                        "did": doctor_uuid,
                        "window_start": window_start,
                        "window_end": window_end,
                    },
                ).mappings().first()

            if existing_key:
                existing_start = existing_key.get("start_time")
                return {
                    "status": "booked",
                    "idempotent_replay": True,
                    "idempotency_key": key_hex,
                    "appointment_id": str(existing_key["appointment_id"]),
                    "slot_id": str(existing_key["slot_id"]),
                    "doctor_id": str(doctor_uuid),
                    "patient_id": str(patient_uuid),
                    "appointment_date": existing_start.date().isoformat() if existing_start else None,
                    "appointment_time": existing_start.time().isoformat() if existing_start else None,
                    "resolution_mode": resolution_mode,
                    "normalized_booking_time_utc": (
                        target_dt_utc.isoformat() + "Z" if target_dt_utc else None
                    ),
                    "message": "Existing appointment returned for idempotent retry.",
                }

            if resolved_slot_uuid is not None:
                slot = conn.execute(
                    slot_lock_by_id_sql,
                    {
                        "sid": resolved_slot_uuid,
                        "did": doctor_uuid,
                    },
                ).mappings().first()
            else:
                slot = conn.execute(
                    slot_lock_by_dt_sql,
                    {
                        "did": doctor_uuid,
                        "window_start": window_start,
                        "window_end": window_end,
                    },
                ).mappings().first()

            if not slot:
                raise BookingDomainError(
                    "BookingSlotNotFound",
                    "No matching time slot found for provided booking input",
                )

            if not slot["is_available"]:
                raise BookingDomainError(
                    "BookingSlotUnavailable",
                    "Requested slot is not available",
                )

            existing_slot = conn.execute(existing_for_slot_sql, {"sid": slot["slot_id"]}).mappings().first()
            if existing_slot:
                raise BookingDomainError(
                    "BookingSlotAlreadyBooked",
                    "Requested slot is already booked",
                )

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

            slot_start = slot.get("start_time")

            return {
                "status": "booked",
                "idempotent_replay": False,
                "idempotency_key": key_hex,
                "appointment_id": str(created["appointment_id"]),
                "slot_id": str(slot["slot_id"]),
                "doctor_id": str(doctor_uuid),
                "patient_id": str(patient_uuid),
                "appointment_date": slot_start.date().isoformat() if slot_start else None,
                "appointment_time": slot_start.time().isoformat() if slot_start else None,
                "resolution_mode": resolution_mode,
                "normalized_booking_time_utc": (
                    target_dt_utc.isoformat() + "Z"
                    if target_dt_utc
                    else ((slot_start.isoformat() + "Z") if slot_start else None)
                ),
                "message": "Appointment booked successfully.",
            }
    except BookingDomainError as exc:
        log.warning(
            "Appointment booking rejected [%s]: %s (actor=%s patient=%s doctor=%s)",
            exc.code,
            exc.message,
            actor_user_id,
            patient_user_id,
            doctor_id,
        )
        raise
    except SQLAlchemyError as exc:
        log.error("Appointment booking DB failure: %s", exc)
        raise BookingDomainError(
            "BookingPersistenceError",
            "Unable to complete booking due to a persistence error",
        ) from exc


__all__ = [
    "book_appointment",
    "get_doctor_profile",
    "list_available_slots",
    "profile_user",
    "search_doctors_for_need",
    "search_user",
]
