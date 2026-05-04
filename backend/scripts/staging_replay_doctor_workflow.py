#!/usr/bin/env python3
"""Executable multi-turn replay harness for specialized doctor workflow endpoints."""
from __future__ import annotations

import argparse
import json
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from urllib import error, request


@dataclass
class ReplayResult:
    name: str
    endpoint: str
    status_code: int
    ok: bool
    thread_id: str | None
    booking_mode: str | None
    booking_committed: bool | None
    booking_blocked_reason: str | None
    appointment_id: str | None
    mismatch: str | None = None


def _post_json(url: str, payload: dict[str, Any], timeout: float) -> tuple[int, dict[str, Any]]:
    body = json.dumps(payload).encode("utf-8")
    req = request.Request(url=url, data=body, headers={"Content-Type": "application/json"}, method="POST")
    try:
        with request.urlopen(req, timeout=timeout) as resp:
            data = resp.read().decode("utf-8")
            return resp.getcode(), json.loads(data)
    except error.HTTPError as exc:
        data = exc.read().decode("utf-8") if exc.fp is not None else "{}"
        try:
            return exc.code, json.loads(data)
        except json.JSONDecodeError:
            return exc.code, {"error": {"message": data}}


def _extract_result(name: str, endpoint: str, status_code: int, response_body: dict[str, Any]) -> ReplayResult:
    booking_result = response_body.get("booking_result") if isinstance(response_body, dict) else {}
    appointment_id = None
    if isinstance(booking_result, dict):
        appointment_id = booking_result.get("appointment_id")

    return ReplayResult(
        name=name,
        endpoint=endpoint,
        status_code=status_code,
        ok=200 <= status_code < 300,
        thread_id=response_body.get("thread_id") if isinstance(response_body, dict) else None,
        booking_mode=response_body.get("booking_mode") if isinstance(response_body, dict) else None,
        booking_committed=response_body.get("booking_committed") if isinstance(response_body, dict) else None,
        booking_blocked_reason=response_body.get("booking_blocked_reason") if isinstance(response_body, dict) else None,
        appointment_id=appointment_id,
    )


def _check_expectations(result: ReplayResult, response_body: dict[str, Any], expect: dict[str, Any] | None) -> str | None:
    if not expect:
        return None

    for key, expected_value in expect.items():
        actual = response_body.get(key)
        if actual != expected_value:
            return f"Expected {key}={expected_value!r}, got {actual!r}"
    return None


def run_replay(base_url: str, scenario_file: Path, timeout: float) -> dict[str, Any]:
    scenario_data = json.loads(scenario_file.read_text(encoding="utf-8"))
    scenarios = scenario_data.get("scenarios", [])

    if not isinstance(scenarios, list) or not scenarios:
        raise ValueError("Scenario file must contain a non-empty 'scenarios' list")

    results: list[ReplayResult] = []
    appointment_ids: list[str] = []

    for item in scenarios:
        name = str(item.get("name") or "unnamed")
        endpoint = str(item.get("endpoint") or "/supervisor/doctor/route")
        payload = item.get("payload") or {}
        expect = item.get("expect")

        status, body = _post_json(f"{base_url.rstrip('/')}{endpoint}", payload, timeout)
        outcome = _extract_result(name, endpoint, status, body)
        outcome.mismatch = _check_expectations(outcome, body, expect if isinstance(expect, dict) else None)

        if outcome.appointment_id:
            appointment_ids.append(str(outcome.appointment_id))

        results.append(outcome)

    duplicates = sorted({a for a in appointment_ids if appointment_ids.count(a) > 1})
    mismatches = [r for r in results if r.mismatch]
    failed_http = [r for r in results if not r.ok]

    return {
        "scenario_count": len(results),
        "duplicates": duplicates,
        "http_failures": [
            {"name": r.name, "status_code": r.status_code, "endpoint": r.endpoint}
            for r in failed_http
        ],
        "expectation_mismatches": [
            {"name": r.name, "mismatch": r.mismatch, "endpoint": r.endpoint}
            for r in mismatches
        ],
        "results": [r.__dict__ for r in results],
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Replay multi-turn specialized workflow scenarios against staging")
    parser.add_argument("--base-url", required=True, help="Base URL for backend (for example https://staging.example.com)")
    parser.add_argument(
        "--scenario-file",
        default="backend/scripts/staging_replay_scenarios.json",
        help="Path to replay scenarios JSON",
    )
    parser.add_argument("--timeout", type=float, default=20.0, help="HTTP request timeout in seconds")
    parser.add_argument("--output-file", default="", help="Optional output report path")
    args = parser.parse_args()

    report = run_replay(args.base_url, Path(args.scenario_file), args.timeout)

    output = json.dumps(report, ensure_ascii=True, indent=2)
    print(output)

    if args.output_file:
        Path(args.output_file).write_text(output + "\n", encoding="utf-8")

    has_failures = bool(report["duplicates"] or report["http_failures"] or report["expectation_mismatches"])
    return 1 if has_failures else 0


if __name__ == "__main__":
    sys.exit(main())
