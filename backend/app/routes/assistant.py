from __future__ import annotations

import hashlib
import json
from datetime import datetime
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
except ImportError:  # Fallback for backend package context
    from backend.orchestration.assistant_chat_orchestrator import stream_assistant_response
    from backend.middleware import stream_manager

router = APIRouter(prefix="/assistant", tags=["Assistant"])


def _normalize_content(content: str) -> str:
    # Collapse whitespace to keep hashes stable across UI formatting changes.
    return " ".join((content or "").split())


def _hash_content(content: str) -> str:
    normalized = _normalize_content(content)
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def _generate_title(message: str, max_length: int = 50) -> str:
    normalized = " ".join(message.split())
    if len(normalized) > max_length:
        return normalized[:max_length].rsplit(" ", 1)[0] + "..."
    return normalized or "New Conversation"


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

    async def event_generator() -> AsyncIterator[str]:
        assistant_text = ""
        assistant_metadata: dict[str, Any] = {}
        cancelled = False
        error_message = None

        try:
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
            ):
                if stream_manager.is_cancelled(stream_key):
                    cancelled = True
                    yield f"data: {json.dumps({'type': 'cancelled'})}\n\n"
                    break

                if chunk.get("type") == "delta":
                    delta = chunk.get("content", "")
                    if delta:
                        assistant_text += delta
                        yield f"data: {json.dumps({'type': 'delta', 'content': delta})}\n\n"
                elif chunk.get("type") == "complete":
                    assistant_metadata = chunk.get("response", {}) or {}
        except Exception as exc:
            error_message = str(exc)
            yield f"data: {json.dumps({'type': 'error', 'message': 'Streaming failed'})}\n\n"
        finally:
            stream_manager.remove_stream_token(stream_key)

        if cancelled:
            assistant_metadata = {**assistant_metadata, "status": "cancelled"}
        elif error_message:
            assistant_metadata = {**assistant_metadata, "status": "error", "error": error_message}
        else:
            assistant_metadata = {**assistant_metadata, "status": "complete"}

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
