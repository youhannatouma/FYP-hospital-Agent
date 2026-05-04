import os
import uuid

import pytest
from fastapi.testclient import TestClient

os.environ.setdefault("GOOGLE_API_KEY", "test-key")

from backend import main as backend_main
from backend.tools.doctor_matching_tools import BookingDomainError


class _AllowAllRateLimiter:
    def check_rate_limit(self, _user_id: str):
        return True, None


@pytest.fixture()
def client(monkeypatch):
    monkeypatch.setattr(backend_main, "_verify_database_connectivity", lambda: None)
    monkeypatch.setattr(backend_main, "_enforce_database_safeguards", lambda: None)
    monkeypatch.setattr(backend_main.memory_tools, "load_snapshot", lambda _path: 0)
    monkeypatch.setattr(backend_main.memory_tools, "save_snapshot", lambda _path: True)
    monkeypatch.setattr(
        backend_main.stream_manager,
        "get_rate_limiter",
        lambda: _AllowAllRateLimiter(),
    )
    with TestClient(backend_main.app, raise_server_exceptions=False) as c:
        yield c


def _doctor_request_payload() -> dict:
    return {
        "thread_id": f"thread-{uuid.uuid4()}",
        "actor_user_id": f"actor-{uuid.uuid4()}",
        "patient_user_id": f"patient-{uuid.uuid4()}",
        "need_text": "persistent cough",
    }


@pytest.mark.parametrize(
    "code, expected_status",
    [
        ("InvalidBookingActorRole", 403),
        ("ActorPatientScopeViolation", 403),
        ("MissingAuditReason", 422),
        ("ApprovalRequired", 409),
        ("InvalidPatientRole", 422),
    ],
)
def test_supervisor_doctor_route_maps_authorization_errors(client, monkeypatch, code, expected_status):
    async def failing_execute(_state: dict):
        raise BookingDomainError(code, f"simulated {code}")

    monkeypatch.setattr(backend_main, "execute_doctor_match_workflow", failing_execute)

    response = client.post("/supervisor/doctor/route", json=_doctor_request_payload())

    assert response.status_code == expected_status
    body = response.json()
    assert body["error"]["code"] == code
    assert "simulated" in body["error"]["message"]


def test_legacy_supervisor_route_maps_authorization_error_for_doctor_payload(client, monkeypatch):
    async def failing_execute(_state: dict):
        raise BookingDomainError("ActorPatientScopeViolation", "scope violation")

    monkeypatch.setattr(backend_main, "execute_doctor_match_workflow", failing_execute)

    response = client.post("/supervisor/route", json=_doctor_request_payload())

    assert response.status_code == 403
    body = response.json()
    assert body["error"]["code"] == "ActorPatientScopeViolation"


def test_supervisor_doctor_route_non_domain_error_is_internal(client, monkeypatch):
    async def failing_execute(_state: dict):
        raise RuntimeError("unexpected")

    monkeypatch.setattr(backend_main, "execute_doctor_match_workflow", failing_execute)

    response = client.post("/supervisor/doctor/route", json=_doctor_request_payload())

    # Fallback retries the same execution and still fails; should surface as 500.
    assert response.status_code == 500
