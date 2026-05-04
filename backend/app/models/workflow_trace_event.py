import uuid

from sqlalchemy import JSON, Column, DateTime, Index, Integer, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.database import Base


class WorkflowTraceEvent(Base):
    __tablename__ = "workflow_trace_event"

    trace_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_family = Column(Text, nullable=False)
    thread_id = Column(Text, nullable=False)
    actor_user_id = Column(Text, nullable=True)
    patient_user_id = Column(Text, nullable=True)
    run_id = Column(Text, nullable=False)
    node_name = Column(Text, nullable=True)
    event_type = Column(Text, nullable=False)
    sequence = Column(Integer, nullable=False)
    occurred_at = Column(DateTime, server_default=func.now(), nullable=False)
    duration_ms = Column(Integer, nullable=True)
    status = Column(Text, nullable=True)
    payload_json = Column(JSON, nullable=True)

    __table_args__ = (
        UniqueConstraint(
            "workflow_family",
            "run_id",
            "sequence",
            name="uq_workflow_trace_event_run_sequence",
        ),
        Index("ix_workflow_trace_event_thread_occurred", "thread_id", "occurred_at"),
        Index("ix_workflow_trace_event_family_occurred", "workflow_family", "occurred_at"),
        Index(
            "ix_workflow_trace_event_seek",
            "workflow_family",
            "thread_id",
            "occurred_at",
            "sequence",
            "trace_id",
        ),
        Index("ix_workflow_trace_event_actor_thread", "actor_user_id", "thread_id"),
        Index("ix_workflow_trace_event_patient_thread", "patient_user_id", "thread_id"),
    )
