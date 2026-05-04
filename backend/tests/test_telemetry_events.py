import json
import logging

from backend.telemetry.events import emit_telemetry_event


def _extract_json_from_record(record_message: str) -> dict:
    prefix = "TELEMETRY "
    assert prefix in record_message
    payload = record_message.split(prefix, 1)[1]
    return json.loads(payload)


def test_telemetry_masks_identifiers_and_need_text(monkeypatch, caplog):
    monkeypatch.setenv("TELEMETRY_ENABLED", "true")
    monkeypatch.setenv("TELEMETRY_SAMPLE_RATE", "1.0")
    monkeypatch.setenv("TELEMETRY_PII_MASKING", "true")
    monkeypatch.setenv("TELEMETRY_SINK", "stdout")

    caplog.set_level(logging.INFO, logger="backend.telemetry")

    emit_telemetry_event(
        "workflow_started",
        request_path="/supervisor/doctor/route",
        endpoint_family="dedicated",
        payload={
            "thread_id": "thread-1",
            "actor_user_id": "actor-1",
            "patient_user_id": "patient-1",
            "need_text": "severe headache",
            "booking_reason": "free text should not appear",
            "email": "hidden@example.com",
        },
    )

    records = [r for r in caplog.records if "TELEMETRY " in r.getMessage()]
    assert records
    event = _extract_json_from_record(records[-1].getMessage())

    assert "thread_id" not in event
    assert "actor_user_id" not in event
    assert "patient_user_id" not in event
    assert "need_text" not in event
    assert "booking_reason" not in event
    assert "email" not in event

    assert "thread_id_hash" in event
    assert "actor_user_id_hash" in event
    assert "patient_user_id_hash" in event
    assert "need_text_hash" in event


def test_telemetry_sampled_events_can_be_suppressed(monkeypatch, caplog):
    monkeypatch.setenv("TELEMETRY_ENABLED", "true")
    monkeypatch.setenv("TELEMETRY_SAMPLE_RATE", "0.0")
    monkeypatch.setenv("TELEMETRY_PII_MASKING", "true")

    caplog.set_level(logging.INFO, logger="backend.telemetry")

    emit_telemetry_event(
        "ranking_emitted",
        payload={"thread_id": "thread-1", "actor_user_id": "actor-1"},
    )

    records = [r for r in caplog.records if "TELEMETRY " in r.getMessage()]
    assert records == []


def test_telemetry_always_emit_events_ignore_sampling(monkeypatch, caplog):
    monkeypatch.setenv("TELEMETRY_ENABLED", "true")
    monkeypatch.setenv("TELEMETRY_SAMPLE_RATE", "0.0")
    monkeypatch.setenv("TELEMETRY_PII_MASKING", "true")

    caplog.set_level(logging.INFO, logger="backend.telemetry")

    emit_telemetry_event(
        "booking_denied",
        payload={
            "thread_id": "thread-1",
            "actor_user_id": "actor-1",
            "patient_user_id": "patient-1",
            "denial_reason_code": "BookingSlotUnavailable",
        },
    )

    records = [r for r in caplog.records if "TELEMETRY " in r.getMessage()]
    assert records
    event = _extract_json_from_record(records[-1].getMessage())
    assert event["event_name"] == "booking_denied"
    assert event["sample_rate"] == 1.0
