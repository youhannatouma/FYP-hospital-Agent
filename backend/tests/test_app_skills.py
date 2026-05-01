from __future__ import annotations

from types import SimpleNamespace
from uuid import uuid4

from fastapi import HTTPException
import pytest

from backend.app.skills.authorization_skill import AuthorizationSkill
from backend.app.skills.error_handling_skill import ErrorHandlingSkill


def test_authorization_skill_authorize_role_allows_matching_role():
    user = SimpleNamespace(role="patient", user_id=uuid4())
    AuthorizationSkill.authorize_role(user, ["patient", "admin"])


def test_authorization_skill_authorize_role_rejects_non_matching_role():
    user = SimpleNamespace(role="patient", user_id=uuid4())
    with pytest.raises(HTTPException) as exc:
        AuthorizationSkill.authorize_role(user, ["doctor"])
    assert exc.value.status_code == 403


def test_authorization_skill_authorize_resource_access_allows_owner():
    user_id = uuid4()
    user = SimpleNamespace(role="patient", user_id=user_id)
    AuthorizationSkill.authorize_resource_access(user, [user_id, uuid4()])


def test_error_handling_skill_maps_value_error_to_bad_request():
    exc = ErrorHandlingSkill.handle(ValueError("bad input"))
    assert isinstance(exc, HTTPException)
    assert exc.status_code == 400
    assert exc.detail == "bad input"


def test_error_handling_skill_passes_http_exception_through():
    original = HTTPException(status_code=404, detail="missing")
    assert ErrorHandlingSkill.handle(original) is original
