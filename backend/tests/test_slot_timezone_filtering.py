import os
import uuid
from contextlib import contextmanager
from datetime import date, datetime

# Prevent import-time Gemini client validation errors from sibling tool modules.
os.environ.setdefault("GOOGLE_API_KEY", "test-key")

from backend.tools import doctor_matching_tools as dmt


class _FakeResult:
    def mappings(self):
        return self

    def all(self):
        return []


class _FakeConn:
    def __init__(self):
        self.last_params = None

    def execute(self, _sql, params):
        self.last_params = dict(params)
        return _FakeResult()


class _FakeEngine:
    def __init__(self, conn):
        self._conn = conn

    @contextmanager
    def connect(self):
        yield self._conn


def test_list_available_slots_builds_utc_day_window(monkeypatch):
    fake_conn = _FakeConn()
    monkeypatch.setattr(dmt, "_engine", lambda: _FakeEngine(fake_conn))

    _ = dmt.list_available_slots(
        doctor_id=str(uuid.uuid4()),
        on_date=date(2026, 4, 14),
        booking_timezone="Asia/Beirut",
    )

    assert "on_start_utc" in fake_conn.last_params
    assert "on_end_utc" in fake_conn.last_params

    start = fake_conn.last_params["on_start_utc"]
    end = fake_conn.last_params["on_end_utc"]
    assert isinstance(start, datetime)
    assert isinstance(end, datetime)
    assert start.tzinfo is None
    assert end.tzinfo is None
    assert (end - start).total_seconds() == 24 * 60 * 60


def test_list_available_slots_invalid_timezone_raises(monkeypatch):
    fake_conn = _FakeConn()
    monkeypatch.setattr(dmt, "_engine", lambda: _FakeEngine(fake_conn))

    try:
        dmt.list_available_slots(
            doctor_id=str(uuid.uuid4()),
            on_date=date(2026, 4, 14),
            booking_timezone="Invalid/Zone",
        )
        assert False, "Expected ValueError for invalid booking timezone"
    except ValueError as exc:
        assert "Invalid booking timezone" in str(exc)
