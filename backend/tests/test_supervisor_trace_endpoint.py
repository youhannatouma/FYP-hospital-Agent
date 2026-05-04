import os
import uuid
from datetime import datetime, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import JSON, Column, DateTime, Integer, MetaData, Table, Text, create_engine, text
from sqlalchemy import Uuid as SqlUuid
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

os.environ.setdefault("GOOGLE_API_KEY", "test-key")

from backend import main as backend_main


TEST_ENGINE = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=TEST_ENGINE)


def _get_test_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


class _User:
    def __init__(self, user_id: str, role: str = "patient"):
        self.user_id = uuid.UUID(user_id)
        self.role = role


@pytest.fixture(autouse=True)
def _seed_db_schema():
    metadata = MetaData()
    Table("usr", metadata, Column("user_id", SqlUuid(as_uuid=True), primary_key=True))
    Table(
        "workflow_trace_event",
        metadata,
        Column("trace_id", SqlUuid(as_uuid=True), primary_key=True),
        Column("workflow_family", Text),
        Column("thread_id", Text),
        Column("actor_user_id", Text),
        Column("patient_user_id", Text),
        Column("run_id", Text),
        Column("node_name", Text),
        Column("event_type", Text),
        Column("sequence", Integer),
        Column("occurred_at", DateTime),
        Column("duration_ms", Integer),
        Column("status", Text),
        Column("payload_json", JSON),
    )
    metadata.create_all(bind=TEST_ENGINE)
    yield
    metadata.drop_all(bind=TEST_ENGINE)


@pytest.fixture()
def client(monkeypatch):
    monkeypatch.setattr(backend_main, "_verify_database_connectivity", lambda: None)
    monkeypatch.setattr(backend_main, "_enforce_database_safeguards", lambda: None)
    monkeypatch.setattr(backend_main.memory_tools, "load_snapshot", lambda _path: 0)
    monkeypatch.setattr(backend_main.memory_tools, "save_snapshot", lambda _path: True)
    backend_main.app.dependency_overrides[backend_main.get_db] = _get_test_db
    with TestClient(backend_main.app, raise_server_exceptions=False) as c:
        yield c
    backend_main.app.dependency_overrides.clear()


def test_supervisor_trace_owner_scope_and_masking(client):
    owner_id = "123e4567-e89b-12d3-a456-426614174000"
    other_id = "00000000-0000-0000-0000-000000000001"
    thread_id = "thread-owner-1"

    db = TestingSessionLocal()
    try:
        db.execute(
            text(
                "INSERT INTO workflow_trace_event "
                "(trace_id, workflow_family, thread_id, actor_user_id, patient_user_id, run_id, node_name, event_type, sequence, status, payload_json) "
                "VALUES (:trace_id, :workflow_family, :thread_id, :actor_user_id, :patient_user_id, :run_id, :node_name, :event_type, :sequence, :status, :payload_json)"
            ),
            {
                "trace_id": str(uuid.uuid4()),
                "workflow_family": "specialized_doctor",
                "thread_id": thread_id,
                "actor_user_id": owner_id,
                "patient_user_id": other_id,
                "run_id": "run-owner",
                "node_name": "profile_view_node",
                "event_type": "node_completed",
                "sequence": 1,
                "status": "ok",
                "payload_json": '{"booking_ready": false}',
            },
        )
        db.execute(
            text(
                "INSERT INTO workflow_trace_event "
                "(trace_id, workflow_family, thread_id, actor_user_id, patient_user_id, run_id, node_name, event_type, sequence, status, payload_json) "
                "VALUES (:trace_id, :workflow_family, :thread_id, :actor_user_id, :patient_user_id, :run_id, :node_name, :event_type, :sequence, :status, :payload_json)"
            ),
            {
                "trace_id": str(uuid.uuid4()),
                "workflow_family": "specialized_doctor",
                "thread_id": thread_id,
                "actor_user_id": other_id,
                "patient_user_id": other_id,
                "run_id": "run-other",
                "node_name": "profile_view_node",
                "event_type": "node_completed",
                "sequence": 2,
                "status": "ok",
                "payload_json": '{"booking_ready": true}',
            },
        )
        db.commit()
    finally:
        db.close()

    backend_main.app.dependency_overrides[backend_main.get_current_user] = lambda: _User(owner_id, "patient")
    res = client.get(f"/supervisor/doctor/threads/{thread_id}/workflow-traces")
    assert res.status_code == 200
    body = res.json()
    assert body["workflow_family"] == "specialized_doctor"
    assert len(body["events"]) == 1
    event = body["events"][0]
    assert event["actor_user_id"] == owner_id
    assert event["patient_user_id"] is None


def test_supervisor_trace_non_owner_not_found(client):
    owner_id = "123e4567-e89b-12d3-a456-426614174000"
    other_id = "00000000-0000-0000-0000-000000000099"
    thread_id = "thread-owner-2"

    db = TestingSessionLocal()
    try:
        db.execute(
            text(
                "INSERT INTO workflow_trace_event "
                "(trace_id, workflow_family, thread_id, actor_user_id, patient_user_id, run_id, node_name, event_type, sequence, status, payload_json) "
                "VALUES (:trace_id, :workflow_family, :thread_id, :actor_user_id, :patient_user_id, :run_id, :node_name, :event_type, :sequence, :status, :payload_json)"
            ),
            {
                "trace_id": str(uuid.uuid4()),
                "workflow_family": "specialized_doctor",
                "thread_id": thread_id,
                "actor_user_id": owner_id,
                "patient_user_id": owner_id,
                "run_id": "run-only-owner",
                "node_name": "conditional_book_node",
                "event_type": "node_completed",
                "sequence": 1,
                "status": "ok",
                "payload_json": '{"booking_committed": false}',
            },
        )
        db.commit()
    finally:
        db.close()

    backend_main.app.dependency_overrides[backend_main.get_current_user] = lambda: _User(other_id, "patient")
    res = client.get(f"/supervisor/doctor/threads/{thread_id}/workflow-traces")
    assert res.status_code == 404


def test_supervisor_trace_admin_can_view_all_and_endpoint_is_read_only(client):
    owner_id = "123e4567-e89b-12d3-a456-426614174000"
    patient_id = "00000000-0000-0000-0000-000000000011"
    thread_id = "thread-admin-1"

    db = TestingSessionLocal()
    try:
        db.execute(
            text(
                "INSERT INTO workflow_trace_event "
                "(trace_id, workflow_family, thread_id, actor_user_id, patient_user_id, run_id, node_name, event_type, sequence, occurred_at, status, payload_json) "
                "VALUES (:trace_id, :workflow_family, :thread_id, :actor_user_id, :patient_user_id, :run_id, :node_name, :event_type, :sequence, :occurred_at, :status, :payload_json)"
            ),
            {
                "trace_id": str(uuid.uuid4()),
                "workflow_family": "specialized_doctor",
                "thread_id": thread_id,
                "actor_user_id": owner_id,
                "patient_user_id": patient_id,
                "run_id": "run-admin",
                "node_name": "synthesize_node",
                "event_type": "run_completed",
                "sequence": 1,
                "occurred_at": datetime(2026, 1, 1),
                "status": "ok",
                "payload_json": '{"booking_mode":"suggest_only"}',
            },
        )
        db.commit()
        count_before = db.execute(text("SELECT COUNT(*) FROM workflow_trace_event")).scalar_one()
    finally:
        db.close()

    backend_main.app.dependency_overrides[backend_main.get_current_user] = lambda: _User(
        "00000000-0000-0000-0000-0000000000aa", "admin"
    )
    res = client.get(f"/supervisor/doctor/threads/{thread_id}/workflow-traces")
    assert res.status_code == 200
    event = res.json()["events"][0]
    assert event["actor_user_id"] == owner_id
    assert event["patient_user_id"] == patient_id

    db2 = TestingSessionLocal()
    try:
        count_after = db2.execute(text("SELECT COUNT(*) FROM workflow_trace_event")).scalar_one()
    finally:
        db2.close()
    assert count_after == count_before


def test_supervisor_trace_owner_filter_applied_before_limit(client):
    owner_id = "123e4567-e89b-12d3-a456-426614174000"
    other_id = "00000000-0000-0000-0000-000000000111"
    thread_id = "thread-owner-limit"

    db = TestingSessionLocal()
    try:
        # First many events belong to others, owner event appears later.
        for seq in range(1, 8):
            actor = other_id if seq < 7 else owner_id
            db.execute(
                    text(
                        "INSERT INTO workflow_trace_event "
                        "(trace_id, workflow_family, thread_id, actor_user_id, patient_user_id, run_id, node_name, event_type, sequence, occurred_at, status, payload_json) "
                        "VALUES (:trace_id, :workflow_family, :thread_id, :actor_user_id, :patient_user_id, :run_id, :node_name, :event_type, :sequence, :occurred_at, :status, :payload_json)"
                    ),
                {
                    "trace_id": str(uuid.uuid4()),
                    "workflow_family": "specialized_doctor",
                    "thread_id": thread_id,
                    "actor_user_id": actor,
                    "patient_user_id": actor,
                    "run_id": "run-limit",
                    "node_name": "profile_view_node",
                    "event_type": "node_completed",
                    "sequence": seq,
                    "occurred_at": datetime(2026, 1, 2) + timedelta(seconds=seq),
                    "status": "ok",
                    "payload_json": '{"booking_ready": false}',
                },
            )
        db.commit()
    finally:
        db.close()

    backend_main.app.dependency_overrides[backend_main.get_current_user] = lambda: _User(owner_id, "patient")
    res = client.get(f"/supervisor/doctor/threads/{thread_id}/workflow-traces?limit=2")
    assert res.status_code == 200
    body = res.json()
    assert len(body["events"]) == 1
    assert body["events"][0]["actor_user_id"] == owner_id


def test_supervisor_trace_cursor_pagination_integration(client):
    owner_id = "123e4567-e89b-12d3-a456-426614174000"
    thread_id = "thread-cursor-int"

    db = TestingSessionLocal()
    try:
        for seq in range(1, 7):
            db.execute(
                text(
                    "INSERT INTO workflow_trace_event "
                    "(trace_id, workflow_family, thread_id, actor_user_id, patient_user_id, run_id, node_name, event_type, sequence, occurred_at, status, payload_json) "
                    "VALUES (:trace_id, :workflow_family, :thread_id, :actor_user_id, :patient_user_id, :run_id, :node_name, :event_type, :sequence, :occurred_at, :status, :payload_json)"
                ),
                {
                    "trace_id": str(uuid.uuid4()),
                    "workflow_family": "specialized_doctor",
                    "thread_id": thread_id,
                    "actor_user_id": owner_id,
                    "patient_user_id": owner_id,
                    "run_id": "run-cursor-int",
                    "node_name": "match_doctors_node",
                "event_type": "node_completed",
                "sequence": seq,
                "occurred_at": datetime(2026, 1, 1) + timedelta(seconds=seq),
                "status": "ok",
                "payload_json": '{"candidate_count": 3}',
            },
        )
        db.commit()
    finally:
        db.close()

    backend_main.app.dependency_overrides[backend_main.get_current_user] = lambda: _User(owner_id, "patient")
    first = client.get(
        f"/supervisor/doctor/threads/{thread_id}/workflow-traces",
        params={"limit": 3},
    )
    assert first.status_code == 200
    body1 = first.json()
    assert len(body1["events"]) == 3
    assert body1["next_cursor"] is not None

    second = client.get(
        f"/supervisor/doctor/threads/{thread_id}/workflow-traces",
        params={"limit": 3, "before_cursor": body1["next_cursor"]},
    )
    assert second.status_code == 200
    body2 = second.json()
    assert len(body2["events"]) == 3
    ids1 = {e["trace_id"] for e in body1["events"]}
    ids2 = {e["trace_id"] for e in body2["events"]}
    # Endpoint integration contract: cursor is accepted and advances page results.
    assert ids1 != ids2
    assert len(ids1.union(ids2)) >= 4
