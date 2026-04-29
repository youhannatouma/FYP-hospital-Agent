from backend.orchestration.assistant_chat_orchestrator import _detect_intents


def test_detect_intents_marks_cholesterol_question_as_general_health():
    intents = _detect_intents("What should I know about my cholesterol levels?")
    assert intents["general_health"] is True
    assert intents["appointment"] is False
