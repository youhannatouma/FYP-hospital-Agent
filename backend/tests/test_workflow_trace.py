import uuid

from sqlalchemy import MetaData, create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.models.workflow_trace_event import WorkflowTraceEvent
from backend.telemetry.workflow_trace import emit_workflow_trace_event, list_workflow_trace_events


TEST_ENGINE = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=TEST_ENGINE)


def test_workflow_trace_masks_sensitive_payload_fields():
    metadata = MetaData()
    WorkflowTraceEvent.__table__.to_metadata(metadata)
    metadata.create_all(bind=TEST_ENGINE)
    db = TestingSessionLocal()
    try:
        emit_workflow_trace_event(
            workflow_family="assistant",
            thread_id=f"thread-{uuid.uuid4()}",
            run_id="run-mask",
            event_type="node_completed",
            node_name="classify_intent_node",
            payload={"message": "my private message", "booking_reason": "because of flu", "intent_route": "general"},
            db=db,
        )
        rows = db.query(WorkflowTraceEvent).filter(WorkflowTraceEvent.run_id == "run-mask").all()
        assert rows
        payload = rows[0].payload_json or {}
        assert "message" not in payload
        assert "booking_reason" not in payload
        assert "message_hash" in payload
        assert "booking_reason_hash" in payload
        assert payload["intent_route"] == "general"
    finally:
        db.close()


def test_workflow_trace_sequence_increments_per_run():
    metadata = MetaData()
    WorkflowTraceEvent.__table__.to_metadata(metadata)
    metadata.create_all(bind=TEST_ENGINE)
    db = TestingSessionLocal()
    try:
        for _ in range(3):
            emit_workflow_trace_event(
                workflow_family="specialized_doctor",
                thread_id="thread-seq",
                run_id="run-seq",
                event_type="node_completed",
                node_name="profile_user_node",
                db=db,
            )
        rows = list_workflow_trace_events(db=db, run_id="run-seq", limit=10)
        seqs = sorted([r.sequence for r in rows])
        assert seqs[-3:] == [1, 2, 3]
    finally:
        db.close()
