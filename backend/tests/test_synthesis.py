"""Unit tests for AI response synthesis layer.

Covers:
- Prompt selection based on available tool results
- Message generation (mocked LLM)
- Structured data extraction
- Action button extraction
- Streaming delta emission
- Error handling / fallback messages
"""
from __future__ import annotations

import json
import os
import uuid

os.environ.setdefault("GOOGLE_API_KEY", "test-key")

import pytest

from backend.orchestration import synthesis as synth
from backend.app.schemas.unified_agent_response import (
    UnifiedAgentResponse,
    ActionButton,
    MedicationResult,
    AppointmentResult,
)


# ── Fixtures ────────────────────────────────────────────────────────────

@pytest.fixture
def sample_patient():
    return {
        "user_id": "patient-001",
        "first_name": "John",
        "last_name": "Doe",
        "age": 34,
        "gender": "male",
        "allergies": ["penicillin"],
        "chronic_conditions": ["hypertension"],
    }


@pytest.fixture
def sample_medication_result():
    return {
        "drugs_found": 3,
        "safe": [
            {"brand_names": ["Advil"], "substances": ["ibuprofen"], "dosage": "200mg every 6h"},
        ],
        "flagged": [
            {"brand_names": ["Amoxil"], "substances": ["amoxicillin"], "risk_level": "high"},
        ],
        "top_candidates": [
            {"brand_names": ["Advil"], "substances": ["ibuprofen"], "dosage": "200mg every 6h"},
        ],
        "response": "some prior response",
    }


@pytest.fixture
def sample_doctor_result():
    return {
        "thread_id": "thread-abc",
        "suggestion_cards": [
            {
                "doctor_id": "doc-001",
                "doctor_name": "Dr. Smith",
                "specialty": "cardiology",
                "clinic_address": "123 Heart St",
                "earliest_available_at": "2026-04-26T09:00:00",
                "session_price": 150.0,
                "ranking_score": 0.95,
                "rationale": "specialty+proximity",
            }
        ],
        "booking_mode": "suggest_only",
        "booking_result": {},
        "booking_missing_fields": ["selected_appointment_date"],
        "booking_ready": False,
    }


@pytest.fixture
def sample_doctor_result_booked():
    return {
        "thread_id": "thread-abc",
        "suggestion_cards": [
            {
                "doctor_id": "doc-001",
                "doctor_name": "Dr. Smith",
                "specialty": "cardiology",
                "clinic_address": "123 Heart St",
                "earliest_available_at": "2026-04-26T09:00:00",
                "session_price": 150.0,
                "ranking_score": 0.95,
                "rationale": "specialty+proximity",
            }
        ],
        "booking_mode": "booked",
        "booking_result": {
            "appointment_id": "appt-001",
            "doctor_id": "doc-001",
            "doctor_name": "Dr. Smith",
            "appointment_date": "2026-04-26",
            "appointment_time": "09:00:00",
            "resolution_mode": "slot_id",
        },
        "booking_missing_fields": [],
        "booking_ready": True,
    }


# ── Prompt helper tests ─────────────────────────────────────────────────

def test_patient_summary_with_full_profile(sample_patient):
    summary = synth._patient_summary(sample_patient)
    assert "John Doe" in summary
    assert "34 years old" in summary
    assert "male" in summary
    assert "penicillin" in summary
    assert "hypertension" in summary


def test_patient_summary_empty():
    assert synth._patient_summary({}) == "Unknown patient"


def test_medication_summary_with_data(sample_medication_result):
    summary = synth._medication_summary(sample_medication_result)
    assert "3 drug(s) queried" in summary
    assert "1 passed safety screening" in summary
    assert "1 flagged for review" in summary


def test_medication_summary_none():
    assert synth._medication_summary(None) == "No medication data available."


def test_top_candidates_summary_with_data(sample_medication_result):
    summary = synth._top_candidates_summary(sample_medication_result)
    assert "Advil" in summary
    assert "ibuprofen" in summary
    assert "200mg every 6h" in summary


def test_top_candidates_summary_empty():
    assert synth._top_candidates_summary(None) == "None available."


def test_doctor_summary_with_cards(sample_doctor_result):
    summary = synth._doctor_summary(sample_doctor_result)
    assert "Dr. Smith" in summary
    assert "cardiology" in summary
    assert "$150" in summary
    assert "2026-04-26T09:00:00" in summary


def test_doctor_summary_empty():
    assert synth._doctor_summary(None) == "No doctor data available."


def test_booking_summary_suggest_only(sample_doctor_result):
    summary = synth._booking_summary(sample_doctor_result)
    assert "Suggestion only" in summary
    assert "selected_appointment_date" in summary


def test_booking_summary_booked(sample_doctor_result_booked):
    summary = synth._booking_summary(sample_doctor_result_booked)
    assert "Confirmed with Dr. Smith" in summary
    assert "2026-04-26" in summary
    assert "09:00:00" in summary


def test_booking_summary_no_data():
    assert synth._booking_summary(None) == "No booking attempted."


# ── Action extraction tests ─────────────────────────────────────────────

def test_extract_actions_suggest_only(sample_doctor_result):
    actions = synth._extract_actions(sample_doctor_result, None)
    assert len(actions) == 1
    assert actions[0].label == "Book Appointment"
    assert actions[0].action == "book"
    assert actions[0].payload["doctor_id"] == "doc-001"


def test_extract_actions_booked(sample_doctor_result_booked):
    actions = synth._extract_actions(sample_doctor_result_booked, None)
    assert len(actions) == 1
    assert actions[0].label == "View Appointment"
    assert actions[0].action == "view_profile"
    assert actions[0].payload["appointment_id"] == "appt-001"


def test_extract_actions_with_medication(sample_doctor_result, sample_medication_result):
    actions = synth._extract_actions(sample_doctor_result, sample_medication_result)
    labels = {a.label for a in actions}
    assert "Book Appointment" in labels
    assert "View Medications" in labels


# ── Core synthesis tests (mocked LLM) ───────────────────────────────────

def test_synthesize_medication_only(monkeypatch, sample_patient, sample_medication_result):
    captured_prompt = {"text": ""}

    class FakeLLM:
        def invoke(self, prompt):
            captured_prompt["text"] = prompt
            return type("Resp", (), {"content": "Take Advil 200mg every 6 hours."})()

    monkeypatch.setattr(synth, "_llm", FakeLLM())

    result = synth.synthesize_response(
        patient_profile=sample_patient,
        symptom="headache",
        need_text="headache",
        medication_result=sample_medication_result,
        doctor_result=None,
    )

    assert result.message_type == "medication"
    assert "Advil" in result.message or "Take Advil" in result.message
    assert result.medication_result is not None
    assert result.medication_result.drugs_found == 3
    assert result.appointment_result is None
    assert "Pharmacist" in captured_prompt["text"] or "pharmacist" in captured_prompt["text"]


def test_synthesize_appointment_only(monkeypatch, sample_patient, sample_doctor_result):
    captured_prompt = {"text": ""}

    class FakeLLM:
        def invoke(self, prompt):
            captured_prompt["text"] = prompt
            return type("Resp", (), {"content": "Dr. Smith is available tomorrow at 9 AM."})()

    monkeypatch.setattr(synth, "_llm", FakeLLM())

    result = synth.synthesize_response(
        patient_profile=sample_patient,
        symptom="chest pain",
        need_text="chest pain",
        medication_result=None,
        doctor_result=sample_doctor_result,
    )

    assert result.message_type == "appointment"
    assert result.appointment_result is not None
    assert result.appointment_result.booking_mode == "suggest_only"
    assert result.medication_result is None
    assert "Secretary" in captured_prompt["text"] or "secretary" in captured_prompt["text"]


def test_synthesize_combined(monkeypatch, sample_patient, sample_medication_result, sample_doctor_result):
    captured_prompt = {"text": ""}

    class FakeLLM:
        def invoke(self, prompt):
            captured_prompt["text"] = prompt
            return type("Resp", (), {"content": "**Medication Guidance**\nTake Advil.\n\n**Appointment Scheduling**\nSee Dr. Smith."})()

    monkeypatch.setattr(synth, "_llm", FakeLLM())

    result = synth.synthesize_response(
        patient_profile=sample_patient,
        symptom="chest pain",
        need_text="chest pain",
        medication_result=sample_medication_result,
        doctor_result=sample_doctor_result,
    )

    assert result.message_type == "combined"
    assert result.medication_result is not None
    assert result.appointment_result is not None
    assert "Medication Guidance" in captured_prompt["text"] or "Appointment Scheduling" in captured_prompt["text"]


def test_synthesize_error_no_tools_with_structured_errors(monkeypatch, sample_patient):
    class FakeLLM:
        def invoke(self, prompt):
            return type("Resp", (), {"content": "Your cholesterol trends matter; focus on diet, exercise, and follow-up labs."})()

    monkeypatch.setattr(synth, "_llm", FakeLLM())

    result = synth.synthesize_response(
        patient_profile=sample_patient,
        symptom="",
        need_text="",
        medication_result=None,
        doctor_result=None,
        structured_errors=[{"code": "SystemError", "message": "DB down"}],
    )

    assert result.message_type == "error"
    assert "cholesterol" in result.message.lower()


def test_synthesize_general_health_fallback(monkeypatch, sample_patient):
    class BrokenLLM:
        def invoke(self, prompt):
            raise RuntimeError("provider timeout")

    monkeypatch.setattr(synth, "_llm", BrokenLLM())

    result = synth.synthesize_response(
        patient_profile=sample_patient,
        symptom="",
        need_text="What should I know about my cholesterol levels?",
        medication_result=None,
        doctor_result=None,
    )

    assert result.message_type == "general_health"
    assert "general health guidance" in result.message.lower()


def test_synthesize_llm_failure_fallback(monkeypatch, sample_patient, sample_medication_result):
    class BrokenLLM:
        def invoke(self, prompt):
            raise RuntimeError("Gemini timeout")

    monkeypatch.setattr(synth, "_llm", BrokenLLM())

    result = synth.synthesize_response(
        patient_profile=sample_patient,
        symptom="headache",
        need_text="headache",
        medication_result=sample_medication_result,
        doctor_result=None,
    )

    assert result.message_type == "medication"
    assert result.message == sample_medication_result["response"]
    assert result.medication_result is not None  # Structured data still present


# ── Streaming tests ─────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_stream_synthesize_yields_deltas_then_complete(monkeypatch, sample_patient, sample_doctor_result):
    class FakeStreamLLM:
        def stream(self, prompt):
            for word in ["Dr.", " Smith", " is", " available."]:
                yield type("Chunk", (), {"content": word})()

    monkeypatch.setattr(synth, "_llm", FakeStreamLLM())

    chunks = []
    async for chunk in synth.stream_synthesize_response(
        patient_profile=sample_patient,
        symptom="chest pain",
        need_text="chest pain",
        medication_result=None,
        doctor_result=sample_doctor_result,
    ):
        chunks.append(chunk)

    deltas = [c for c in chunks if c["type"] == "delta"]
    completes = [c for c in chunks if c["type"] == "complete"]

    assert len(deltas) == 4
    assert deltas[0]["content"] == "Dr."
    assert deltas[1]["content"] == " Smith"
    assert len(completes) == 1
    assert "response" in completes[0]
    assert completes[0]["response"]["message_type"] == "appointment"


@pytest.mark.asyncio
async def test_stream_synthesize_fallback_on_error(monkeypatch, sample_patient, sample_doctor_result):
    class BrokenStreamLLM:
        def stream(self, prompt):
            raise RuntimeError("stream broke")

    monkeypatch.setattr(synth, "_llm", BrokenStreamLLM())

    chunks = []
    async for chunk in synth.stream_synthesize_response(
        patient_profile=sample_patient,
        symptom="chest pain",
        need_text="chest pain",
        medication_result=None,
        doctor_result=sample_doctor_result,
    ):
        chunks.append(chunk)

    deltas = [c for c in chunks if c["type"] == "delta"]
    completes = [c for c in chunks if c["type"] == "complete"]

    assert len(deltas) == 1
    assert "dr. smith" in deltas[0]["content"].lower()
    assert len(completes) == 1
    assert completes[0]["response"]["message_type"] == "appointment"


@pytest.mark.asyncio
async def test_stream_synthesize_general_health_path(monkeypatch, sample_patient):
    class FakeStreamLLM:
        def stream(self, prompt):
            for token in ["Keep ", "an eye ", "on LDL."]:
                yield type("Chunk", (), {"content": token})()

    monkeypatch.setattr(synth, "_llm", FakeStreamLLM())

    chunks = []
    async for chunk in synth.stream_synthesize_response(
        patient_profile=sample_patient,
        symptom="What should I know about cholesterol?",
        need_text="What should I know about cholesterol?",
        medication_result=None,
        doctor_result=None,
    ):
        chunks.append(chunk)

    completes = [c for c in chunks if c["type"] == "complete"]
    assert len(completes) == 1
    assert completes[0]["response"]["message_type"] == "general_health"


# ── LangGraph node test ─────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_synthesize_node_produces_ai_message(monkeypatch, sample_patient, sample_doctor_result):
    class FakeLLM:
        def invoke(self, prompt):
            return type("Resp", (), {"content": "Hello John, Dr. Smith is ready."})()

    monkeypatch.setattr(synth, "_llm", FakeLLM())

    state = {
        "patient_profile_snapshot": sample_patient,
        "need_text": "chest pain",
        "suggestion_cards": sample_doctor_result["suggestion_cards"],
        "booking_mode": "suggest_only",
        "booking_result": {},
        "booking_missing_fields": ["selected_appointment_date"],
        "structured_errors": [],
    }

    out = await synth.synthesize_node(state)

    assert "ai_message" in out
    assert "ai_message_type" in out
    assert "unified_response" in out
    assert out["ai_message_type"] == "appointment"
    assert "Dr. Smith" in out["ai_message"]


# ── Schema validation tests ─────────────────────────────────────────────

def test_unified_response_schema_roundtrip(sample_patient, sample_medication_result, sample_doctor_result):
    # Ensure the model validates and serializes cleanly
    response = UnifiedAgentResponse(
        message="Take Advil and see Dr. Smith.",
        message_type="combined",
        medication_result=MedicationResult(
            drugs_found=3,
            safe_count=1,
            flagged_count=1,
            top_candidates=sample_medication_result["top_candidates"],
        ),
        appointment_result=AppointmentResult(
            booking_mode="suggest_only",
            booking_ready=False,
            suggestions=sample_doctor_result["suggestion_cards"],
            missing_fields=["selected_appointment_date"],
        ),
        suggested_actions=[
            ActionButton(label="Book Appointment", action="book", payload={"doctor_id": "doc-001"}),
            ActionButton(label="View Medications", action="expand_meds", payload={}),
        ],
        thread_id="thread-abc",
        patient_user_id="patient-001",
        synthesis_source=["medication", "appointment"],
    )

    dumped = response.model_dump(mode="json")
    assert dumped["message"] == "Take Advil and see Dr. Smith."
    assert dumped["message_type"] == "combined"
    assert len(dumped["suggested_actions"]) == 2
    assert dumped["synthesis_source"] == ["medication", "appointment"]
