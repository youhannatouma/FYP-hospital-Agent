import asyncio
import json
import os
import uuid

os.environ.setdefault("GOOGLE_API_KEY", "test-key")

from backend import main as backend_main


class _AllowAllRateLimiter:
    def check_rate_limit(self, _user_id: str):
        return True, None


def test_supervisor_route_uses_generic_path(monkeypatch):
    called = {"generic": 0, "doctor": 0}

    async def fake_execute_supervisor_workflow(user_id: str, task_specs: list[dict]):
        called["generic"] += 1
        return {"path": "generic", "user_id": user_id, "task_count": len(task_specs)}

    async def fake_execute_doctor_match_workflow(_state: dict):
        called["doctor"] += 1
        return {"path": "doctor"}

    monkeypatch.setattr(backend_main, "execute_supervisor_workflow", fake_execute_supervisor_workflow)
    monkeypatch.setattr(backend_main, "execute_doctor_match_workflow", fake_execute_doctor_match_workflow)
    monkeypatch.setattr(
        backend_main.stream_manager,
        "get_rate_limiter",
        lambda: _AllowAllRateLimiter(),
    )

    request = backend_main.SupervisorRouteRequest(
        user_id=f"user-{uuid.uuid4()}",
        tasks=[backend_main.SupervisorTaskInput(tool_name="user_fact_count")],
    )

    out = asyncio.run(backend_main.supervisor_route(request))

    assert out["path"] == "generic"
    assert called["generic"] == 1
    assert called["doctor"] == 0


def test_supervisor_route_uses_specialized_path(monkeypatch):
    called = {"generic": 0, "doctor": 0}

    async def fake_execute_supervisor_workflow(_user_id: str, _task_specs: list[dict]):
        called["generic"] += 1
        return {"path": "generic"}

    async def fake_execute_doctor_match_workflow(state: dict):
        called["doctor"] += 1
        return {"path": "doctor", "thread_id": state.get("thread_id")}

    monkeypatch.setattr(backend_main, "execute_supervisor_workflow", fake_execute_supervisor_workflow)
    monkeypatch.setattr(backend_main, "execute_doctor_match_workflow", fake_execute_doctor_match_workflow)
    monkeypatch.setattr(
        backend_main.stream_manager,
        "get_rate_limiter",
        lambda: _AllowAllRateLimiter(),
    )

    request = backend_main.DoctorMatchAgentRequest(
        thread_id=f"thread-{uuid.uuid4()}",
        actor_user_id=f"actor-{uuid.uuid4()}",
        patient_user_id=f"patient-{uuid.uuid4()}",
        need_text="strong headache",
    )

    out = asyncio.run(backend_main.supervisor_route(request))

    assert out["path"] == "doctor"
    assert called["doctor"] == 1
    assert called["generic"] == 0


def test_supervisor_doctor_route_uses_specialized_path(monkeypatch):
    called = {"doctor": 0}

    async def fake_execute_doctor_match_workflow(state: dict):
        called["doctor"] += 1
        return {"path": "doctor", "thread_id": state.get("thread_id")}

    monkeypatch.setattr(backend_main, "execute_doctor_match_workflow", fake_execute_doctor_match_workflow)
    monkeypatch.setattr(
        backend_main.stream_manager,
        "get_rate_limiter",
        lambda: _AllowAllRateLimiter(),
    )

    request = backend_main.DoctorMatchAgentRequest(
        thread_id=f"thread-{uuid.uuid4()}",
        actor_user_id=f"actor-{uuid.uuid4()}",
        patient_user_id=f"patient-{uuid.uuid4()}",
        need_text="strong headache",
    )

    out = asyncio.run(backend_main.supervisor_doctor_route(request))

    assert out["path"] == "doctor"
    assert called["doctor"] == 1


def test_supervisor_doctor_stream_emits_sse(monkeypatch):
    async def fake_stream_doctor_match_workflow(_state: dict):
        yield {"type": "plan", "stages": [], "total_stages": 0, "total_tasks": 0}

    monkeypatch.setattr(backend_main, "stream_doctor_match_workflow", fake_stream_doctor_match_workflow)
    monkeypatch.setattr(
        backend_main.stream_manager,
        "get_rate_limiter",
        lambda: _AllowAllRateLimiter(),
    )

    request = backend_main.DoctorMatchAgentRequest(
        thread_id=f"thread-{uuid.uuid4()}",
        actor_user_id=f"actor-{uuid.uuid4()}",
        patient_user_id=f"patient-{uuid.uuid4()}",
        need_text="strong headache",
    )

    response = asyncio.run(backend_main.supervisor_doctor_stream(request))

    async def _collect_chunks():
        chunks = []
        async for chunk in response.body_iterator:
            chunks.append(chunk)
        return chunks

    chunks = asyncio.run(_collect_chunks())
    assert chunks
    payload = chunks[0]
    if isinstance(payload, bytes):
        payload = payload.decode("utf-8")
    assert payload.startswith("data: ")

    event_json = payload[len("data: "):].strip()
    event = json.loads(event_json)
    assert event["type"] == "plan"


def test_supervisor_doctor_cancel_uses_actor_scope(monkeypatch):
    captured = {"key": None}

    def fake_cancel_stream(stream_key: str):
        captured["key"] = stream_key
        return True

    monkeypatch.setattr(backend_main.stream_manager, "cancel_stream", fake_cancel_stream)

    actor_user_id = f"actor-{uuid.uuid4()}"
    out = asyncio.run(backend_main.cancel_supervisor_doctor_stream(actor_user_id))

    assert captured["key"] == actor_user_id
    assert "cancelled" in out["message"].lower()


def test_select_doctor_endpoint_family_off_and_on(monkeypatch):
    monkeypatch.setenv("SPECIALIZED_DOCTOR_ROLLOUT_MODE", "off")
    assert backend_main._select_doctor_endpoint_family("actor-1", "thread-1") == "legacy"

    monkeypatch.setenv("SPECIALIZED_DOCTOR_ROLLOUT_MODE", "on")
    assert backend_main._select_doctor_endpoint_family("actor-1", "thread-1") == "dedicated"


def test_select_doctor_endpoint_family_canary_bounds(monkeypatch):
    monkeypatch.setenv("SPECIALIZED_DOCTOR_ROLLOUT_MODE", "canary")

    monkeypatch.setenv("SPECIALIZED_DOCTOR_CANARY_PERCENT", "0")
    assert backend_main._select_doctor_endpoint_family("actor-1", "thread-1") == "legacy"

    monkeypatch.setenv("SPECIALIZED_DOCTOR_CANARY_PERCENT", "100")
    assert backend_main._select_doctor_endpoint_family("actor-1", "thread-1") == "dedicated"


def test_supervisor_doctor_route_auto_fallback_on_runtime_error(monkeypatch):
    calls = {"count": 0}

    async def flaky_execute_doctor_match_workflow(_state: dict):
        calls["count"] += 1
        if calls["count"] == 1:
            raise RuntimeError("transient failure")
        return {"path": "doctor", "fallback": True}

    monkeypatch.setattr(backend_main, "execute_doctor_match_workflow", flaky_execute_doctor_match_workflow)
    monkeypatch.setattr(
        backend_main.stream_manager,
        "get_rate_limiter",
        lambda: _AllowAllRateLimiter(),
    )
    monkeypatch.setenv("SPECIALIZED_DOCTOR_ROLLOUT_MODE", "on")
    monkeypatch.setenv("SPECIALIZED_DOCTOR_AUTO_FALLBACK", "true")

    request = backend_main.DoctorMatchAgentRequest(
        thread_id=f"thread-{uuid.uuid4()}",
        actor_user_id=f"actor-{uuid.uuid4()}",
        patient_user_id=f"patient-{uuid.uuid4()}",
        need_text="strong headache",
    )

    out = asyncio.run(backend_main.supervisor_doctor_route(request))

    assert out["path"] == "doctor"
    assert out["fallback"] is True
    assert calls["count"] == 2
