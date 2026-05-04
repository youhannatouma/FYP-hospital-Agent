import asyncio
from contextlib import asynccontextmanager

from backend.orchestration import supervisor_workflow as swf


class _DummyWorkflow:
    async def astream(self, _state, config=None):
        del config
        yield {"profile_user_node": {"booking_mode": "suggest_only"}}


def test_stream_path_does_not_emit_duplicate_node_completed(monkeypatch):
    calls = []

    def fake_emit_workflow_trace_event(**kwargs):
        calls.append(kwargs)
        return None

    @asynccontextmanager
    async def fake_acquire_thread(_thread_id, timeout=None):
        del timeout
        yield

    async def fake_load_thread_state(_thread_id):
        return {
            "thread_id": "thread-1",
            "booking_mode": "suggest_only",
            "booking_result": {},
            "booking_missing_fields": [],
            "structured_errors": [],
            "booking_committed": False,
        }

    monkeypatch.setattr(swf, "emit_workflow_trace_event", fake_emit_workflow_trace_event)
    monkeypatch.setattr(swf, "_DOCTOR_WORKFLOW", _DummyWorkflow())
    monkeypatch.setattr(swf, "load_thread_state", fake_load_thread_state)
    monkeypatch.setattr(swf.lock_manager, "acquire_thread", fake_acquire_thread)
    monkeypatch.setattr(swf.stream_manager, "create_stream_token", lambda _key: asyncio.Event())
    monkeypatch.setattr(swf.stream_manager, "remove_stream_token", lambda _key: None)

    async def _collect():
        out = []
        async for item in swf.stream_doctor_match_workflow(
            {"thread_id": "thread-1", "actor_user_id": "actor-1", "patient_user_id": "patient-1"}
        ):
            out.append(item)
        return out

    events = asyncio.run(_collect())
    assert any(e.get("type") == "complete" for e in events)
    duplicate_stream_node_events = [
        c
        for c in calls
        if c.get("event_type") == "node_completed"
        and isinstance(c.get("payload"), dict)
        and "stream_stage_index" in c.get("payload", {})
    ]
    assert duplicate_stream_node_events == []
