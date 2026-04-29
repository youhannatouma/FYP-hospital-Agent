from pydantic import BaseModel, Field
from typing import Any, Optional


class ThreadCreateRequest(BaseModel):
    title: Optional[str] = None


class ThreadResponse(BaseModel):
    thread_id: str
    title: Optional[str]
    created_at: Optional[str]
    last_message_at: Optional[str]
    message_count: Optional[int] = None


class ThreadListResponse(BaseModel):
    threads: list[ThreadResponse]
    next_cursor: Optional[str]


class MessageResponse(BaseModel):
    message_id: str
    role: str
    content: str
    created_at: Optional[str]
    metadata: Optional[dict[str, Any]] = None


class MessagePageResponse(BaseModel):
    messages: list[MessageResponse]
    next_cursor: Optional[str]


class ChatStreamRequest(BaseModel):
    message: str = Field(min_length=1)
    client_message_id: Optional[str] = None
    mode: Optional[str] = "chat"
    metadata: Optional[dict[str, Any]] = None
