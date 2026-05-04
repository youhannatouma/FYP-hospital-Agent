from __future__ import annotations

from collections import Counter, deque
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from threading import Lock
from typing import Any


@dataclass
class AssistantTelemetryEvent:
    event_name: str
    occurred_at: datetime
    thread_id: str
    user_id: str
    ui_source: str
    error_code: str | None = None
    duration_ms: int | None = None
    streamed_token_chunks: int | None = None


class AssistantTelemetryStore:
    def __init__(self, max_events: int = 5000):
        self._events: deque[AssistantTelemetryEvent] = deque(maxlen=max_events)
        self._lock = Lock()

    def record(self, event: AssistantTelemetryEvent) -> None:
        with self._lock:
            self._events.append(event)

    def summary(self, *, start: datetime, end: datetime) -> dict[str, Any]:
        with self._lock:
            selected = [e for e in self._events if start <= e.occurred_at <= end]

        by_event = Counter(e.event_name for e in selected)
        by_ui_source = Counter(e.ui_source or "unknown" for e in selected)
        by_error_code = Counter((e.error_code or "none") for e in selected if e.event_name == "assistant_request_failed")
        durations = [e.duration_ms for e in selected if e.duration_ms is not None]
        chunks = [e.streamed_token_chunks for e in selected if e.streamed_token_chunks is not None]

        return {
            "start": start.isoformat(),
            "end": end.isoformat(),
            "total_events": len(selected),
            "counts_by_event": dict(by_event),
            "counts_by_ui_source": dict(by_ui_source),
            "error_code_counts": dict(by_error_code),
            "avg_duration_ms": int(sum(durations) / len(durations)) if durations else None,
            "avg_streamed_token_chunks": float(sum(chunks) / len(chunks)) / 1.0 if chunks else None,
        }


assistant_telemetry_store = AssistantTelemetryStore()


def parse_summary_range(*, start: str | None, end: str | None) -> tuple[datetime, datetime]:
    now = datetime.now(timezone.utc)
    default_start = now - timedelta(hours=24)

    def _parse(raw: str | None, fallback: datetime) -> datetime:
        if not raw:
            return fallback
        value = raw.strip()
        if value.endswith("Z"):
            value = value[:-1] + "+00:00"
        parsed = datetime.fromisoformat(value)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc)

    parsed_start = _parse(start, default_start)
    parsed_end = _parse(end, now)
    if parsed_start > parsed_end:
        parsed_start, parsed_end = parsed_end, parsed_start
    return parsed_start, parsed_end

