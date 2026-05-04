import asyncio
import os
import uuid

os.environ.setdefault("GOOGLE_API_KEY", "test-key")

from backend.orchestration import supervisor_workflow as swf


def test_doctor_graph_order_constant_is_expected():
    assert swf._DOCTOR_GRAPH_NODE_ORDER == [
        "profile_user_node",
        "match_doctors_node",
        "suggest_cards_node",
        "profile_view_node",
        "conditional_book_node",
        "synthesize_node",
    ]


def test_stream_doctor_plan_emits_expected_stage_order(monkeypatch):
    def fake_profile_user(_patient_user_id: str):
        return {"user_id": _patient_user_id, "first_name": "P"}

    def fake_search_doctors_for_need(_need_text: str, _patient_user_id: str, _max: int):
        return {"candidates": []}

    monkeypatch.setattr(swf, "profile_user", fake_profile_user)
    monkeypatch.setattr(swf, "search_doctors_for_need", fake_search_doctors_for_need)

    state: swf.SupervisorState = {
        "thread_id": f"thread-{uuid.uuid4()}",
        "actor_user_id": f"actor-{uuid.uuid4()}",
        "patient_user_id": f"patient-{uuid.uuid4()}",
        "need_text": "dry cough",
    }

    async def _read_plan_event():
        stream = swf.stream_doctor_match_workflow(state)
        first = await stream.__anext__()
        await stream.aclose()
        return first

    plan_event = asyncio.run(_read_plan_event())

    assert plan_event["type"] == "plan"
    assert plan_event["stages"] == [[name] for name in swf._DOCTOR_GRAPH_NODE_ORDER]
    assert plan_event["total_stages"] == len(swf._DOCTOR_GRAPH_NODE_ORDER)


def test_stream_doctor_events_include_booking_contract_fields(monkeypatch):
    def fake_profile_user(_patient_user_id: str):
        return {"user_id": _patient_user_id, "first_name": "P"}

    def fake_search_doctors_for_need(_need_text: str, _patient_user_id: str, _max: int):
        return {"candidates": []}

    monkeypatch.setattr(swf, "profile_user", fake_profile_user)
    monkeypatch.setattr(swf, "search_doctors_for_need", fake_search_doctors_for_need)

    state: swf.SupervisorState = {
        "thread_id": f"thread-{uuid.uuid4()}",
        "actor_user_id": f"actor-{uuid.uuid4()}",
        "patient_user_id": f"patient-{uuid.uuid4()}",
        "need_text": "dry cough",
    }

    async def _collect_until_complete():
        stream = swf.stream_doctor_match_workflow(state)
        events = []
        async for event in stream:
            events.append(event)
            if event.get("type") == "complete":
                break
        await stream.aclose()
        return events

    events = asyncio.run(_collect_until_complete())
    stage_completes = [e for e in events if e.get("type") == "stage_complete"]
    assert stage_completes

    first_stage_payload = next(iter(stage_completes[0]["results"].values()))
    assert "booking_blocked_missing_fields" in first_stage_payload
    assert "booking_failed_validation" in first_stage_payload

    complete_event = next(e for e in events if e.get("type") == "complete")
    complete_results = complete_event["results"]
    assert "booking_blocked_missing_fields" in complete_results
    assert "booking_failed_validation" in complete_results
