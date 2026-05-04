import uuid

from sqlalchemy import MetaData, create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.models.workflow_trace_event import WorkflowTraceEvent
from backend.telemetry.workflow_trace import (
    decode_trace_cursor,
    emit_workflow_trace_event,
    encode_trace_cursor,
    list_workflow_trace_events,
)


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


def test_workflow_trace_insert_failure_is_not_silent(monkeypatch):
    metadata = MetaData()
    WorkflowTraceEvent.__table__.to_metadata(metadata)
    metadata.create_all(bind=TEST_ENGINE)
    db = TestingSessionLocal()
    try:
        def fail_commit():
            raise RuntimeError("db down")

        monkeypatch.setattr(db, "commit", fail_commit)
        out = emit_workflow_trace_event(
            workflow_family="assistant",
            thread_id="thread-fail",
            run_id="run-fail",
            event_type="run_started",
            db=db,
        )
        assert out is None
    finally:
        db.close()


def test_workflow_trace_cursor_pagination_no_duplicates():
    metadata = MetaData()
    WorkflowTraceEvent.__table__.to_metadata(metadata)
    metadata.create_all(bind=TEST_ENGINE)
    db = TestingSessionLocal()
    try:
        for idx in range(6):
            emit_workflow_trace_event(
                workflow_family="assistant",
                thread_id="thread-cursor",
                run_id="run-cursor",
                event_type="node_completed",
                node_name=f"node-{idx}",
                payload={"idx": idx},
                db=db,
            )

        page1 = list_workflow_trace_events(
            db=db,
            workflow_family="assistant",
            thread_id="thread-cursor",
            limit=3,
        )
        assert len(page1) == 3
        cursor = encode_trace_cursor(
            occurred_at=page1[-1].occurred_at,
            sequence=int(page1[-1].sequence),
            trace_id=str(page1[-1].trace_id),
        )
        assert decode_trace_cursor(cursor) is not None

        page2 = list_workflow_trace_events(
            db=db,
            workflow_family="assistant",
            thread_id="thread-cursor",
            before_cursor=cursor,
            limit=3,
        )
        assert len(page2) == 3
        ids1 = {str(r.trace_id) for r in page1}
        ids2 = {str(r.trace_id) for r in page2}
        assert ids1.isdisjoint(ids2)
    finally:
        db.close()


def test_workflow_trace_legacy_raw_uuid_cursor_still_works():
    metadata = MetaData()
    WorkflowTraceEvent.__table__.to_metadata(metadata)
    metadata.create_all(bind=TEST_ENGINE)
    db = TestingSessionLocal()
    try:
        for idx in range(4):
            emit_workflow_trace_event(
                workflow_family="assistant",
                thread_id="thread-legacy-cursor",
                run_id="run-legacy-cursor",
                event_type="node_completed",
                node_name=f"node-{idx}",
                db=db,
            )
        first = list_workflow_trace_events(
            db=db,
            workflow_family="assistant",
            thread_id="thread-legacy-cursor",
            limit=2,
        )
        assert len(first) == 2
        second = list_workflow_trace_events(
            db=db,
            workflow_family="assistant",
            thread_id="thread-legacy-cursor",
            before_cursor=str(first[-1].trace_id),
            limit=2,
        )
        assert len(second) == 2
        assert {str(r.trace_id) for r in first}.isdisjoint({str(r.trace_id) for r in second})
    finally:
        db.close()
