from __future__ import annotations

import uuid
from types import SimpleNamespace

import pytest
from langgraph.checkpoint.memory import MemorySaver

from backend.orchestration import assistant_chat_orchestrator as orch


class _FakeUser:
    user_id = uuid.UUID("123e4567-e89b-12d3-a456-426614174111")
    first_name = "Test"
    last_name = "User"
    role = "patient"
    date_of_birth = None
    gender = None
    allergies = []
    chronic_conditions = []


class _FakeDoctor(_FakeUser):
    user_id = uuid.UUID("123e4567-e89b-12d3-a456-426614174222")
    first_name = "Dana"
    last_name = "Doctor"
    role = "doctor"


async def _drain(gen):
    out = []
    async for item in gen:
        out.append(item)
    return out


def _patch_graph(monkeypatch):
    graph = orch._build_assistant_graph().compile(checkpointer=MemorySaver())
    monkeypatch.setattr(orch, "_ASSISTANT_GRAPH", graph)


def _fake_synthesis_response(message: str = "ok", message_type: str = "test"):
    return SimpleNamespace(
        message=message,
        message_type=message_type,
        model_dump=lambda mode="json": {
            "message": message,
            "message_type": message_type,
            "synthesis_source": ["test"],
        },
    )


@pytest.mark.asyncio
async def test_stream_assistant_response_medication_only_runs_one_tool(monkeypatch):
    calls: list[str] = []

    _patch_graph(monkeypatch)
    monkeypatch.setattr(orch, "assistant_llm_is_configured", lambda: True)
    monkeypatch.setattr(orch, "log_assistant_llm_status_once", lambda: None)
    monkeypatch.setattr(orch.memory_tools, "memory_context", lambda *args, **kwargs: "")

    def fake_medication_pipeline(*args, **kwargs):
        calls.append("medication")
        return {"drugs_found": 1, "safe": [], "flagged": [], "top_candidates": [], "response": "med"}

    async def fake_doctor_workflow(*args, **kwargs):
        calls.append("appointment")
        return {"booking_mode": "suggest_only", "suggestion_cards": []}

    def fake_synthesize_response(**kwargs):
        assert kwargs["medication_result"] is not None
        assert kwargs["doctor_result"] is None
        return _fake_synthesis_response("medication answer", "medication")

    monkeypatch.setattr(orch, "medication_pipeline", fake_medication_pipeline)
    monkeypatch.setattr(orch, "execute_doctor_match_workflow", fake_doctor_workflow)
    monkeypatch.setattr(orch, "synthesize_response", fake_synthesize_response)

    chunks = await _drain(
        orch.stream_assistant_response(
            user=_FakeUser(),
            thread_id="thread-1",
            message="What medication can I take for headache?",
        )
    )

    assert calls == ["medication"]
    assert chunks[-1]["type"] == "complete"
    assert chunks[-1]["response"]["message_type"] == "medication"


@pytest.mark.asyncio
async def test_stream_assistant_response_appointment_only_runs_one_tool(monkeypatch):
    calls: list[str] = []
    doctor_thread_ids: list[str] = []

    _patch_graph(monkeypatch)
    monkeypatch.setattr(orch, "assistant_llm_is_configured", lambda: True)
    monkeypatch.setattr(orch, "log_assistant_llm_status_once", lambda: None)
    monkeypatch.setattr(orch.memory_tools, "memory_context", lambda *args, **kwargs: "")

    def fake_medication_pipeline(*args, **kwargs):
        calls.append("medication")
        return {"drugs_found": 1, "safe": [], "flagged": [], "top_candidates": [], "response": "med"}

    async def fake_doctor_workflow(state):
        calls.append("appointment")
        doctor_thread_ids.append(state["thread_id"])
        return {"booking_mode": "suggest_only", "suggestion_cards": []}

    def fake_synthesize_response(**kwargs):
        assert kwargs["doctor_result"] is not None
        assert kwargs["medication_result"] is None
        return _fake_synthesis_response("doctor answer", "appointment")

    monkeypatch.setattr(orch, "medication_pipeline", fake_medication_pipeline)
    monkeypatch.setattr(orch, "execute_doctor_match_workflow", fake_doctor_workflow)
    monkeypatch.setattr(orch, "synthesize_response", fake_synthesize_response)

    chunks = await _drain(
        orch.stream_assistant_response(
            user=_FakeUser(),
            thread_id="thread-2",
            message="Please schedule an appointment with a doctor",
        )
    )

    assert calls == ["appointment"]
    assert doctor_thread_ids == ["doctor:thread-2"]
    assert chunks[-1]["response"]["message_type"] == "appointment"


@pytest.mark.asyncio
async def test_patient_booking_request_passes_selection_to_supervisor(monkeypatch):
    captured: dict[str, object] = {}

    _patch_graph(monkeypatch)
    monkeypatch.setattr(orch, "assistant_llm_is_configured", lambda: True)
    monkeypatch.setattr(orch, "log_assistant_llm_status_once", lambda: None)
    monkeypatch.setattr(orch.memory_tools, "memory_context", lambda *args, **kwargs: "")
    monkeypatch.setattr(orch, "medication_pipeline", lambda *args, **kwargs: {})

    async def fake_doctor_workflow(state):
        captured.update(state)
        return {
            "booking_mode": "booking_failed",
            "booking_result": {"code": "BookingSlotUnavailable"},
            "suggestion_cards": [],
        }

    monkeypatch.setattr(orch, "execute_doctor_match_workflow", fake_doctor_workflow)
    monkeypatch.setattr(orch, "synthesize_response", lambda **kwargs: _fake_synthesis_response("fallback", "appointment"))

    chunks = await _drain(
        orch.stream_assistant_response(
            user=_FakeUser(),
            thread_id="thread-book-selection",
            message="Book an appointment with Dr Smith tomorrow at 9 AM",
            assistant_context={"timezone": "UTC"},
        )
    )

    assert captured["selected_doctor"] == {"doctor_name": "Smith"}
    assert str(captured["selected_appointment_time"]) == "09:00:00"
    assert "selected_appointment_date" in captured
    assert captured["booking_timezone"] == "UTC"
    assert chunks[-1]["response"]["message_type"] == "appointment"


@pytest.mark.asyncio
async def test_doctor_schedule_request_uses_read_only_schedule_tool(monkeypatch):
    calls: list[str] = []

    _patch_graph(monkeypatch)
    monkeypatch.setattr(orch, "assistant_llm_is_configured", lambda: True)
    monkeypatch.setattr(orch, "log_assistant_llm_status_once", lambda: None)
    monkeypatch.setattr(orch.memory_tools, "memory_context", lambda *args, **kwargs: "")
    monkeypatch.setattr(orch, "invoke_with_model_fallback_cached", lambda *args, **kwargs: (_ for _ in ()).throw(AssertionError("Gemini should not be called")))

    def fake_schedule_tool(doctor_user_id, requested_day, timezone_name):
        calls.append("schedule")
        return {
            "doctor_user_id": doctor_user_id,
            "date": requested_day.isoformat(),
            "timezone": timezone_name,
            "count": 2,
            "appointments": [
                {
                    "patient_name": "Mira Patient",
                    "display_time": "9:00 AM",
                    "display_end_time": "9:30 AM",
                    "appointment_type": "Follow-up",
                },
                {
                    "patient_name": "Omar Case",
                    "display_time": "10:00 AM",
                    "display_end_time": "10:30 AM",
                },
            ],
        }

    monkeypatch.setattr(orch, "list_doctor_appointments_for_day", fake_schedule_tool)

    chunks = await _drain(
        orch.stream_assistant_response(
            user=_FakeDoctor(),
            thread_id="thread-doctor-schedule",
            message="What appointments do I have today?",
            assistant_context={"timezone": "UTC"},
        )
    )

    assert calls == ["schedule"]
    response = chunks[-1]["response"]
    assert response["message_type"] == "doctor_schedule"
    assert "Mira Patient" in response["message"]
    assert "9:00 AM - 9:30 AM" in response["message"]
    assert response["metadata"]["doctor_tool_used"] == "list_doctor_appointments_for_day"
    assert response["metadata"]["actor_role"] == "doctor"
    assert response["metadata"]["role_source"] == "profile"


@pytest.mark.asyncio
async def test_doctor_schedule_patient_wording_uses_schedule_tool(monkeypatch):
    calls: list[str] = []

    _patch_graph(monkeypatch)
    monkeypatch.setattr(orch, "assistant_llm_is_configured", lambda: True)
    monkeypatch.setattr(orch, "log_assistant_llm_status_once", lambda: None)
    monkeypatch.setattr(orch.memory_tools, "memory_context", lambda *args, **kwargs: "")
    monkeypatch.setattr(orch, "invoke_with_model_fallback_cached", lambda *args, **kwargs: (_ for _ in ()).throw(AssertionError("Gemini should not be called")))

    def fake_schedule_tool(doctor_user_id, requested_day, timezone_name):
        calls.append("schedule")
        return {
            "doctor_user_id": doctor_user_id,
            "date": requested_day.isoformat(),
            "timezone": timezone_name,
            "count": 1,
            "appointments": [
                {
                    "patient_name": "Sara Patient",
                    "display_time": "11:00 AM",
                    "display_end_time": "11:30 AM",
                }
            ],
        }

    monkeypatch.setattr(orch, "list_doctor_appointments_for_day", fake_schedule_tool)

    chunks = await _drain(
        orch.stream_assistant_response(
            user=_FakeDoctor(),
            thread_id="thread-doctor-schedule-phrasing",
            message="Do I have any patients for today?",
            assistant_context={"timezone": "UTC"},
        )
    )

    assert calls == ["schedule"]
    response = chunks[-1]["response"]
    assert response["message_type"] == "doctor_schedule"
    assert "Sara Patient" in response["message"]
    assert response["metadata"]["actor_role"] == "doctor"


@pytest.mark.asyncio
async def test_doctor_schedule_any_day_wording_uses_schedule_tool(monkeypatch):
    calls: list[str] = []
    requested_dates: list[str] = []

    _patch_graph(monkeypatch)
    monkeypatch.setattr(orch, "assistant_llm_is_configured", lambda: True)
    monkeypatch.setattr(orch, "log_assistant_llm_status_once", lambda: None)
    monkeypatch.setattr(orch.memory_tools, "memory_context", lambda *args, **kwargs: "")
    monkeypatch.setattr(orch, "invoke_with_model_fallback_cached", lambda *args, **kwargs: (_ for _ in ()).throw(AssertionError("Gemini should not be called")))

    def fake_schedule_tool(doctor_user_id, requested_day, timezone_name):
        calls.append("schedule")
        requested_dates.append(requested_day.isoformat())
        return {
            "doctor_user_id": doctor_user_id,
            "date": requested_day.isoformat(),
            "timezone": timezone_name,
            "count": 0,
            "appointments": [],
        }

    monkeypatch.setattr(orch, "list_doctor_appointments_for_day", fake_schedule_tool)

    chunks = await _drain(
        orch.stream_assistant_response(
            user=_FakeDoctor(),
            thread_id="thread-doctor-schedule-any-day",
            message="Do I have any patients on Tuesday?",
            assistant_context={"timezone": "UTC"},
        )
    )

    assert calls == ["schedule"]
    response = chunks[-1]["response"]
    assert response["message_type"] == "doctor_schedule"
    assert len(requested_dates) == 1


@pytest.mark.asyncio
async def test_doctor_lab_results_question_does_not_hit_schedule_tool(monkeypatch):
    schedule_calls: list[str] = []
    llm_calls: list[str] = []

    _patch_graph(monkeypatch)
    monkeypatch.setattr(orch, "assistant_llm_is_configured", lambda: True)
    monkeypatch.setattr(orch, "log_assistant_llm_status_once", lambda: None)
    monkeypatch.setattr(orch.memory_tools, "memory_context", lambda *args, **kwargs: "")

    def fake_schedule_tool(*args, **kwargs):
        schedule_calls.append("schedule")
        return {"count": 0, "appointments": []}

    class _Resp:
        content = "I can help interpret trends in the lab results."

    def fake_llm(*args, **kwargs):
        llm_calls.append("llm")
        return _Resp()

    monkeypatch.setattr(orch, "list_doctor_appointments_for_day", fake_schedule_tool)
    monkeypatch.setattr(orch, "invoke_with_model_fallback_cached", fake_llm)

    chunks = await _drain(
        orch.stream_assistant_response(
            user=_FakeDoctor(),
            thread_id="thread-doctor-labs",
            message="Can you summarize my patient's lab results?",
            assistant_context={"timezone": "UTC"},
        )
    )

    response = chunks[-1]["response"]
    assert schedule_calls == []
    assert llm_calls == ["llm"]
    assert response["message_type"] == "general_health"
    assert response["metadata"]["actor_role"] == "doctor"


@pytest.mark.asyncio
async def test_assistant_context_mode_doctor_overrides_profile_role_for_schedule(monkeypatch):
    calls: list[str] = []

    _patch_graph(monkeypatch)
    monkeypatch.setattr(orch, "assistant_llm_is_configured", lambda: True)
    monkeypatch.setattr(orch, "log_assistant_llm_status_once", lambda: None)
    monkeypatch.setattr(orch.memory_tools, "memory_context", lambda *args, **kwargs: "")
    monkeypatch.setattr(orch, "invoke_with_model_fallback_cached", lambda *args, **kwargs: (_ for _ in ()).throw(AssertionError("Gemini should not be called")))

    def fake_schedule_tool(doctor_user_id, requested_day, timezone_name):
        calls.append("schedule")
        return {
            "doctor_user_id": doctor_user_id,
            "date": requested_day.isoformat(),
            "timezone": timezone_name,
            "count": 1,
            "appointments": [
                {"patient_name": "Mode Override Patient", "display_time": "2:00 PM", "display_end_time": "2:30 PM"}
            ],
        }

    monkeypatch.setattr(orch, "list_doctor_appointments_for_day", fake_schedule_tool)

    chunks = await _drain(
        orch.stream_assistant_response(
            user=_FakeUser(),  # profile role == patient
            thread_id="thread-mode-override",
            message="Do I have any patients for today?",
            assistant_context={"mode": "doctor", "timezone": "UTC", "metadata": {"ui_source": "doctor_ai_assistant"}},
        )
    )

    response = chunks[-1]["response"]
    assert calls == ["schedule"]
    assert response["message_type"] == "doctor_schedule"
    assert response["metadata"]["actor_role"] == "doctor"
    assert response["metadata"]["role_source"] == "context_mode"


@pytest.mark.asyncio
async def test_doctor_medication_question_is_decision_support_only(monkeypatch):
    calls: list[str] = []

    _patch_graph(monkeypatch)
    monkeypatch.setattr(orch, "assistant_llm_is_configured", lambda: True)
    monkeypatch.setattr(orch, "log_assistant_llm_status_once", lambda: None)
    monkeypatch.setattr(orch.memory_tools, "memory_context", lambda *args, **kwargs: "")
    monkeypatch.setattr(orch, "medication_pipeline", lambda *args, **kwargs: calls.append("medication") or {})

    chunks = await _drain(
        orch.stream_assistant_response(
            user=_FakeDoctor(),
            thread_id="thread-doctor-med",
            message="What dose should I prescribe for ibuprofen?",
        )
    )

    assert calls == []
    response = chunks[-1]["response"]
    assert "should not prescribe or choose a dose" in response["message"]
    assert response["metadata"]["actor_role"] == "doctor"


@pytest.mark.asyncio
async def test_stream_assistant_response_combined_runs_appointment_then_medication(monkeypatch):
    calls: list[str] = []

    _patch_graph(monkeypatch)
    monkeypatch.setattr(orch, "assistant_llm_is_configured", lambda: True)
    monkeypatch.setattr(orch, "log_assistant_llm_status_once", lambda: None)
    monkeypatch.setattr(orch.memory_tools, "memory_context", lambda *args, **kwargs: "")

    def fake_medication_pipeline(*args, **kwargs):
        calls.append("medication")
        return {"drugs_found": 1, "safe": [], "flagged": [], "top_candidates": [], "response": "med"}

    async def fake_doctor_workflow(*args, **kwargs):
        calls.append("appointment")
        return {"booking_mode": "suggest_only", "suggestion_cards": []}

    def fake_synthesize_response(**kwargs):
        assert kwargs["doctor_result"] is not None
        assert kwargs["medication_result"] is not None
        return _fake_synthesis_response("combined answer", "combined")

    monkeypatch.setattr(orch, "medication_pipeline", fake_medication_pipeline)
    monkeypatch.setattr(orch, "execute_doctor_match_workflow", fake_doctor_workflow)
    monkeypatch.setattr(orch, "synthesize_response", fake_synthesize_response)

    chunks = await _drain(
        orch.stream_assistant_response(
            user=_FakeUser(),
            thread_id="thread-3",
            message="Book a doctor appointment and suggest medication for fever",
        )
    )

    assert calls == ["appointment", "medication"]
    assert chunks[-1]["response"]["message_type"] == "combined"


@pytest.mark.asyncio
async def test_stream_assistant_response_general_chat_runs_no_tools(monkeypatch):
    calls: list[str] = []

    _patch_graph(monkeypatch)
    monkeypatch.setattr(orch, "assistant_llm_is_configured", lambda: True)
    monkeypatch.setattr(orch, "log_assistant_llm_status_once", lambda: None)
    monkeypatch.setattr(orch.memory_tools, "memory_context", lambda *args, **kwargs: "")
    monkeypatch.setattr(
        orch,
        "general_chat_node",
        lambda state: {"general_response": "I can help with hospital app questions."},
    )

    def fake_medication_pipeline(*args, **kwargs):
        calls.append("medication")
        return {}

    async def fake_doctor_workflow(*args, **kwargs):
        calls.append("appointment")
        return {}

    monkeypatch.setattr(orch, "medication_pipeline", fake_medication_pipeline)
    monkeypatch.setattr(orch, "execute_doctor_match_workflow", fake_doctor_workflow)

    # Rebuild after monkeypatching the graph node function object.
    _patch_graph(monkeypatch)

    chunks = await _drain(
        orch.stream_assistant_response(
            user=_FakeUser(),
            thread_id="thread-4",
            message="What can you help me with?",
        )
    )

    assert calls == []
    assert any(chunk["type"] == "delta" for chunk in chunks)
    assert chunks[-1]["type"] == "complete"
    assert chunks[-1]["response"]["message_type"] == "general_health"


@pytest.mark.asyncio
async def test_stream_assistant_response_uses_assistant_checkpoint_prefix(monkeypatch):
    captured: dict[str, object] = {}

    class FakeGraph:
        async def ainvoke(self, initial_state, config=None):
            captured["state"] = initial_state
            captured["config"] = config
            return {
                "ai_message": "done",
                "ai_message_type": "general_health",
                "unified_response": {"message": "done", "message_type": "general_health"},
            }

    monkeypatch.setattr(orch, "_ASSISTANT_GRAPH", FakeGraph())
    monkeypatch.setattr(orch, "assistant_llm_is_configured", lambda: True)
    monkeypatch.setattr(orch, "log_assistant_llm_status_once", lambda: None)

    chunks = await _drain(
        orch.stream_assistant_response(
            user=_FakeUser(),
            thread_id="thread-5",
            message="hello",
        )
    )

    assert captured["config"] == {"configurable": {"thread_id": "assistant:thread-5"}}
    assert captured["state"]["thread_id"] == "thread-5"
    assert chunks[-1]["type"] == "complete"


@pytest.mark.asyncio
async def test_general_chat_node_uses_contextual_fallback_when_models_fail(monkeypatch):
    monkeypatch.setattr(
        orch,
        "invoke_with_model_fallback_cached",
        lambda *args, **kwargs: (_ for _ in ()).throw(RuntimeError("503 UNAVAILABLE")),
    )

    out = await orch.general_chat_node(
        {
            "message": "Can you summarize this conversation?",
            "recent_messages": [
                {"role": "user", "content": "I have a headache"},
                {"role": "assistant", "content": "Tell me more about the timing"},
            ],
            "patient_profile": {"first_name": "Test", "last_name": "User"},
        }
    )

    assert "summary" in out["general_response"].lower()
    assert "i have a headache" in out["general_response"].lower()


@pytest.mark.asyncio
async def test_general_chat_node_doctor_hypertension_guideline_fallback_when_models_fail(monkeypatch):
    monkeypatch.setattr(
        orch,
        "invoke_with_model_fallback_cached",
        lambda *args, **kwargs: (_ for _ in ()).throw(RuntimeError("503 UNAVAILABLE")),
    )

    out = await orch.general_chat_node(
        {
            "message": "What are the latest treatment guidelines for hypertension?",
            "actor_role": "doctor",
            "recent_messages": [],
            "patient_profile": {"first_name": "Dana", "last_name": "Doctor"},
        }
    )

    text = out["general_response"].lower()
    assert "hypertension" in text
    assert "first-line" in text or "acei/arb" in text
    assert "<130/80" in out["general_response"]
    assert "you asked:" not in text


@pytest.mark.asyncio
async def test_stream_assistant_response_ambiguous_followup_uses_context_assisted(monkeypatch):
    calls: list[str] = []

    _patch_graph(monkeypatch)
    monkeypatch.setattr(orch, "assistant_llm_is_configured", lambda: True)
    monkeypatch.setattr(orch, "log_assistant_llm_status_once", lambda: None)
    monkeypatch.setattr(orch.memory_tools, "memory_context", lambda *args, **kwargs: "doctor appointment and specialist")

    async def fake_doctor_workflow(state):
        calls.append("appointment")
        return {"booking_mode": "suggest_only", "suggestion_cards": []}

    monkeypatch.setattr(orch, "execute_doctor_match_workflow", fake_doctor_workflow)
    monkeypatch.setattr(orch, "medication_pipeline", lambda *args, **kwargs: {})
    monkeypatch.setattr(orch, "synthesize_response", lambda **kwargs: _fake_synthesis_response("doctor followup", "appointment"))

    chunks = await _drain(
        orch.stream_assistant_response(
            user=_FakeUser(),
            thread_id="thread-followup-1",
            message="what about this?",
            recent_messages=[
                {"role": "user", "content": "I need a doctor for my case"},
                {"role": "assistant", "content": "I can help find one."},
            ],
        )
    )

    assert calls == ["appointment"]
    metadata = chunks[-1]["response"]["metadata"]
    assert metadata["intent_source"] == "context_assisted"
    assert chunks[-1]["response"]["message_type"] == "appointment"


@pytest.mark.asyncio
async def test_stream_assistant_response_very_ambiguous_returns_clarification(monkeypatch):
    calls: list[str] = []

    _patch_graph(monkeypatch)
    monkeypatch.setattr(orch, "assistant_llm_is_configured", lambda: True)
    monkeypatch.setattr(orch, "log_assistant_llm_status_once", lambda: None)
    monkeypatch.setattr(orch.memory_tools, "memory_context", lambda *args, **kwargs: "")

    async def fake_doctor_workflow(*args, **kwargs):
        calls.append("appointment")
        return {}

    monkeypatch.setattr(orch, "execute_doctor_match_workflow", fake_doctor_workflow)
    monkeypatch.setattr(orch, "medication_pipeline", lambda *args, **kwargs: calls.append("medication") or {})

    chunks = await _drain(
        orch.stream_assistant_response(
            user=_FakeUser(),
            thread_id="thread-followup-2",
            message="and this?",
            recent_messages=[
                {"role": "user", "content": "hello"},
                {"role": "assistant", "content": "hi"},
            ],
        )
    )

    assert calls == []
    assert "doctor search or lifestyle guidance" in chunks[-1]["response"]["message"].lower()
    metadata = chunks[-1]["response"]["metadata"]
    assert metadata["clarification_required"] is True
    assert metadata["intent_source"] == "clarified"


@pytest.mark.asyncio
async def test_stream_assistant_response_repeat_guard_rewrites_duplicate(monkeypatch):
    _patch_graph(monkeypatch)
    monkeypatch.setattr(orch, "assistant_llm_is_configured", lambda: True)
    monkeypatch.setattr(orch, "log_assistant_llm_status_once", lambda: None)
    monkeypatch.setattr(orch.memory_tools, "memory_context", lambda *args, **kwargs: "")
    monkeypatch.setattr(orch, "medication_pipeline", lambda *args, **kwargs: {})
    monkeypatch.setattr(
        orch,
        "synthesize_response",
        lambda **kwargs: _fake_synthesis_response(
            "Consider these lifestyle adjustments: Structured routine, breaks, exercise, sleep, mindfulness.",
            "appointment",
        ),
    )

    async def fake_doctor_workflow(*args, **kwargs):
        return {"booking_mode": "suggest_only", "suggestion_cards": []}

    monkeypatch.setattr(orch, "execute_doctor_match_workflow", fake_doctor_workflow)

    prev_answer = "Consider these lifestyle adjustments: Structured routine, breaks, exercise, sleep, mindfulness."
    chunks = await _drain(
        orch.stream_assistant_response(
            user=_FakeUser(),
            thread_id="thread-followup-3",
            message="Find me the best doctor for my case",
            recent_messages=[
                {"role": "user", "content": "What lifestyle changes if I am hyperactive?"},
                {"role": "assistant", "content": prev_answer},
            ],
        )
    )

    response = chunks[-1]["response"]
    assert response["message"] != prev_answer
    assert "doctor" in response["message"].lower()
    assert response["metadata"]["repeat_guard_triggered"] is True
