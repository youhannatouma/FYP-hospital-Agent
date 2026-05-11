from __future__ import annotations

import base64
import hashlib
import json
import logging
import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import and_, func, or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.workflow_trace_event import WorkflowTraceEvent

_SCHEMA_VERSION = "workflow-trace-v1"
log = logging.getLogger("backend.telemetry.workflow_trace")


def new_run_id() -> str:
    return str(uuid.uuid4())


def _next_sequence(session: Session, *, workflow_family: str, run_id: str) -> int:
    current = (
        session.query(func.coalesce(func.max(WorkflowTraceEvent.sequence), 0))
        .filter(
            WorkflowTraceEvent.workflow_family == workflow_family,
            WorkflowTraceEvent.run_id == run_id,
        )
        .scalar()
    )
    return int(current or 0) + 1


def _hash_text(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()[:16]


def _sanitize_payload(payload: dict[str, Any] | None) -> dict[str, Any]:
    if not payload:
        return {"schema_version": _SCHEMA_VERSION}

    out: dict[str, Any] = {"schema_version": _SCHEMA_VERSION}
    for key, value in payload.items():
        if value is None:
            continue
        lowered = key.lower()
        if isinstance(value, str) and any(token in lowered for token in ("message", "text", "reason", "email", "address")):
            out[f"{key}_hash"] = _hash_text(value)
            continue
        if isinstance(value, str) and len(value) > 240:
            out[f"{key}_hash"] = _hash_text(value)
            continue
        out[key] = value
    return out


def encode_trace_cursor(*, occurred_at: datetime | None, sequence: int, trace_id: str) -> str:
    payload = {
        "occurred_at": occurred_at.isoformat() if isinstance(occurred_at, datetime) else None,
        "sequence": int(sequence),
        "trace_id": str(trace_id),
    }
    raw = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8")
    return base64.urlsafe_b64encode(raw).decode("ascii")


def decode_trace_cursor(cursor: str) -> dict[str, Any] | None:
    try:
        raw = base64.urlsafe_b64decode(cursor.encode("ascii"))
        payload = json.loads(raw.decode("utf-8"))
        occurred_raw = payload.get("occurred_at")
        occurred_at = None
        if occurred_raw:
            value = str(occurred_raw)
            if value.endswith("Z"):
                value = value[:-1] + "+00:00"
            occurred_at = datetime.fromisoformat(value)
        return {
            "occurred_at": occurred_at,
            "sequence": int(payload["sequence"]),
            "trace_id": str(payload["trace_id"]),
        }
    except Exception:
        return None


def emit_workflow_trace_event(
    *,
    workflow_family: str,
    thread_id: str,
    run_id: str,
    event_type: str,
    actor_user_id: str | None = None,
    patient_user_id: str | None = None,
    node_name: str | None = None,
    status: str | None = None,
    duration_ms: int | None = None,
    payload: dict[str, Any] | None = None,
    db: Session | None = None,
) -> WorkflowTraceEvent | None:
    own_session = db is None
    session = db or SessionLocal()
    last_error: Exception | None = None
    try:
        for _attempt in range(3):
            try:
                event = WorkflowTraceEvent(
                    workflow_family=workflow_family,
                    thread_id=str(thread_id or ""),
                    actor_user_id=str(actor_user_id) if actor_user_id else None,
                    patient_user_id=str(patient_user_id) if patient_user_id else None,
                    run_id=run_id,
                    node_name=node_name,
                    event_type=event_type,
                    sequence=_next_sequence(
                        session, workflow_family=workflow_family, run_id=run_id
                    ),
                    status=status,
                    duration_ms=duration_ms,
                    payload_json=_sanitize_payload(payload),
                    occurred_at=datetime.utcnow(),
                )
            except Exception as exc:
                # Fail open when telemetry DB is unavailable so product flows/tests continue.
                last_error = exc
                break
            try:
                session.add(event)
                session.commit()
                session.refresh(event)
                return event
            except IntegrityError as exc:
                session.rollback()
                last_error = exc
                # Retry on sequence uniqueness races.
                continue
            except Exception as exc:
                session.rollback()
                last_error = exc
                break
        if last_error:
            log.error(
                "workflow_trace_write_failed workflow_family=%s thread_id=%s run_id=%s event_type=%s node_name=%s error=%s",
                workflow_family,
                thread_id,
                run_id,
                event_type,
                node_name,
                type(last_error).__name__,
            )
        return None
    finally:
        if own_session:
            session.close()


def list_workflow_trace_events(
    *,
    db: Session,
    workflow_family: str | None = None,
    thread_id: str | None = None,
    run_id: str | None = None,
    before_cursor: str | None = None,
    actor_user_id: str | None = None,
    patient_user_id: str | None = None,
    visible_to_user_id: str | None = None,
    limit: int = 100,
) -> list[WorkflowTraceEvent]:
    query = db.query(WorkflowTraceEvent)
    if workflow_family:
        query = query.filter(WorkflowTraceEvent.workflow_family == workflow_family)
    if thread_id:
        query = query.filter(WorkflowTraceEvent.thread_id == thread_id)
    if run_id:
        query = query.filter(WorkflowTraceEvent.run_id == run_id)
    if visible_to_user_id:
        query = query.filter(
            or_(
                WorkflowTraceEvent.actor_user_id == visible_to_user_id,
                WorkflowTraceEvent.patient_user_id == visible_to_user_id,
            )
        )
    else:
        if actor_user_id:
            query = query.filter(WorkflowTraceEvent.actor_user_id == actor_user_id)
        if patient_user_id:
            query = query.filter(WorkflowTraceEvent.patient_user_id == patient_user_id)

    if before_cursor:
        cursor = decode_trace_cursor(before_cursor)
        if cursor is None:
            # Backward-compatibility for older clients that send raw trace_id.
            try:
                trace_uuid = uuid.UUID(str(before_cursor))
            except ValueError:
                trace_uuid = None
            if trace_uuid is not None:
                anchor = (
                    db.query(WorkflowTraceEvent)
                    .filter(WorkflowTraceEvent.trace_id == trace_uuid)
                    .first()
                )
                if anchor:
                    cursor = {
                        "occurred_at": anchor.occurred_at,
                        "sequence": int(anchor.sequence),
                        "trace_id": str(anchor.trace_id),
                    }
        if cursor:
            cursor_time = cursor.get("occurred_at")
            cursor_seq = int(cursor.get("sequence") or 0)
            cursor_trace_id = str(cursor.get("trace_id") or "")
            try:
                cursor_trace_uuid = uuid.UUID(cursor_trace_id)
            except ValueError:
                cursor_trace_uuid = None
            if cursor_time:
                seek_parts = [
                    WorkflowTraceEvent.occurred_at < cursor_time,
                    and_(
                        WorkflowTraceEvent.occurred_at == cursor_time,
                        WorkflowTraceEvent.sequence < cursor_seq,
                    ),
                ]
                if cursor_trace_uuid is not None:
                    seek_parts.append(
                        and_(
                            WorkflowTraceEvent.occurred_at == cursor_time,
                            WorkflowTraceEvent.sequence == cursor_seq,
                            WorkflowTraceEvent.trace_id < cursor_trace_uuid,
                        )
                    )
                query = query.filter(
                    or_(*seek_parts)
                )
    return (
        query.order_by(
            WorkflowTraceEvent.occurred_at.desc(),
            WorkflowTraceEvent.sequence.desc(),
            WorkflowTraceEvent.trace_id.desc(),
        )
        .limit(max(1, min(200, int(limit))))
        .all()
    )


def serialize_trace_event(event: WorkflowTraceEvent) -> dict[str, Any]:
    return {
        "trace_id": str(event.trace_id),
        "workflow_family": event.workflow_family,
        "thread_id": event.thread_id,
        "actor_user_id": event.actor_user_id,
        "patient_user_id": event.patient_user_id,
        "run_id": event.run_id,
        "node_name": event.node_name,
        "event_type": event.event_type,
        "sequence": int(event.sequence),
        "occurred_at": event.occurred_at.isoformat() if isinstance(event.occurred_at, datetime) else None,
        "duration_ms": event.duration_ms,
        "status": event.status,
        "payload_json": event.payload_json or {},
    }
