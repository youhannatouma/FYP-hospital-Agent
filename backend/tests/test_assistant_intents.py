from backend.orchestration.assistant_chat_orchestrator import _detect_doctor_intents, _detect_intents


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


def test_detect_doctor_intents_patients_for_today_route_to_schedule():
    intents = _detect_doctor_intents("Do I have any patients for today?")
    assert intents["appointment"] is True
    assert intents["route"] == "doctor_schedule"
    assert intents["source"] == "message_only"
    assert intents["confidence"] >= 0.9


def test_detect_doctor_intents_patients_for_tomorrow_route_to_schedule():
    intents = _detect_doctor_intents("Do I have any patients tomorrow?")
    assert intents["appointment"] is True
    assert intents["route"] == "doctor_schedule"


def test_detect_doctor_intents_appointments_for_weekday_route_to_schedule():
    intents = _detect_doctor_intents("Show my appointments on Tuesday")
    assert intents["appointment"] is True
    assert intents["route"] == "doctor_schedule"


def test_detect_doctor_intents_appointments_for_iso_date_route_to_schedule():
    intents = _detect_doctor_intents("What appointments do I have on 2026-05-12?")
    assert intents["appointment"] is True
    assert intents["route"] == "doctor_schedule"


def test_detect_doctor_intents_lab_results_routes_to_doctor_general():
    intents = _detect_doctor_intents("Can you summarize this patient's lab results?")
    assert intents["route"] == "doctor_general"
    assert intents["appointment"] is False
