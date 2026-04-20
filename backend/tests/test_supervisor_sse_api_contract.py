import asyncio
import json
import os
import uuid

os.environ.setdefault("GOOGLE_API_KEY", "test-key")

from backend import main as backend_main


class _AllowAllRateLimiter:
    def check_rate_limit(self, _user_id: str):
        return True, None


def _decode_sse_events(chunks: list[bytes | str]) -> list[dict]:
    combined = "".join(chunk.decode("utf-8") if isinstance(chunk, bytes) else chunk for chunk in chunks)
    events: list[dict] = []
    for frame in combined.split("\n\n"):
        frame = frame.strip()
        if not frame or not frame.startswith("data: "):
            continue
        payload = frame[len("data: ") :]
        events.append(json.loads(payload))
    return events


def test_doctor_stream_event_ordering_and_contract(monkeypatch):
    async def fake_stream_doctor_match_workflow(_state: dict):
        yield {"type": "plan", "stages": [["profile_user_node"]], "total_stages": 1, "total_tasks": 1}
        yield {
            "type": "stage_start",
            "stage_index": 1,
            "total_stages": 1,
            "task_ids": ["profile_user_node"],
        }
        yield {
            "type": "stage_complete",
            "stage_index": 1,
            "total_stages": 1,
            "results": {
                "profile_user_node": {
                    "booking_blocked_missing_fields": ["selected_doctor"],
                    "booking_failed_validation": False,
                }
            },
        }
        yield {
            "type": "complete",
            "results": {
                "booking_mode": "suggest_only",
                "booking_blocked_missing_fields": ["selected_doctor"],
                "booking_failed_validation": False,
            },
            "errors": [],
            "stages": [["profile_user_node"]],
        }

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
        need_text="persistent cough",
    )

    response = asyncio.run(backend_main.supervisor_doctor_stream(request))

    assert response.media_type == "text/event-stream"
    assert response.headers["Cache-Control"] == "no-cache"
    assert response.headers["Connection"] == "keep-alive"
    assert response.headers["X-Accel-Buffering"] == "no"

    async def _collect_chunks():
        chunks = []
        async for chunk in response.body_iterator:
            chunks.append(chunk)
        return chunks

    events = _decode_sse_events(asyncio.run(_collect_chunks()))
    assert [e["type"] for e in events] == ["plan", "stage_start", "stage_complete", "complete"]

    plan = events[0]
    assert all(k in plan for k in ["stages", "total_stages", "total_tasks"])

    stage_start = events[1]
    assert all(k in stage_start for k in ["stage_index", "total_stages", "task_ids"])

    stage_complete = events[2]
    assert all(k in stage_complete for k in ["stage_index", "total_stages", "results"])
    node_payload = next(iter(stage_complete["results"].values()))
    assert "booking_blocked_missing_fields" in node_payload
    assert "booking_failed_validation" in node_payload

    complete = events[3]
    assert all(k in complete for k in ["results", "errors", "stages"])
    assert "booking_blocked_missing_fields" in complete["results"]
    assert "booking_failed_validation" in complete["results"]


def test_generic_stream_event_ordering_contract(monkeypatch):
    async def fake_stream_supervisor_workflow(_user_id: str, _tasks: list[dict]):
        yield {"type": "plan", "stages": [["task_1"]], "total_stages": 1, "total_tasks": 1}
        yield {"type": "stage_start", "stage_index": 1, "total_stages": 1, "task_ids": ["task_1"]}
        yield {
            "type": "stage_complete",
            "stage_index": 1,
            "total_stages": 1,
            "results": {"task_1": {"count": 1}},
        }
        yield {"type": "complete", "results": {"task_1": {"count": 1}}, "errors": [], "stages": [["task_1"]]}

    monkeypatch.setattr(backend_main, "stream_supervisor_workflow", fake_stream_supervisor_workflow)
    monkeypatch.setattr(
        backend_main.stream_manager,
        "get_rate_limiter",
        lambda: _AllowAllRateLimiter(),
    )

    request = backend_main.SupervisorRouteRequest(
        user_id=f"user-{uuid.uuid4()}",
        tasks=[backend_main.SupervisorTaskInput(tool_name="user_fact_count")],
    )

    response = asyncio.run(backend_main.supervisor_stream(request))

    async def _collect_chunks():
        chunks = []
        async for chunk in response.body_iterator:
            chunks.append(chunk)
        return chunks

    events = _decode_sse_events(asyncio.run(_collect_chunks()))
    assert [e["type"] for e in events] == ["plan", "stage_start", "stage_complete", "complete"]


def test_doctor_stream_cancel_event_is_terminal(monkeypatch):
    async def fake_stream_doctor_match_workflow(state: dict):
        actor = str(state.get("actor_user_id") or "")
        backend_main.stream_manager.create_stream_token(actor)
        try:
            yield {"type": "plan", "stages": [["node_1"]], "total_stages": 1, "total_tasks": 1}
            if backend_main.stream_manager.is_cancelled(actor):
                yield {"type": "cancelled"}
                return
            yield {"type": "stage_start", "stage_index": 1, "total_stages": 1, "task_ids": ["node_1"]}
            if backend_main.stream_manager.is_cancelled(actor):
                yield {"type": "cancelled"}
                return
            yield {"type": "complete", "results": {}, "errors": [], "stages": [["node_1"]]}
        finally:
            backend_main.stream_manager.remove_stream_token(actor)

    monkeypatch.setattr(backend_main, "stream_doctor_match_workflow", fake_stream_doctor_match_workflow)
    monkeypatch.setattr(
        backend_main.stream_manager,
        "get_rate_limiter",
        lambda: _AllowAllRateLimiter(),
    )

    actor_id = f"actor-{uuid.uuid4()}"
    request = backend_main.DoctorMatchAgentRequest(
        thread_id=f"thread-{uuid.uuid4()}",
        actor_user_id=actor_id,
        patient_user_id=f"patient-{uuid.uuid4()}",
        need_text="persistent cough",
    )

    async def _run_flow():
        response = await backend_main.supervisor_doctor_stream(request)
        iterator = response.body_iterator.__aiter__()

        chunks = [await iterator.__anext__()]
        await backend_main.cancel_supervisor_doctor_stream(actor_id)

        try:
            while True:
                chunks.append(await iterator.__anext__())
        except StopAsyncIteration:
            pass

        return chunks

    events = _decode_sse_events(asyncio.run(_run_flow()))
    types = [e["type"] for e in events]
    assert "cancelled" in types
    assert types[-1] == "cancelled"
    assert "complete" not in types[types.index("cancelled") + 1 :]
