from sqlalchemy import Column, DateTime, Index, LargeBinary, Text, UniqueConstraint
from sqlalchemy.sql import func

from app.database import Base


class LangGraphCheckpoint(Base):
    __tablename__ = "langgraph_checkpoint"

    thread_id = Column(Text, primary_key=True)
    checkpoint_ns = Column(Text, primary_key=True, default="")
    checkpoint_id = Column(Text, primary_key=True)
    parent_checkpoint_id = Column(Text, nullable=True)
    checkpoint_type = Column(Text, nullable=False)
    checkpoint_blob = Column(LargeBinary, nullable=False)
    metadata_type = Column(Text, nullable=False)
    metadata_blob = Column(LargeBinary, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    __table_args__ = (
        Index("ix_langgraph_checkpoint_thread", "thread_id", "checkpoint_ns", "created_at"),
    )


class LangGraphCheckpointBlob(Base):
    __tablename__ = "langgraph_checkpoint_blob"

    thread_id = Column(Text, primary_key=True)
    checkpoint_ns = Column(Text, primary_key=True, default="")
    channel = Column(Text, primary_key=True)
    version = Column(Text, primary_key=True)
    blob_type = Column(Text, nullable=False)
    blob = Column(LargeBinary, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    __table_args__ = (
        Index("ix_langgraph_checkpoint_blob_thread", "thread_id", "checkpoint_ns"),
    )


class LangGraphCheckpointWrite(Base):
    __tablename__ = "langgraph_checkpoint_write"

    thread_id = Column(Text, primary_key=True)
    checkpoint_ns = Column(Text, primary_key=True, default="")
    checkpoint_id = Column(Text, primary_key=True)
    task_id = Column(Text, primary_key=True)
    write_idx = Column(Text, primary_key=True)
    channel = Column(Text, nullable=False)
    value_type = Column(Text, nullable=False)
    value_blob = Column(LargeBinary, nullable=False)
    task_path = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    __table_args__ = (
        UniqueConstraint(
            "thread_id",
            "checkpoint_ns",
            "checkpoint_id",
            "task_id",
            "write_idx",
            name="uq_langgraph_checkpoint_write",
        ),
        Index("ix_langgraph_checkpoint_write_thread", "thread_id", "checkpoint_ns", "checkpoint_id"),
    )
