import os
import uuid
import json

os.environ.setdefault("GOOGLE_API_KEY", "test-key")
os.environ.setdefault("SECRET_KEY", "test-secret")
os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")

from fastapi import APIRouter, FastAPI
from app.database import Base
from app.models.chat import ChatThread, ChatMessage
from app.routes import assistant as assistant_routes

from sqlalchemy import Column, MetaData, Table, create_engine
from sqlalchemy import Uuid as SqlUuid
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import pytest


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


class _FakeUser:
    user_id = uuid.UUID("123e4567-e89b-12d3-a456-426614174000")
    clerk_id = "fake_clerk"
    email = "test@example.com"
    first_name = "Test"
    last_name = "User"
    role = "patient"
    gender = None
    allergies = []
    chronic_conditions = []


class _AllowAllRateLimiter:
    def check_rate_limit(self, _user_id: str):
        return True, None


def _decode_sse_events(chunks):
    combined = "".join(chunk.decode("utf-8") if isinstance(chunk, bytes) else chunk for chunk in chunks)
    events = []
    for frame in combined.split("\n\n"):
        frame = frame.strip()
        if not frame or not frame.startswith("data: "):
            continue
        payload = frame[len("data: "):]
        events.append(json.loads(payload))
    return events


@pytest.fixture(autouse=True)
def _seed_db_schema():
    # Create only the tables needed for assistant tests to keep isolation and
    # avoid non-SQLite-compatible app-wide types.
    test_metadata = MetaData()
    Table("usr", test_metadata, Column("user_id", SqlUuid(as_uuid=True), primary_key=True))
    ChatThread.__table__.to_metadata(test_metadata)
    ChatMessage.__table__.to_metadata(test_metadata)
    test_metadata.create_all(bind=TEST_ENGINE)
    yield
    test_metadata.drop_all(bind=TEST_ENGINE)


@pytest.fixture()
def client(monkeypatch):
    monkeypatch.setattr(assistant_routes.stream_manager, "get_rate_limiter", lambda: _AllowAllRateLimiter())

    app = FastAPI()
    api_router = APIRouter(prefix="/api")
    api_router.include_router(assistant_routes.router)
    app.include_router(api_router)

    app.dependency_overrides[assistant_routes.get_current_user] = lambda: _FakeUser()
    app.dependency_overrides[assistant_routes.get_db] = _get_test_db

    from fastapi.testclient import TestClient
    with TestClient(app) as c:
        yield c


@pytest.fixture()
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


def _auth_headers():
    return {"Authorization": "Bearer test-token"}


def test_create_thread(client):
    res = client.post("/api/assistant/threads", json={"title": "My Chat"}, headers=_auth_headers())
    assert res.status_code == 201
    body = res.json()
    assert "thread_id" in body
    assert body["title"] == "My Chat"
    assert body["created_at"] is not None


def test_create_thread_without_title(client):
    res = client.post("/api/assistant/threads", json={}, headers=_auth_headers())
    assert res.status_code == 201
    body = res.json()
    assert body["title"] is None


def test_list_threads_empty(client):
    res = client.get("/api/assistant/threads", headers=_auth_headers())
    assert res.status_code == 200
    body = res.json()
    assert body["threads"] == []
    assert body["next_cursor"] is None


def test_list_threads_with_pagination(client, db_session):
    user_id = _FakeUser.user_id
    for i in range(5):
        t = ChatThread(owner_user_id=user_id, title=f"Thread {i}")
        db_session.add(t)
    db_session.commit()

    res = client.get("/api/assistant/threads?limit=2", headers=_auth_headers())
    assert res.status_code == 200
    body = res.json()
    assert len(body["threads"]) == 2
    assert body["next_cursor"] is not None

    res2 = client.get(f"/api/assistant/threads?limit=2&before={body['next_cursor']}", headers=_auth_headers())
    assert res2.status_code == 200
    body2 = res2.json()
    assert len(body2["threads"]) == 2


def test_list_threads_ownership_isolation(client, db_session):
    other_user = uuid.UUID("00000000-0000-0000-0000-000000000001")
    t_other = ChatThread(owner_user_id=other_user, title="Other")
    t_own = ChatThread(owner_user_id=_FakeUser.user_id, title="Mine")
    db_session.add_all([t_other, t_own])
    db_session.commit()

    res = client.get("/api/assistant/threads", headers=_auth_headers())
    assert res.status_code == 200
    titles = {t["title"] for t in res.json()["threads"]}
    assert titles == {"Mine"}


def test_get_messages_not_found_wrong_owner(client, db_session):
    other_user = uuid.UUID("00000000-0000-0000-0000-000000000001")
    t = ChatThread(owner_user_id=other_user, title="Secret")
    db_session.add(t)
    db_session.commit()

    res = client.get(f"/api/assistant/threads/{t.thread_id}/messages", headers=_auth_headers())
    assert res.status_code == 404


def test_get_messages_returns_messages(client, db_session):
    t = ChatThread(owner_user_id=_FakeUser.user_id, title="Chat")
    db_session.add(t)
    db_session.commit()
    db_session.refresh(t)

    m1 = ChatMessage(thread_id=t.thread_id, role="user", content="hello", content_hash="abc")
    m2 = ChatMessage(thread_id=t.thread_id, role="assistant", content="hi there", content_hash="def")
    db_session.add_all([m1, m2])
    db_session.commit()

    res = client.get(f"/api/assistant/threads/{t.thread_id}/messages", headers=_auth_headers())
    assert res.status_code == 200
    body = res.json()
    assert len(body["messages"]) == 2
    assert body["messages"][0]["role"] == "user"
    assert body["messages"][1]["role"] == "assistant"
    assert body["messages"][1]["content"] == "hi there"


def test_get_messages_pagination(client, db_session):
    t = ChatThread(owner_user_id=_FakeUser.user_id, title="Chat")
    db_session.add(t)
    db_session.commit()
    db_session.refresh(t)

    for i in range(5):
        db_session.add(ChatMessage(thread_id=t.thread_id, role="user", content=f"msg {i}", content_hash=f"h{i}"))
    db_session.commit()

    res = client.get(f"/api/assistant/threads/{t.thread_id}/messages?limit=2", headers=_auth_headers())
    assert res.status_code == 200
    body = res.json()
    assert len(body["messages"]) == 2
    assert body["next_cursor"] is not None


def test_stream_reply_sse_contract(client, db_session, monkeypatch):
    async def fake_stream(*args, **kwargs):
        yield {"type": "delta", "content": "Delta1 "}
        yield {"type": "delta", "content": "Delta2"}
        yield {"type": "complete", "response": {"status": "complete", "model_name": "test"}}

    monkeypatch.setattr("app.routes.assistant.stream_assistant_response", fake_stream)

    t = ChatThread(owner_user_id=_FakeUser.user_id, title="Stream Chat")
    db_session.add(t)
    db_session.commit()
    db_session.refresh(t)

    with client.stream(
        "POST",
        f"/api/assistant/threads/{t.thread_id}/stream",
        json={"message": "hello"},
        headers=_auth_headers(),
    ) as res:
        assert res.status_code == 200
        assert res.headers["content-type"] == "text/event-stream; charset=utf-8"
        assert res.headers["cache-control"] == "no-cache"
        assert res.headers["connection"] == "keep-alive"
        assert res.headers["x-accel-buffering"] == "no"

        chunks = [chunk for chunk in res.iter_text()]

    events = _decode_sse_events(chunks)
    types = [e["type"] for e in events]
    assert "delta" in types
    assert "complete" in types

    complete_event = next(e for e in events if e["type"] == "complete")
    assert "message" in complete_event
    assert complete_event["message"]["content"] == "Delta1 Delta2"
    assert complete_event["message"]["metadata"]["status"] == "complete"


def test_stream_reply_cancellation(client, db_session, monkeypatch):
    async def fake_stream(*args, **kwargs):
        yield {"type": "delta", "content": "start"}

    monkeypatch.setattr("app.routes.assistant.stream_assistant_response", fake_stream)

    t = ChatThread(owner_user_id=_FakeUser.user_id, title="Cancel Chat")
    db_session.add(t)
    db_session.commit()
    db_session.refresh(t)

    stream_key = f"{_FakeUser.user_id}:{t.thread_id}"
    from backend import middleware
    middleware.stream_manager.create_stream_token(stream_key)

    with client.stream(
        "POST",
        f"/api/assistant/threads/{t.thread_id}/stream",
        json={"message": "hello"},
        headers=_auth_headers(),
    ) as res:
        cancel_res = client.post(f"/api/assistant/threads/{t.thread_id}/cancel", headers=_auth_headers())
        assert cancel_res.status_code == 200
        chunks = [chunk for chunk in res.iter_text()]

    middleware.stream_manager.remove_stream_token(stream_key)

    events = _decode_sse_events(chunks)
    assert any(e["type"] in ("cancelled", "complete", "error") for e in events)


def test_thread_title_auto_generated_after_first_reply(client, db_session, monkeypatch):
    async def fake_stream(*args, **kwargs):
        yield {"type": "delta", "content": "Sure!"}
        yield {"type": "complete", "response": {"status": "complete"}}

    monkeypatch.setattr("app.routes.assistant.stream_assistant_response", fake_stream)

    t = ChatThread(owner_user_id=_FakeUser.user_id, title=None)
    db_session.add(t)
    db_session.commit()
    db_session.refresh(t)

    with client.stream(
        "POST",
        f"/api/assistant/threads/{t.thread_id}/stream",
        json={"message": "What is diabetes?"},
        headers=_auth_headers(),
    ) as res:
        chunks = [chunk for chunk in res.iter_text()]

    db_session.refresh(t)
    assert t.title == "What is diabetes?"


def test_thread_title_truncation(client, db_session, monkeypatch):
    async def fake_stream(*args, **kwargs):
        yield {"type": "delta", "content": "ok"}
        yield {"type": "complete", "response": {"status": "complete"}}

    monkeypatch.setattr("app.routes.assistant.stream_assistant_response", fake_stream)

    t = ChatThread(owner_user_id=_FakeUser.user_id, title=None)
    db_session.add(t)
    db_session.commit()
    db_session.refresh(t)

    long_message = "A " + "very " * 100 + "long message"
    with client.stream(
        "POST",
        f"/api/assistant/threads/{t.thread_id}/stream",
        json={"message": long_message},
        headers=_auth_headers(),
    ) as res:
        chunks = [chunk for chunk in res.iter_text()]

    db_session.refresh(t)
    assert t.title is not None
    assert len(t.title) <= 53
    assert t.title.endswith("...")


def test_cancel_no_active_stream(client, db_session):
    t = ChatThread(owner_user_id=_FakeUser.user_id, title="Chat")
    db_session.add(t)
    db_session.commit()
    db_session.refresh(t)

    res = client.post(f"/api/assistant/threads/{t.thread_id}/cancel", headers=_auth_headers())
    assert res.status_code == 200
    assert "No active stream" in res.json()["message"]
