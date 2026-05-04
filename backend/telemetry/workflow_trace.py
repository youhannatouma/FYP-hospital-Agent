from __future__ import annotations

import hashlib
import threading
import uuid
from datetime import datetime
from typing import Any

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.workflow_trace_event import WorkflowTraceEvent

_SCHEMA_VERSION = "workflow-trace-v1"
_sequence_lock = threading.Lock()
_sequence_by_run: dict[str, int] = {}


def new_run_id() -> str:
    return str(uuid.uuid4())


def _next_sequence(run_id: str) -> int:
    with _sequence_lock:
        current = _sequence_by_run.get(run_id, 0) + 1
        _sequence_by_run[run_id] = current
        return current


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
) -> WorkflowTraceEvent:
    own_session = db is None
    session = db or SessionLocal()
    event = WorkflowTraceEvent(
        workflow_family=workflow_family,
        thread_id=str(thread_id or ""),
        actor_user_id=str(actor_user_id) if actor_user_id else None,
        patient_user_id=str(patient_user_id) if patient_user_id else None,
        run_id=run_id,
        node_name=node_name,
        event_type=event_type,
        sequence=_next_sequence(run_id),
        status=status,
        duration_ms=duration_ms,
        payload_json=_sanitize_payload(payload),
    )
    try:
        session.add(event)
        session.commit()
        session.refresh(event)
    except Exception:
        session.rollback()
    finally:
        if own_session:
            session.close()
    return event


def list_workflow_trace_events(
    *,
    db: Session,
    workflow_family: str | None = None,
    thread_id: str | None = None,
    run_id: str | None = None,
    before_trace_id: str | None = None,
    limit: int = 100,
) -> list[WorkflowTraceEvent]:
    query = db.query(WorkflowTraceEvent)
    if workflow_family:
        query = query.filter(WorkflowTraceEvent.workflow_family == workflow_family)
    if thread_id:
        query = query.filter(WorkflowTraceEvent.thread_id == thread_id)
    if run_id:
        query = query.filter(WorkflowTraceEvent.run_id == run_id)
    if before_trace_id:
        query = query.filter(WorkflowTraceEvent.trace_id < before_trace_id)
    return (
        query.order_by(
            WorkflowTraceEvent.occurred_at.desc(),
            WorkflowTraceEvent.sequence.desc(),
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
