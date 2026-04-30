from __future__ import annotations

import uuid

import pytest

from backend.orchestration import assistant_chat_orchestrator as orch


class _FakeUser:
    user_id = uuid.UUID("123e4567-e89b-12d3-a456-426614174111")
    first_name = "Test"
    last_name = "User"
    date_of_birth = None
    gender = None
    allergies = []
    chronic_conditions = []


async def _drain(gen):
    out = []
    async for item in gen:
        out.append(item)
    return out


@pytest.mark.asyncio
async def test_stream_assistant_response_medication_only_runs_one_tool(monkeypatch):
    calls: list[str] = []

    monkeypatch.setattr(orch, "assistant_llm_is_configured", lambda: True)
    monkeypatch.setattr(orch, "log_assistant_llm_status_once", lambda: None)
    monkeypatch.setattr(orch.memory_tools, "memory_context", lambda *args, **kwargs: "")

    def fake_medication_pipeline(*args, **kwargs):
        calls.append("medication")
        return {"drugs_found": 1, "safe": [], "flagged": [], "top_candidates": [], "response": "med"}

    async def fake_doctor_workflow(*args, **kwargs):
        calls.append("appointment")
        return {"booking_mode": "suggest_only", "suggestion_cards": []}

    async def fake_stream_synthesize_response(**kwargs):
        yield {"type": "complete", "response": {"ok": True}}

    monkeypatch.setattr(orch, "medication_pipeline", fake_medication_pipeline)
    monkeypatch.setattr(orch, "execute_doctor_match_workflow", fake_doctor_workflow)
    monkeypatch.setattr(orch, "stream_synthesize_response", fake_stream_synthesize_response)

    await _drain(
        orch.stream_assistant_response(
            user=_FakeUser(),
            thread_id="thread-1",
            message="What medication can I take for headache?",
        )
    )

    assert calls == ["medication"]


@pytest.mark.asyncio
async def test_stream_assistant_response_appointment_only_runs_one_tool(monkeypatch):
    calls: list[str] = []

    monkeypatch.setattr(orch, "assistant_llm_is_configured", lambda: True)
    monkeypatch.setattr(orch, "log_assistant_llm_status_once", lambda: None)
    monkeypatch.setattr(orch.memory_tools, "memory_context", lambda *args, **kwargs: "")

    def fake_medication_pipeline(*args, **kwargs):
        calls.append("medication")
        return {"drugs_found": 1, "safe": [], "flagged": [], "top_candidates": [], "response": "med"}

    async def fake_doctor_workflow(*args, **kwargs):
        calls.append("appointment")
        return {"booking_mode": "suggest_only", "suggestion_cards": []}

    async def fake_stream_synthesize_response(**kwargs):
        yield {"type": "complete", "response": {"ok": True}}

    monkeypatch.setattr(orch, "medication_pipeline", fake_medication_pipeline)
    monkeypatch.setattr(orch, "execute_doctor_match_workflow", fake_doctor_workflow)
    monkeypatch.setattr(orch, "stream_synthesize_response", fake_stream_synthesize_response)

    await _drain(
        orch.stream_assistant_response(
            user=_FakeUser(),
            thread_id="thread-2",
            message="Please schedule an appointment with a doctor",
        )
    )

    assert calls == ["appointment"]


@pytest.mark.asyncio
async def test_stream_assistant_response_combined_runs_appointment_then_medication(monkeypatch):
    calls: list[str] = []

    monkeypatch.setattr(orch, "assistant_llm_is_configured", lambda: True)
    monkeypatch.setattr(orch, "log_assistant_llm_status_once", lambda: None)
    monkeypatch.setattr(orch.memory_tools, "memory_context", lambda *args, **kwargs: "")

    def fake_medication_pipeline(*args, **kwargs):
        calls.append("medication")
        return {"drugs_found": 1, "safe": [], "flagged": [], "top_candidates": [], "response": "med"}

    async def fake_doctor_workflow(*args, **kwargs):
        calls.append("appointment")
        return {"booking_mode": "suggest_only", "suggestion_cards": []}

    async def fake_stream_synthesize_response(**kwargs):
        yield {"type": "complete", "response": {"ok": True}}

    monkeypatch.setattr(orch, "medication_pipeline", fake_medication_pipeline)
    monkeypatch.setattr(orch, "execute_doctor_match_workflow", fake_doctor_workflow)
    monkeypatch.setattr(orch, "stream_synthesize_response", fake_stream_synthesize_response)

    await _drain(
        orch.stream_assistant_response(
            user=_FakeUser(),
            thread_id="thread-3",
            message="Book a doctor appointment and suggest medication for fever",
        )
    )

    assert calls == ["appointment", "medication"]
