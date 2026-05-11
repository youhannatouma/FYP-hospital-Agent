"""Read-only tools for doctor-facing appointment assistance."""
from __future__ import annotations

import os
import uuid
from datetime import date, datetime, time, timezone
from typing import Any
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.pool import QueuePool

load_dotenv()

_DATABASE_URL = os.getenv("DATABASE_URL")
_DB = dict(
    dbname=os.getenv("DB_NAME", "FYP"),
    user=os.getenv("DB_USER", "postgres"),
    password=os.getenv("DB_PASSWORD", "1234567890"),
    host=os.getenv("DB_HOST", "localhost"),
    port=int(os.getenv("DB_PORT", "5432")),
)

_ENGINE = None


def _engine():
    global _ENGINE
    if _ENGINE is not None:
        return _ENGINE

    if _DATABASE_URL:
        url = _DATABASE_URL
    else:
        if not _DB.get("password"):
            raise RuntimeError("Missing DB_PASSWORD for doctor appointment tools")
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


def _as_uuid(value: str) -> uuid.UUID:
    return uuid.UUID(str(value).strip())


def _coerce_timezone(tz_name: str | None) -> ZoneInfo:
    normalized = str(tz_name or "UTC").strip() or "UTC"
    try:
        return ZoneInfo(normalized)
    except ZoneInfoNotFoundError as exc:
        raise ValueError(f"Invalid timezone: {normalized}") from exc


def _localize_db_datetime(value: datetime, tz: ZoneInfo) -> datetime:
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(tz)


def list_doctor_appointments_for_day(
    doctor_user_id: str,
    day: date,
    timezone_name: str = "UTC",
) -> dict[str, Any]:
    """Return a doctor's scheduled appointments for one local day.

    This is intentionally read-only and doctor-scoped. The database stores slot
    timestamps as UTC-naive values in current booking code, so day boundaries are
    converted from caller-local time into UTC-naive bounds for the query.
    """
    if not isinstance(day, date):
        raise ValueError("day must be a date")

    doctor_uuid = _as_uuid(doctor_user_id)
    tz = _coerce_timezone(timezone_name)
    local_start = datetime.combine(day, time.min).replace(tzinfo=tz)
    local_end = datetime.combine(day, time.max).replace(tzinfo=tz)
    start_utc = local_start.astimezone(timezone.utc).replace(tzinfo=None)
    end_utc = local_end.astimezone(timezone.utc).replace(tzinfo=None)

    sql = text(
        """
        SELECT
            a.appointment_id,
            a.patient_id,
            a.doctor_id,
            a.status,
            a.appointment_type,
            a.fee,
            a.room_id,
            ts.start_time,
            ts.end_time,
            p.first_name AS patient_first_name,
            p.last_name AS patient_last_name,
            p.email AS patient_email
        FROM appointment a
        JOIN time_slot ts
          ON ts.slot_id = a.slot_id
         AND ts.deleted_at IS NULL
        JOIN usr p
          ON p.user_id = a.patient_id
         AND p.deleted_at IS NULL
        WHERE a.doctor_id = :doctor_id
          AND a.deleted_at IS NULL
          AND a.status = 'scheduled'
          AND ts.start_time >= :start_utc
          AND ts.start_time <= :end_utc
        ORDER BY ts.start_time ASC, p.last_name ASC NULLS LAST, p.first_name ASC NULLS LAST
        """
    )

    try:
        with _engine().connect() as conn:
            rows = conn.execute(
                sql,
                {
                    "doctor_id": doctor_uuid,
                    "start_utc": start_utc,
                    "end_utc": end_utc,
                },
            ).mappings().all()
    except SQLAlchemyError as exc:
        raise RuntimeError(f"Failed to list doctor appointments: {exc}") from exc

    appointments: list[dict[str, Any]] = []
    for row in rows:
        start = row.get("start_time")
        end = row.get("end_time")
        local_start_dt = _localize_db_datetime(start, tz) if isinstance(start, datetime) else None
        local_end_dt = _localize_db_datetime(end, tz) if isinstance(end, datetime) else None
        first = str(row.get("patient_first_name") or "").strip()
        last = str(row.get("patient_last_name") or "").strip()
        patient_name = " ".join(part for part in [first, last] if part).strip() or "Patient"
        appointments.append(
            {
                "appointment_id": str(row["appointment_id"]),
                "patient_id": str(row["patient_id"]),
                "patient_name": patient_name,
                "patient_email": row.get("patient_email"),
                "status": str(row.get("status") or ""),
                "appointment_type": row.get("appointment_type"),
                "fee": float(row["fee"]) if row.get("fee") is not None else None,
                "room_id": str(row["room_id"]) if row.get("room_id") is not None else None,
                "start_time_utc": start.isoformat() + "Z" if isinstance(start, datetime) else None,
                "end_time_utc": end.isoformat() + "Z" if isinstance(end, datetime) else None,
                "start_time_local": local_start_dt.isoformat() if local_start_dt else None,
                "end_time_local": local_end_dt.isoformat() if local_end_dt else None,
                "display_time": local_start_dt.strftime("%I:%M %p").lstrip("0") if local_start_dt else None,
                "display_end_time": local_end_dt.strftime("%I:%M %p").lstrip("0") if local_end_dt else None,
            }
        )

    return {
        "doctor_user_id": str(doctor_uuid),
        "date": day.isoformat(),
        "timezone": str(tz.key),
        "count": len(appointments),
        "appointments": appointments,
    }


__all__ = ["list_doctor_appointments_for_day"]
