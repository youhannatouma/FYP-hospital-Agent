import asyncio
import os
from datetime import datetime, timedelta

os.environ.setdefault("GOOGLE_API_KEY", "test-key")

from backend import main as backend_main


def _approved_request():
    now = datetime.utcnow()
    return backend_main.approval_manager.ApprovalRequest(
        approval_id="approval-1",
        user_id="actor-1",
        task_id="book_appointment:thread-1",
        tool_name="book_appointment_cross_patient",
        operation_type="write",
        context={},
        created_at=now,
        expires_at=now + timedelta(minutes=5),
        status=backend_main.approval_manager.ApprovalStatus.APPROVED,
    )


def test_resume_approved_booking_success(monkeypatch):
    monkeypatch.setattr(backend_main, "emit_workflow_trace_event", lambda **_kwargs: None)
    monkeypatch.setattr(backend_main, "emit_telemetry_event", lambda *_args, **_kwargs: None)
    monkeypatch.setattr(backend_main.approval_manager, "get_approval_request", lambda _id: _approved_request())
    monkeypatch.setattr(backend_main.approval_manager, "complete_request", lambda *_args, **_kwargs: (True, "Updated"))
    monkeypatch.setattr(
        backend_main,
        "book_appointment",
        lambda **_kwargs: {"status": "booked", "appointment_id": "appt-1", "doctor_id": "doc-1"},
    )

    req = backend_main.ApprovalResumeRequest(
        thread_id="thread-1",
        actor_user_id="actor-1",
        patient_user_id="patient-1",
        doctor_id="doc-1",
        slot_id="11111111-1111-1111-1111-111111111111",
        booking_reason="approved",
        policy_context={"high_risk": True},
    )
    out = asyncio.run(backend_main.resume_approved_booking("approval-1", req))
    assert out["booking_mode"] == "booked"
    assert out["approval_outcome"]["status"] == "approved_resumed"


def test_resume_rejected_or_expired_fails(monkeypatch):
    monkeypatch.setattr(backend_main, "emit_workflow_trace_event", lambda **_kwargs: None)
    monkeypatch.setattr(backend_main, "emit_telemetry_event", lambda *_args, **_kwargs: None)
    now = datetime.utcnow()
    expired = backend_main.approval_manager.ApprovalRequest(
        approval_id="approval-2",
        user_id="actor-1",
        task_id="book_appointment:thread-1",
        tool_name="book_appointment_cross_patient",
        operation_type="write",
        context={},
        created_at=now - timedelta(minutes=10),
        expires_at=now - timedelta(minutes=1),
        status=backend_main.approval_manager.ApprovalStatus.EXPIRED,
    )
    monkeypatch.setattr(backend_main.approval_manager, "get_approval_request", lambda _id: expired)
    req = backend_main.ApprovalResumeRequest(
        thread_id="thread-1",
        actor_user_id="actor-1",
        patient_user_id="patient-1",
        doctor_id="doc-1",
        slot_id="11111111-1111-1111-1111-111111111111",
    )
    try:
        asyncio.run(backend_main.resume_approved_booking("approval-2", req))
        assert False, "Expected HTTPException for expired approval"
    except backend_main.HTTPException as exc:
        assert exc.status_code == 409
