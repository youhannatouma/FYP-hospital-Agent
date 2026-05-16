from __future__ import annotations

import hashlib
import json
import re
import sys
from datetime import date
from datetime import datetime, timezone
from pathlib import Path
from time import perf_counter
from typing import Any, AsyncIterator
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.chat import ChatMessage, ChatThread
from app.models.user import User
from app.assistant_telemetry import (
    AssistantTelemetryEvent,
    assistant_telemetry_store,
    parse_summary_range,
)
from app.schemas.chat import (
    ChatStreamRequest,
    MessagePageResponse,
    MessageResponse,
    ThreadCreateRequest,
    ThreadListResponse,
    ThreadResponse,
)

try:
    from orchestration.assistant_chat_orchestrator import stream_assistant_response
    from middleware import stream_manager
    from shared.gemini import AssistantConfigError, AssistantRuntimeError
except ImportError:  # Fallback for backend package context
    try:
        from backend.orchestration.assistant_chat_orchestrator import stream_assistant_response
        from backend.middleware import stream_manager
        from backend.shared.gemini import AssistantConfigError, AssistantRuntimeError
    except ImportError:
        backend_root = str(Path(__file__).resolve().parents[2])
        if backend_root not in sys.path:
            sys.path.append(backend_root)
        from orchestration.assistant_chat_orchestrator import stream_assistant_response
        from middleware import stream_manager
        from shared.gemini import AssistantConfigError, AssistantRuntimeError
try:
    from telemetry import emit_telemetry_event
except ImportError:
    try:
        from backend.telemetry import emit_telemetry_event
    except ImportError:
        backend_root = str(Path(__file__).resolve().parents[2])
        if backend_root not in sys.path:
            sys.path.append(backend_root)
        from telemetry import emit_telemetry_event
try:
    from telemetry.workflow_trace import (
        encode_trace_cursor,
        list_workflow_trace_events,
        serialize_trace_event,
    )
except ImportError:
    from backend.telemetry.workflow_trace import (
        encode_trace_cursor,
        list_workflow_trace_events,
        serialize_trace_event,
    )

router = APIRouter(prefix="/assistant", tags=["Assistant"])


def _extract_profile_candidates(message: str) -> dict[str, Any]:
    text = (message or "").strip()
    lowered = text.lower()
    out: dict[str, Any] = {}

    dob_match = re.search(r"\b(\d{4})-(\d{2})-(\d{2})\b", text)
    if dob_match:
        try:
            out["date_of_birth"] = date(
                int(dob_match.group(1)),
                int(dob_match.group(2)),
                int(dob_match.group(3)),
            ).isoformat()
        except ValueError:
            pass
    else:
        year_match = re.search(r"\b(?:born in|birth year is|i was born in)\s*(\d{4})\b", lowered)
        if year_match:
            year = int(year_match.group(1))
            if 1900 <= year <= date.today().year:
                out["date_of_birth"] = f"{year:04d}-01-01"

    allergy_match = re.search(r"\ballerg(?:y|ies)\s*(?:are|is|:)?\s*(.+)", text, re.IGNORECASE)
    if allergy_match:
        raw = allergy_match.group(1)
        raw = re.split(r"[.?!]", raw)[0]
        candidates = [a.strip(" -") for a in re.split(r",| and ", raw, flags=re.IGNORECASE)]
        allergies = [a for a in candidates if a and len(a) < 80]
        if allergies:
            out["allergies"] = sorted(set(allergies), key=lambda x: x.lower())
    elif re.search(r"\b(?:no allergies|not allergic to anything|none for allergies)\b", lowered):
        out["allergies"] = []

    condition_match = re.search(
        r"\b(?:chronic conditions?|conditions?|medical conditions?)\s*(?:are|is|:)?\s*(.+)",
        text,
        re.IGNORECASE,
    )
    if condition_match:
        raw = re.split(r"[.?!]", condition_match.group(1))[0].strip()
        if raw.lower() in {"none", "no", "none currently", "no chronic conditions"}:
            out["chronic_conditions"] = []
        else:
            candidates = [c.strip(" -") for c in re.split(r",| and ", raw, flags=re.IGNORECASE)]
            conditions = [c for c in candidates if c and len(c) < 80]
            if conditions:
                out["chronic_conditions"] = sorted(set(conditions), key=lambda x: x.lower())
    elif re.search(r"\b(?:no chronic conditions|no conditions|none currently)\b", lowered):
        out["chronic_conditions"] = []

    meds_match = re.search(
        r"\b(?:current medications?|medications?|medicines?|supplements?)\s*(?:are|is|:|include)?\s*(.+)",
        text,
        re.IGNORECASE,
    )
    if meds_match:
        raw = re.split(r"[.?!]", meds_match.group(1))[0].strip()
        if raw.lower() in {"none", "no", "none currently", "not taking any", "no medications"}:
            out["current_medications"] = []
        else:
            candidates = [m.strip(" -") for m in re.split(r",| and ", raw, flags=re.IGNORECASE)]
            medications = [m for m in candidates if m and len(m) < 120]
            if medications:
                out["current_medications"] = sorted(set(medications), key=lambda x: x.lower())
    elif re.search(r"\b(?:not taking any medications|no medications|no medicine|no supplements)\b", lowered):
        out["current_medications"] = []

    return out


def _is_confirmation_message(message: str) -> bool:
    lowered = (message or "").strip().lower()
    confirmations = {
        "yes", "y", "confirm", "confirmed", "save it", "save", "go ahead", "proceed", "correct",
    }
    return lowered in confirmations or any(token in lowered for token in ("yes save", "confirm save", "please save"))


def _find_latest_pending_profile_update(db: Session, thread_id: UUID) -> dict[str, Any] | None:
    rows = (
        db.query(ChatMessage)
        .filter(ChatMessage.thread_id == thread_id, ChatMessage.role == "assistant")
        .order_by(ChatMessage.created_at.desc())
        .limit(10)
        .all()
    )
    for row in rows:
        metadata = row.message_metadata or {}
        if metadata.get("profile_update_state") == "pending_confirmation" and metadata.get("profile_update_pending"):
            pending = metadata.get("profile_update_pending")
            if isinstance(pending, dict):
                return pending
    return None


def _find_latest_pending_profile_message(db: Session, thread_id: UUID) -> ChatMessage | None:
    rows = (
        db.query(ChatMessage)
        .filter(ChatMessage.thread_id == thread_id, ChatMessage.role == "assistant")
        .order_by(ChatMessage.created_at.desc())
        .limit(10)
        .all()
    )
    for row in rows:
        metadata = row.message_metadata or {}
        if metadata.get("profile_update_state") == "pending_confirmation" and metadata.get("profile_update_pending"):
            return row
    return None


def _merge_profile_updates(base: dict[str, Any] | None, new: dict[str, Any] | None) -> dict[str, Any]:
    merged: dict[str, Any] = dict(base or {})
    for key, value in (new or {}).items():
        if key in {"allergies", "chronic_conditions", "current_medications"} and isinstance(value, list):
            merged[key] = [str(item).strip() for item in value if str(item).strip()]
        elif value not in (None, ""):
            merged[key] = value
    return merged


def _format_profile_update_summary(pending: dict[str, Any]) -> str:
    parts = [
        f"Date of birth: {pending.get('date_of_birth', 'not provided')}",
        f"allergies: {', '.join(pending.get('allergies', [])) if isinstance(pending.get('allergies'), list) else 'not provided'}",
        f"chronic conditions: {', '.join(pending.get('chronic_conditions', [])) if isinstance(pending.get('chronic_conditions'), list) else 'not provided'}",
        f"current medications: {', '.join(pending.get('current_medications', [])) if isinstance(pending.get('current_medications'), list) else 'not provided'}",
    ]
    return "; ".join(parts)


def _extract_ui_source(metadata: dict[str, Any] | None) -> str:
    if not metadata:
        return "unknown"
    value = metadata.get("ui_source")
    return str(value) if value else "unknown"


def _normalize_content(content: str) -> str:
    # Collapse whitespace to keep hashes stable across UI formatting changes.
    return " ".join((content or "").split())


def _hash_content(content: str) -> str:
    normalized = _normalize_content(content)
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def _title_case_phrase(text: str) -> str:
    minor = {
        "a", "an", "and", "as", "at", "by", "for", "from", "in", "into",
        "of", "on", "or", "the", "to", "with",
    }
    words = [w for w in text.split() if w]
    if not words:
        return ""
    out: list[str] = []
    for idx, raw in enumerate(words):
        lower = raw.lower()
        if idx > 0 and lower in minor:
            out.append(lower)
        else:
            out.append(lower.capitalize())
    return " ".join(out)


def _generate_title(message: str, max_length: int = 42) -> str:
    normalized = " ".join((message or "").strip().split())
    if not normalized:
        return "New Conversation"

    lowered = normalized.lower()
    fillers = [
        "i need help with",
        "can you help me with",
        "can you help with",
        "can you",
        "could you",
        "please help me with",
        "please help with",
        "what should i know about",
        "what do i need to know about",
        "i have a question about",
        "i want to ask about",
        "tell me about",
        "help me with",
    ]
    for filler in fillers:
        if lowered.startswith(filler + " "):
            normalized = normalized[len(filler):].strip(" :,-")
            lowered = normalized.lower()
            break

    compact = re.sub(r"[^\w\s-]", " ", normalized)
    compact = " ".join(compact.split())
    if not compact:
        return "New Conversation"

    keyword_map = [
        ("advil", "Advil Safety"),
        ("ibuprofen", "Ibuprofen Safety"),
        ("interaction", "Medication Interactions"),
        ("side effect", "Medication Side Effects"),
        ("dose", "Dosage Guidance"),
        ("dosage", "Dosage Guidance"),
        ("cholesterol", "Cholesterol Guidance"),
        ("blood pressure", "Blood Pressure Guidance"),
        ("headache", "Headache Guidance"),
        ("diabetes", "Diabetes Guidance"),
        ("appointment", "Appointment Help"),
    ]
    lowered_compact = compact.lower()
    for token, label in keyword_map:
        if token in lowered_compact:
            base = label
            break
    else:
        words = compact.split()
        meaningful = [w for w in words if w.lower() not in {"i", "me", "my", "please", "help", "with", "about"}]
        base = " ".join(meaningful[:6]) if meaningful else " ".join(words[:6])
        base = _title_case_phrase(base)

    if not base:
        return "New Conversation"
    if len(base) <= max_length:
        return base
    return base[: max_length - 3].rstrip() + "..."


def _parse_iso_datetime(raw: str | None) -> datetime | None:
    if not raw:
        return None
    try:
        value = raw.strip()
        if value.endswith("Z"):
            value = value[:-1] + "+00:00"
        return datetime.fromisoformat(value)
    except ValueError:
        return None


def _sse_response(event_stream: AsyncIterator[str]) -> StreamingResponse:
    return StreamingResponse(
        event_stream,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


def _get_thread_or_404(db: Session, thread_id: UUID, user: User) -> ChatThread:
    thread = db.query(ChatThread).filter(ChatThread.thread_id == thread_id).first()
    if not thread or thread.owner_user_id != user.user_id:
        raise HTTPException(status_code=404, detail="Thread not found")
    return thread


@router.post("/threads", status_code=201, response_model=ThreadResponse)
def create_thread(
    payload: ThreadCreateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    thread = ChatThread(owner_user_id=user.user_id, title=payload.title)
    db.add(thread)
    db.commit()
    db.refresh(thread)

    return ThreadResponse(
        thread_id=str(thread.thread_id),
        title=thread.title,
        created_at=thread.created_at.isoformat() if thread.created_at else None,
        last_message_at=thread.last_message_at.isoformat() if thread.last_message_at else None,
    )


@router.get("/threads", response_model=ThreadListResponse)
def list_threads(
    limit: int = Query(20, ge=1, le=100),
    before: str | None = Query(default=None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    before_dt = _parse_iso_datetime(before)

    message_counts = (
        db.query(ChatMessage.thread_id, func.count(ChatMessage.message_id).label("message_count"))
        .group_by(ChatMessage.thread_id)
        .subquery()
    )

    query = (
        db.query(ChatThread, func.coalesce(message_counts.c.message_count, 0))
        .outerjoin(message_counts, ChatThread.thread_id == message_counts.c.thread_id)
        .filter(ChatThread.owner_user_id == user.user_id)
    )

    if before_dt:
        query = query.filter(ChatThread.updated_at < before_dt)

    rows = query.order_by(ChatThread.updated_at.desc()).limit(limit).all()

    threads = []
    for thread, count in rows:
        threads.append(
            ThreadResponse(
                thread_id=str(thread.thread_id),
                title=thread.title,
                created_at=thread.created_at.isoformat() if thread.created_at else None,
                last_message_at=thread.last_message_at.isoformat() if thread.last_message_at else None,
                message_count=int(count),
            )
        )

    next_cursor = None
    if len(rows) == limit:
        last_thread = rows[-1][0]
        if last_thread.updated_at:
            next_cursor = last_thread.updated_at.isoformat()

    return ThreadListResponse(threads=threads, next_cursor=next_cursor)


@router.delete("/threads/{thread_id}")
def delete_thread(
    thread_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    thread = _get_thread_or_404(db, thread_id, user)
    db.query(ChatMessage).filter(ChatMessage.thread_id == thread.thread_id).delete(synchronize_session=False)
    db.delete(thread)
    db.commit()
    return {"deleted": True, "thread_id": str(thread_id)}


@router.get("/threads/{thread_id}/messages", response_model=MessagePageResponse)
def get_messages(
    thread_id: UUID,
    limit: int = Query(60, ge=1, le=200),
    before: str | None = Query(default=None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    thread = _get_thread_or_404(db, thread_id, user)
    before_dt = _parse_iso_datetime(before)

    query = db.query(ChatMessage).filter(ChatMessage.thread_id == thread.thread_id)
    if before_dt:
        query = query.filter(ChatMessage.created_at < before_dt)

    rows = query.order_by(ChatMessage.created_at.desc()).limit(limit).all()

    next_cursor = None
    if len(rows) == limit and rows[-1].created_at:
        next_cursor = rows[-1].created_at.isoformat()

    messages = [
        MessageResponse(
            message_id=str(msg.message_id),
            role=msg.role,
            content=msg.content,
            created_at=msg.created_at.isoformat() if msg.created_at else None,
            metadata=msg.message_metadata or None,
        )
        for msg in reversed(rows)
    ]

    return MessagePageResponse(messages=messages, next_cursor=next_cursor)


@router.post("/threads/{thread_id}/stream")
async def stream_thread_reply(
    thread_id: UUID,
    payload: ChatStreamRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    thread = _get_thread_or_404(db, thread_id, user)
    rate_limiter = stream_manager.get_rate_limiter()
    allowed, error_msg = rate_limiter.check_rate_limit(str(user.user_id))
    if not allowed:
        raise HTTPException(status_code=429, detail=error_msg)

    user_message = None
    if payload.client_message_id:
        user_message = (
            db.query(ChatMessage)
            .filter(
                ChatMessage.thread_id == thread.thread_id,
                ChatMessage.client_message_id == payload.client_message_id,
            )
            .first()
        )

    if not user_message:
        user_metadata: dict[str, Any] = dict(payload.metadata or {})
        if payload.mode:
            user_metadata.setdefault("mode", payload.mode)

        user_message = ChatMessage(
            thread_id=thread.thread_id,
            role="user",
            content=payload.message,
            content_hash=_hash_content(payload.message),
            client_message_id=payload.client_message_id,
            message_metadata=user_metadata or None,
        )
        db.add(user_message)

    now = datetime.utcnow()
    thread.last_message_at = now
    thread.updated_at = now
    db.commit()

    stream_key = f"{user.user_id}:{thread.thread_id}"
    stream_manager.create_stream_token(stream_key)
    ui_source = _extract_ui_source(payload.metadata or {})
    request_started_at = datetime.now(timezone.utc)
    started_perf = perf_counter()
    chunk_count = 0
    emit_telemetry_event(
        "assistant_request_started",
        workflow_family="assistant",
        request_path="/assistant/threads/{thread_id}/stream",
        sample_key=f"{user.user_id}:{thread.thread_id}:assistant_request_started",
        payload={
            "thread_id": str(thread.thread_id),
            "actor_user_id": str(user.user_id),
            "ui_source": ui_source,
        },
    )
    assistant_telemetry_store.record(
        AssistantTelemetryEvent(
            event_name="assistant_request_started",
            occurred_at=request_started_at,
            thread_id=str(thread.thread_id),
            user_id=str(user.user_id),
            ui_source=ui_source,
        )
    )

    async def event_generator() -> AsyncIterator[str]:
        nonlocal chunk_count
        assistant_text = ""
        assistant_metadata: dict[str, Any] = {}
        cancelled = False
        error_message = None

        try:
            candidate_profile_update = _extract_profile_candidates(payload.message)
            pending_message = _find_latest_pending_profile_message(db, thread.thread_id)
            pending_metadata = (pending_message.message_metadata or {}) if pending_message else {}
            pending_profile_update = (
                pending_metadata.get("profile_update_pending")
                if isinstance(pending_metadata.get("profile_update_pending"), dict)
                else None
            )

            if candidate_profile_update and not _is_confirmation_message(payload.message):
                merged_update = _merge_profile_updates(pending_profile_update, candidate_profile_update)
                confirmation_text = (
                    "I captured profile details from your message. "
                    f"{_format_profile_update_summary(merged_update)}. "
                    "Reply with 'confirm' to save these details to your profile."
                )
                assistant_text = confirmation_text
                assistant_metadata = {
                    "status": "complete",
                    "profile_update_state": "pending_confirmation",
                    "profile_update_pending": merged_update,
                    "profile_update_required_for_otc": bool(pending_metadata.get("profile_update_required_for_otc")),
                    "profile_update_resume_message": pending_metadata.get("profile_update_resume_message"),
                }
                yield f"data: {json.dumps({'type': 'delta', 'content': confirmation_text})}\n\n"
            elif _is_confirmation_message(payload.message):
                pending = _find_latest_pending_profile_update(db, thread.thread_id)
                if pending:
                    if pending.get("date_of_birth"):
                        try:
                            user.date_of_birth = date.fromisoformat(str(pending["date_of_birth"]))
                        except ValueError:
                            pass
                    if isinstance(pending.get("allergies"), list):
                        user.allergies = [str(a) for a in pending["allergies"] if str(a).strip()]
                    if isinstance(pending.get("chronic_conditions"), list):
                        user.chronic_conditions = [str(c) for c in pending["chronic_conditions"] if str(c).strip()]
                    if isinstance(pending.get("current_medications"), list):
                        user.current_medications = [str(m) for m in pending["current_medications"] if str(m).strip()]
                    db.commit()
                    assistant_text = (
                        "Confirmed. I saved your health safety details to your patient profile."
                    )
                    pending_resume_message = None
                    pending_message = _find_latest_pending_profile_message(db, thread.thread_id)
                    if pending_message:
                        metadata = pending_message.message_metadata or {}
                        value = metadata.get("profile_update_resume_message")
                        if value:
                            pending_resume_message = str(value)
                    assistant_metadata = {
                        "status": "complete",
                        "profile_update_state": "applied",
                        "profile_update_applied": {
                            "date_of_birth": pending.get("date_of_birth"),
                            "allergies": pending.get("allergies", []),
                            "chronic_conditions": pending.get("chronic_conditions", []),
                            "current_medications": pending.get("current_medications", []),
                        },
                    }
                    yield f"data: {json.dumps({'type': 'delta', 'content': assistant_text})}\n\n"
                    if pending_resume_message:
                        assistant_text += "\n\n"
                        async for chunk in stream_assistant_response(
                            user=user,
                            thread_id=str(thread.thread_id),
                            message=pending_resume_message,
                            recent_messages=[
                                {"role": msg.role, "content": msg.content}
                                for msg in reversed(
                                    db.query(ChatMessage)
                                    .filter(ChatMessage.thread_id == thread.thread_id)
                                    .order_by(ChatMessage.created_at.desc())
                                    .limit(10)
                                    .all()
                                )
                                if msg.content
                            ],
                            assistant_context={
                                "mode": payload.mode,
                                "metadata": payload.metadata or {},
                            },
                        ):
                            if chunk.get("type") == "delta":
                                delta = chunk.get("content", "")
                                if delta:
                                    chunk_count += 1
                                    assistant_text += delta
                                    yield f"data: {json.dumps({'type': 'delta', 'content': delta})}\n\n"
                            elif chunk.get("type") == "complete":
                                resume_response = chunk.get("response", {}) or {}
                                assistant_metadata = {
                                    **resume_response,
                                    "status": "complete",
                                    "profile_update_state": "applied",
                                    "profile_update_applied": {
                                        "date_of_birth": pending.get("date_of_birth"),
                                        "allergies": pending.get("allergies", []),
                                        "chronic_conditions": pending.get("chronic_conditions", []),
                                        "current_medications": pending.get("current_medications", []),
                                    },
                                }

            if not assistant_text:
                recent_messages = (
                    db.query(ChatMessage)
                    .filter(ChatMessage.thread_id == thread.thread_id)
                    .order_by(ChatMessage.created_at.desc())
                    .limit(10)
                    .all()
                )
                recent_messages_payload = [
                    {"role": msg.role, "content": msg.content}
                    for msg in reversed(recent_messages)
                    if msg.content
                ]

                async for chunk in stream_assistant_response(
                    user=user,
                    thread_id=str(thread.thread_id),
                    message=payload.message,
                    recent_messages=recent_messages_payload,
                    assistant_context={
                        "mode": payload.mode,
                        "metadata": payload.metadata or {},
                    },
                ):
                    if stream_manager.is_cancelled(stream_key):
                        cancelled = True
                        yield f"data: {json.dumps({'type': 'cancelled'})}\n\n"
                        break

                    if chunk.get("type") == "delta":
                        delta = chunk.get("content", "")
                        if delta:
                            chunk_count += 1
                            assistant_text += delta
                            yield f"data: {json.dumps({'type': 'delta', 'content': delta})}\n\n"
                    elif chunk.get("type") == "complete":
                        assistant_metadata = chunk.get("response", {}) or {}
                if assistant_metadata.get("metadata", {}).get("medication_readiness_required"):
                    missing_fields = assistant_metadata.get("metadata", {}).get("medication_readiness_missing_fields") or []
                    assistant_metadata = {
                        **assistant_metadata,
                        "profile_update_state": "pending_confirmation",
                        "profile_update_pending": {},
                        "profile_update_required_for_otc": True,
                        "profile_update_required_fields": missing_fields,
                        "profile_update_resume_message": payload.message,
                    }
        except Exception as exc:
            error_message = str(exc)
            error_code = "assistant_stream_error"
            safe_message = "Streaming failed"
            exc_code = str(getattr(exc, "code", "") or "")
            if isinstance(exc, AssistantConfigError) or exc_code == "assistant_config_error":
                error_code = exc.code
                safe_message = "Assistant configuration is missing or invalid. Please contact support."
            elif isinstance(exc, AssistantRuntimeError) or exc_code == "assistant_runtime_error":
                error_code = exc.code
                safe_message = "Assistant is temporarily unavailable. Please try again."

            assistant_metadata = {
                **assistant_metadata,
                "status": "error",
                "error_code": error_code,
                "error_message": safe_message,
            }
            yield f"data: {json.dumps({'type': 'error', 'code': error_code, 'message': safe_message})}\n\n"
        finally:
            stream_manager.remove_stream_token(stream_key)

        if cancelled:
            assistant_metadata = {**assistant_metadata, "status": "cancelled"}
            duration_ms = int((perf_counter() - started_perf) * 1000)
            emit_telemetry_event(
                "assistant_request_cancelled",
                workflow_family="assistant",
                request_path="/assistant/threads/{thread_id}/stream",
                sample_key=f"{user.user_id}:{thread.thread_id}:assistant_request_cancelled",
                payload={
                    "thread_id": str(thread.thread_id),
                    "actor_user_id": str(user.user_id),
                    "ui_source": ui_source,
                    "duration_ms": duration_ms,
                    "streamed_token_chunks": chunk_count,
                },
            )
            assistant_telemetry_store.record(
                AssistantTelemetryEvent(
                    event_name="assistant_request_cancelled",
                    occurred_at=datetime.now(timezone.utc),
                    thread_id=str(thread.thread_id),
                    user_id=str(user.user_id),
                    ui_source=ui_source,
                    duration_ms=duration_ms,
                    streamed_token_chunks=chunk_count,
                )
            )
        elif error_message:
            assistant_metadata = {
                **assistant_metadata,
                "status": "error",
                "error": error_message,
            }
            duration_ms = int((perf_counter() - started_perf) * 1000)
            error_code = assistant_metadata.get("error_code")
            emit_telemetry_event(
                "assistant_request_failed",
                workflow_family="assistant",
                request_path="/assistant/threads/{thread_id}/stream",
                sample_key=f"{user.user_id}:{thread.thread_id}:assistant_request_failed",
                payload={
                    "thread_id": str(thread.thread_id),
                    "actor_user_id": str(user.user_id),
                    "ui_source": ui_source,
                    "error_code": error_code,
                    "duration_ms": duration_ms,
                    "streamed_token_chunks": chunk_count,
                },
            )
            assistant_telemetry_store.record(
                AssistantTelemetryEvent(
                    event_name="assistant_request_failed",
                    occurred_at=datetime.now(timezone.utc),
                    thread_id=str(thread.thread_id),
                    user_id=str(user.user_id),
                    ui_source=ui_source,
                    error_code=str(error_code) if error_code else None,
                    duration_ms=duration_ms,
                    streamed_token_chunks=chunk_count,
                )
            )
        else:
            assistant_metadata = {**assistant_metadata, "status": "complete"}
            duration_ms = int((perf_counter() - started_perf) * 1000)
            emit_telemetry_event(
                "assistant_request_completed",
                workflow_family="assistant",
                request_path="/assistant/threads/{thread_id}/stream",
                sample_key=f"{user.user_id}:{thread.thread_id}:assistant_request_completed",
                payload={
                    "thread_id": str(thread.thread_id),
                    "actor_user_id": str(user.user_id),
                    "ui_source": ui_source,
                    "duration_ms": duration_ms,
                    "streamed_token_chunks": chunk_count,
                },
            )
            assistant_telemetry_store.record(
                AssistantTelemetryEvent(
                    event_name="assistant_request_completed",
                    occurred_at=datetime.now(timezone.utc),
                    thread_id=str(thread.thread_id),
                    user_id=str(user.user_id),
                    ui_source=ui_source,
                    duration_ms=duration_ms,
                    streamed_token_chunks=chunk_count,
                )
            )

        if assistant_text or assistant_metadata:
            assistant_message = ChatMessage(
                thread_id=thread.thread_id,
                role="assistant",
                content=assistant_text or "",
                content_hash=_hash_content(assistant_text or ""),
                message_metadata=assistant_metadata or None,
            )
            db.add(assistant_message)
            thread.last_message_at = datetime.utcnow()
            thread.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(assistant_message)

            if not cancelled and not error_message:
                if thread.title is None:
                    thread.title = _generate_title(payload.message)
                    db.commit()

                complete_payload = {
                    "type": "complete",
                    "message": {
                        "id": str(assistant_message.message_id),
                        "content": assistant_message.content,
                        "created_at": assistant_message.created_at.isoformat()
                        if assistant_message.created_at
                        else None,
                        "metadata": assistant_message.message_metadata or None,
                    },
                }
                yield f"data: {json.dumps(complete_payload)}\n\n"

    return _sse_response(event_generator())


@router.post("/threads/{thread_id}/cancel")
def cancel_stream(
    thread_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _get_thread_or_404(db, thread_id, user)
    stream_key = f"{user.user_id}:{thread_id}"
    cancelled = stream_manager.cancel_stream(stream_key)
    message = "Stream cancelled" if cancelled else "No active stream"
    return {"message": message}


@router.get("/telemetry/summary")
def assistant_telemetry_summary(
    start: str | None = Query(default=None),
    end: str | None = Query(default=None),
    _user: User = Depends(get_current_user),
):
    parsed_start, parsed_end = parse_summary_range(start=start, end=end)
    return assistant_telemetry_store.summary(start=parsed_start, end=parsed_end)


@router.get("/threads/{thread_id}/workflow-traces")
def get_thread_workflow_traces(
    thread_id: UUID,
    run_id: str | None = Query(default=None),
    workflow_family: str | None = Query(default=None),
    before_cursor: str | None = Query(default=None),
    before_trace_id: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    thread = _get_thread_or_404(db, thread_id, user)
    effective_family = workflow_family or "assistant"
    rows = list_workflow_trace_events(
        db=db,
        workflow_family=effective_family,
        thread_id=str(thread.thread_id),
        run_id=run_id,
        before_cursor=before_cursor or before_trace_id,
        limit=limit + 1,
    )
    has_more = len(rows) > limit
    page = rows[:limit]
    next_cursor = (
        encode_trace_cursor(
            occurred_at=page[-1].occurred_at,
            sequence=int(page[-1].sequence),
            trace_id=str(page[-1].trace_id),
        )
        if has_more and page
        else None
    )
    return {
        "thread_id": str(thread.thread_id),
        "workflow_family": effective_family,
        "run_id": run_id,
        "events": [serialize_trace_event(r) for r in page],
        "next_cursor": next_cursor,
    }
