"""Structured telemetry event helpers with optional sampling and PII masking."""
from __future__ import annotations

import hashlib
import json
import logging
import os
from datetime import datetime, timezone
from typing import Any

log = logging.getLogger("backend.telemetry")

_SCHEMA_VERSION = "v1"
_ALWAYS_EMIT = {
    "booking_denied",
    "booking_committed",
    "fallback_triggered",
    "workflow_failed",
}


def _env_flag(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def _env_float(name: str, default: float) -> float:
    raw = os.getenv(name)
    if raw is None:
        return default
    try:
        value = float(raw)
    except ValueError:
        return default
    return max(0.0, min(1.0, value))


def _sha256_short(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()[:16]


def _sanitize_dict(value: dict[str, Any]) -> dict[str, Any]:
    safe: dict[str, Any] = {}
    for k, v in value.items():
        if v is None:
            continue
        safe[k] = v
    return safe


def _should_emit(event_name: str, sample_key: str | None = None) -> tuple[bool, float]:
    sample_rate = _env_float("TELEMETRY_SAMPLE_RATE", 0.10)
    if event_name in _ALWAYS_EMIT:
        return True, 1.0

    if sample_rate >= 1.0:
        return True, sample_rate
    if sample_rate <= 0.0:
        return False, sample_rate

    key = str(sample_key or event_name)
    bucket = int(hashlib.sha256(key.encode("utf-8")).hexdigest(), 16) % 10000
    threshold = int(sample_rate * 10000)
    return bucket < threshold, sample_rate


def _mask_event_identifiers(payload: dict[str, Any]) -> dict[str, Any]:
    if not _env_flag("TELEMETRY_PII_MASKING", True):
        return payload

    masked = dict(payload)
    for raw_key in ("thread_id", "actor_user_id", "patient_user_id"):
        value = masked.pop(raw_key, None)
        if value:
            masked[f"{raw_key}_hash"] = _sha256_short(str(value))

    # Never emit free-text medical/user context directly.
    if "need_text" in masked:
        masked["need_text_hash"] = _sha256_short(str(masked.pop("need_text")))
    masked.pop("booking_reason", None)
    masked.pop("clinic_address", None)
    masked.pop("email", None)

    return masked


def emit_telemetry_event(
    event_name: str,
    *,
    service: str = "backend",
    workflow_family: str = "specialized_doctor",
    request_path: str = "",
    endpoint_family: str = "",
    sample_key: str | None = None,
    payload: dict[str, Any] | None = None,
) -> None:
    """Emit one structured telemetry event to configured sink.

    Emits nothing when TELEMETRY_ENABLED=false.
    """
    if not _env_flag("TELEMETRY_ENABLED", False):
        return

    sampled, sample_rate = _should_emit(event_name, sample_key=sample_key)
    if not sampled:
        return

    base: dict[str, Any] = {
        "event_name": event_name,
        "schema_version": _SCHEMA_VERSION,
        "occurred_at_utc": datetime.now(timezone.utc).isoformat(),
        "service": service,
        "environment": os.getenv("ENVIRONMENT", "local"),
        "workflow_family": workflow_family,
        "request_path": request_path,
        "endpoint_family": endpoint_family,
        "sampled": sampled,
        "sample_rate": sample_rate,
    }

    if payload:
        base.update(_sanitize_dict(payload))

    event = _mask_event_identifiers(base)
    sink = os.getenv("TELEMETRY_SINK", "stdout").strip().lower() or "stdout"

    serialized = json.dumps(event, ensure_ascii=True)
    if sink == "stdout":
        log.info("TELEMETRY %s", serialized)
    else:
        # Current implementation uses logger for all sinks.
        log.info("TELEMETRY[%s] %s", sink, serialized)
