import uuid

from sqlalchemy import JSON, Column, DateTime, ForeignKey, Index, Text, UniqueConstraint, Uuid
from sqlalchemy.sql import func

from app.database import Base


class ChatThread(Base):
    __tablename__ = "chat_thread"

    thread_id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_user_id = Column(Uuid(as_uuid=True), ForeignKey("usr.user_id", ondelete="CASCADE"), nullable=False)
    title = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    last_message_at = Column(DateTime, nullable=True)

    __table_args__ = (
        Index("ix_chat_thread_owner_updated", "owner_user_id", "updated_at"),
    )


class ChatMessage(Base):
    __tablename__ = "chat_message"

    message_id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    thread_id = Column(Uuid(as_uuid=True), ForeignKey("chat_thread.thread_id", ondelete="CASCADE"), nullable=False)
    role = Column(Text, nullable=False)  # user | assistant | system
    content = Column(Text, nullable=False)
    content_hash = Column(Text, nullable=False)
    client_message_id = Column(Text, nullable=True)
    message_metadata = Column("metadata", JSON, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    __table_args__ = (
        Index("ix_chat_message_thread_created", "thread_id", "created_at"),
        UniqueConstraint("thread_id", "client_message_id", name="uq_chat_message_client_id"),
    )
