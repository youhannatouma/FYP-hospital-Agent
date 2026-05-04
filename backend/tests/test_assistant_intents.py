from backend.orchestration.assistant_chat_orchestrator import _detect_intents


def test_detect_intents_marks_cholesterol_question_as_general_health():
    intents = _detect_intents("What should I know about my cholesterol levels?")
    assert intents["general_health"] is True
    assert intents["appointment"] is False
    assert intents["route"] == "general_health"
    assert intents["source"] == "message_only"
    assert intents["confidence"] >= 0.7


def test_detect_intents_medication_only_route():
    intents = _detect_intents("What medication can I take for a headache?")
    assert intents["medication"] is True
    assert intents["appointment"] is False
    assert intents["route"] == "medication_only"
    assert intents["source"] == "message_only"
    assert intents["confidence"] >= 0.9


def test_detect_intents_appointment_only_route():
    intents = _detect_intents("Please book an appointment with a cardiology doctor.")
    assert intents["appointment"] is True
    assert intents["medication"] is False
    assert intents["route"] == "appointment_only"
    assert intents["source"] == "message_only"
    assert intents["confidence"] >= 0.9


def test_detect_intents_combined_route():
    intents = _detect_intents("I need to book a doctor visit and recommend medication for my fever.")
    assert intents["appointment"] is True
    assert intents["medication"] is True
    assert intents["combined"] is True
    assert intents["route"] == "combined"
    assert intents["source"] == "message_only"
    assert intents["confidence"] >= 0.9
