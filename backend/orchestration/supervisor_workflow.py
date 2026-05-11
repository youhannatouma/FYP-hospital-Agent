"""LangGraph-based supervisor workflow execution.

Phase 2 execution architecture:
- Typed state schema for complex workflows
- Stage planning via independence matrix
- Async execution with asyncio.to_thread for blocking tool calls

Phase 3 streaming architecture:
- SSE-based streaming with partial result yields
- Cancellation support via stream tokens
- Progress tracking for real-time UI updates
"""
from __future__ import annotations

import asyncio
import logging
from datetime import date, time
from time import perf_counter
from typing import Any, AsyncIterator, Callable, Literal, TypedDict

from langgraph.graph import END, START, StateGraph

try:
    from app.schemas.doctor_matching_agent import BookingSelectionInput
    from memory import memory_tools
    from middleware import stream_manager
    from middleware.lock_manager import lock_manager
    from orchestration.checkpoint_store import get_checkpoint_saver
    from orchestration.supervisor_routing import ToolTask, build_parallel_stages, execute_parallel_plan
    from orchestration.synthesis import synthesize_node
    from telemetry import emit_telemetry_event
    from telemetry import emit_workflow_trace_event, new_run_id
    from tools.doctor_appointment_tools import list_doctor_appointments_for_day
    from tools.doctor_matching_tools import (
        BookingDomainError,
        book_appointment,
        profile_user,
        search_user,
        search_doctors_for_need,
    )
except ImportError:  # Fallback for backend package context
    from .checkpoint_store import get_checkpoint_saver
    from .supervisor_routing import ToolTask, build_parallel_stages, execute_parallel_plan
    from .synthesis import synthesize_node
    from ..app.schemas.doctor_matching_agent import BookingSelectionInput
    from ..memory import memory_tools
    from ..middleware import stream_manager
    from ..middleware.lock_manager import lock_manager
    from ..telemetry import emit_telemetry_event
    from ..telemetry import emit_workflow_trace_event, new_run_id
    from ..tools.doctor_appointment_tools import list_doctor_appointments_for_day
    from ..tools.doctor_matching_tools import (
        BookingDomainError,
        book_appointment,
        profile_user,
        search_user,
        search_doctors_for_need,
    )

log = logging.getLogger(__name__)


class SupervisorState(TypedDict, total=False):
    # Existing generic supervisor fields.
    user_id: str
    task_specs: list[dict[str, Any]]
    planned_tasks: list[ToolTask]
    planned_stages: list[list[str]]
    raw_results: dict[str, Any]
    results: dict[str, Any]
    errors: list[str]

    # Phase 1: Specialized doctor-matching/booking state contract.
    thread_id: str
    patient_profile_snapshot: dict[str, Any]
    inferred_need: str
    ranked_doctor_candidates: list[dict[str, Any]]
    selected_doctor: dict[str, Any]
    selected_slot_id: str
    selected_appointment_date: date | str
    selected_appointment_time: time | str
    booking_timezone: str
    booking_reason: str
    policy_context: dict[str, Any]
    booking_ready: bool
    booking_missing_fields: list[str]
    booking_blocked_missing_fields: list[str]
    booking_blocked_reason: str
    booking_requirements: list[str]
    cards_emitted: bool
    booking_attempted: bool
    booking_committed: bool
    resume_from_checkpoint: bool
    checkpoint_version: str | int
    booking_result: dict[str, Any]
    booking_failed_validation: bool
    booking_mode: Literal["suggest_only", "booked", "booking_failed", "booking_pending_approval"]
    approval_outcome: dict[str, Any]
    structured_errors: list[dict[str, Any]]
    doctor_resolution_status: str
    doctor_resolution_candidates: list[dict[str, Any]]
    actor_user_id: str
    patient_user_id: str
    need_text: str
    max_suggestions: int
    suggestion_cards: list[dict[str, Any]]

    # Phase 5: AI synthesis response
    ai_message: str
    ai_message_type: str
    unified_response: dict[str, Any]
    medication_result: dict[str, Any] | None
    trace_run_id: str


CHECKPOINT_VERSION = "phase3-v1"
THREAD_LOCK_TIMEOUT_SECONDS = 5.0
_DOCTOR_GRAPH_NODE_ORDER = [
    "profile_user_node",
    "match_doctors_node",
    "suggest_cards_node",
    "profile_view_node",
    "conditional_book_node",
    "synthesize_node",
]
_BOOKING_COMMITTED_FIELDS = {
    "booking_attempted",
    "booking_committed",
    "booking_mode",
    "booking_result",
    "structured_errors",
}
_NON_DESTRUCTIVE_INPUT_FIELDS = {
    "need_text",
    "selected_doctor",
    "selected_appointment_date",
    "selected_appointment_time",
    "max_suggestions",
}

_VALIDATION_BOOKING_ERROR_CODES = {
    "MissingThreadId",
    "PatientNotFound",
    "DoctorNotFound",
    "ActorNotFound",
    "AuthorizationPolicyNotConfigured",
    "ActorPatientScopeViolation",
    "InvalidPatientRole",
    "InvalidBookingActorRole",
    "MissingAuditReason",
    "DoctorIdentityMismatch",
    "BookingSlotNotFound",
    "BookingSlotUnavailable",
    "BookingSlotAlreadyBooked",
}


def _booking_denial_category(code: str) -> str:
    if code in {
        "MissingThreadId",
        "MissingNeedText",
        "MissingPatientUserId",
        "DoctorNameNotFound",
        "DoctorNameAmbiguous",
        "DoctorIdentityMismatch",
        "InvalidPatientRole",
        "BookingSlotNotFound",
        "BookingSlotUnavailable",
        "BookingSlotAlreadyBooked",
    }:
        return "validation"
    if code in {
        "ActorNotFound",
        "InvalidBookingActorRole",
        "ActorPatientScopeViolation",
        "MissingAuditReason",
        "ApprovalRequired",
        "AuthorizationPolicyNotConfigured",
    }:
        return "authorization"
    if code in {"BookingPersistenceError", "ThreadLockTimeout"}:
        return "system"
    return "resource"


def _coerce_date_value(value: Any) -> date | None:
    if value is None:
        return None
    if isinstance(value, date):
        return value
    if isinstance(value, str):
        try:
            return date.fromisoformat(value)
        except ValueError:
            return None
    return None


def _coerce_time_value(value: Any) -> time | None:
    if value is None:
        return None
    if isinstance(value, time):
        return value
    if isinstance(value, str):
        try:
            return time.fromisoformat(value)
        except ValueError:
            return None
    return None


def _normalize_doctor_name(value: Any) -> str:
    return " ".join(str(value or "").strip().lower().split())


def _doctor_resolution_candidates_from_rows(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for row in rows:
        first = str(row.get("first_name") or "").strip()
        last = str(row.get("last_name") or "").strip()
        full = " ".join(part for part in [first, last] if part).strip()
        out.append(
            {
                "doctor_id": row.get("user_id"),
                "doctor_name": full,
                "email": row.get("email"),
            }
        )
    return out


async def _resolve_selected_doctor_from_candidates(
    selected_doctor: dict[str, Any] | None,
    ranked_doctor_candidates: list[dict[str, Any]],
) -> tuple[dict[str, Any] | None, str, list[dict[str, Any]]]:
    if isinstance(selected_doctor, dict):
        doctor_id = str(selected_doctor.get("doctor_id") or "").strip()
        if doctor_id:
            return selected_doctor, "resolved", []

    if not isinstance(selected_doctor, dict):
        return selected_doctor, "missing_name", []

    doctor_name = str(selected_doctor.get("doctor_name") or "").strip()
    if not doctor_name:
        return selected_doctor, "missing_name", []

    normalized = _normalize_doctor_name(doctor_name)

    ranked_exact = [
        c
        for c in ranked_doctor_candidates
        if _normalize_doctor_name(c.get("doctor_name")) == normalized
    ]
    if len(ranked_exact) == 1:
        resolved = dict(selected_doctor)
        resolved["doctor_id"] = ranked_exact[0].get("doctor_id")
        if not resolved.get("doctor_name"):
            resolved["doctor_name"] = ranked_exact[0].get("doctor_name")
        return resolved, "resolved", []
    if len(ranked_exact) > 1:
        return selected_doctor, "ambiguous", [
            {
                "doctor_id": c.get("doctor_id"),
                "doctor_name": c.get("doctor_name"),
                "specialty": c.get("specialty"),
            }
            for c in ranked_exact
        ]

    db_rows = await asyncio.to_thread(search_user, doctor_name, "doctor", 10)
    exact_rows = []
    for row in db_rows:
        full_name = " ".join(
            part for part in [str(row.get("first_name") or "").strip(), str(row.get("last_name") or "").strip()]
            if part
        )
        if _normalize_doctor_name(full_name) == normalized:
            exact_rows.append(row)

    if len(exact_rows) == 1:
        resolved = dict(selected_doctor)
        resolved["doctor_id"] = exact_rows[0].get("user_id")
        if not resolved.get("doctor_name"):
            resolved["doctor_name"] = " ".join(
                part
                for part in [
                    str(exact_rows[0].get("first_name") or "").strip(),
                    str(exact_rows[0].get("last_name") or "").strip(),
                ]
                if part
            )
        return resolved, "resolved", []
    if len(exact_rows) > 1:
        return selected_doctor, "ambiguous", _doctor_resolution_candidates_from_rows(exact_rows)

    if len(db_rows) >= 1:
        return selected_doctor, "ambiguous", _doctor_resolution_candidates_from_rows(db_rows)

    return selected_doctor, "not_found", []


def _build_add_facts_task(task_id: str, user_id: str, task_spec: dict[str, Any]) -> ToolTask:
    facts = task_spec.get("facts") or []
    if not facts:
        raise ValueError(f"{task_id}: add_facts requires non-empty facts")

    async def run_add(_facts=facts):
        return await asyncio.to_thread(memory_tools.add_facts, user_id, _facts)

    return ToolTask(
        task_id=task_id,
        tool_name="add_facts",
        user_id=user_id,
        is_write=True,
        runner=run_add,
    )


def _build_recall_memory_task(task_id: str, user_id: str, task_spec: dict[str, Any]) -> ToolTask:
    query = task_spec.get("query")
    k = int(task_spec.get("k", 5))
    if not query:
        raise ValueError(f"{task_id}: recall_memory requires query")

    async def run_recall(_query=query, _k=k):
        return await asyncio.to_thread(memory_tools.recall, user_id, _query, _k)

    return ToolTask(
        task_id=task_id,
        tool_name="recall_memory",
        user_id=user_id,
        is_write=False,
        runner=run_recall,
    )


def _build_memory_context_task(task_id: str, user_id: str, task_spec: dict[str, Any]) -> ToolTask:
    query = task_spec.get("query")
    k = int(task_spec.get("k", 5))
    if not query:
        raise ValueError(f"{task_id}: memory_context requires query")

    async def run_context(_query=query, _k=k):
        return await asyncio.to_thread(memory_tools.memory_context, user_id, _query, _k)

    return ToolTask(
        task_id=task_id,
        tool_name="memory_context",
        user_id=user_id,
        is_write=False,
        runner=run_context,
    )


def _build_user_fact_count_task(task_id: str, user_id: str, _: dict[str, Any]) -> ToolTask:
    async def run_count():
        return await asyncio.to_thread(memory_tools.user_fact_count, user_id)

    return ToolTask(
        task_id=task_id,
        tool_name="user_fact_count",
        user_id=user_id,
        is_write=False,
        runner=run_count,
    )


def _build_list_doctor_appointments_for_day_task(task_id: str, user_id: str, task_spec: dict[str, Any]) -> ToolTask:
    raw_day = task_spec.get("day") or task_spec.get("date")
    if not raw_day:
        raise ValueError(f"{task_id}: list_doctor_appointments_for_day requires day")
    try:
        requested_day = raw_day if isinstance(raw_day, date) else date.fromisoformat(str(raw_day))
    except ValueError as exc:
        raise ValueError(f"{task_id}: day must be an ISO date") from exc
    doctor_user_id = str(task_spec.get("doctor_user_id") or user_id)
    timezone_name = str(task_spec.get("timezone") or "UTC")

    async def run_list():
        return await asyncio.to_thread(
            list_doctor_appointments_for_day,
            doctor_user_id,
            requested_day,
            timezone_name,
        )

    return ToolTask(
        task_id=task_id,
        tool_name="list_doctor_appointments_for_day",
        user_id=user_id,
        is_write=False,
        runner=run_list,
    )


def _build_clear_user_task(task_id: str, user_id: str, _: dict[str, Any]) -> ToolTask:
    async def run_clear():
        await asyncio.to_thread(memory_tools.clear_user, user_id)
        return {"cleared": True}

    return ToolTask(
        task_id=task_id,
        tool_name="clear_user",
        user_id=user_id,
        is_write=True,
        runner=run_clear,
    )


ToolTaskBuilder = Callable[[str, str, dict[str, Any]], ToolTask]

_TOOL_TASK_BUILDERS: dict[str, ToolTaskBuilder] = {
    "add_facts": _build_add_facts_task,
    "recall_memory": _build_recall_memory_task,
    "memory_context": _build_memory_context_task,
    "user_fact_count": _build_user_fact_count_task,
    "list_doctor_appointments_for_day": _build_list_doctor_appointments_for_day_task,
    "clear_user": _build_clear_user_task,
}


def _validate_and_build_tool_task(user_id: str, task_spec: dict[str, Any], index: int) -> ToolTask:
    task_id = task_spec.get("task_id") or f"task_{index}"
    tool_name = task_spec.get("tool_name")
    builder = _TOOL_TASK_BUILDERS.get(str(tool_name))
    if builder is None:
        raise ValueError(f"{task_id}: unsupported tool_name '{tool_name}'")
    return builder(task_id, user_id, task_spec)


async def _plan_node(state: SupervisorState) -> SupervisorState:
    user_id = state["user_id"]
    task_specs = state.get("task_specs", [])
    if not task_specs:
        raise ValueError("tasks must not be empty")

    planned_tasks = [
        _validate_and_build_tool_task(user_id, spec, idx)
        for idx, spec in enumerate(task_specs, start=1)
    ]
    stages = build_parallel_stages(planned_tasks)
    return {
        "planned_tasks": planned_tasks,
        "planned_stages": [[t.task_id for t in s.tasks] for s in stages],
    }


async def _execute_node(state: SupervisorState) -> SupervisorState:
    planned_tasks = state.get("planned_tasks", [])
    stages = build_parallel_stages(planned_tasks)
    raw_results = await execute_parallel_plan(stages)
    return {"raw_results": raw_results}


def _normalize_node(state: SupervisorState) -> SupervisorState:
    raw_results = state.get("raw_results", {})
    results: dict[str, Any] = {}
    errors: list[str] = []

    for task_id, value in raw_results.items():
        if isinstance(value, Exception):
            err = {"error": str(value), "type": type(value).__name__}
            results[task_id] = err
            errors.append(f"{task_id}: {err['type']}: {err['error']}")
        else:
            results[task_id] = value

    return {"results": results, "errors": errors}


def _append_structured_error(
    state: SupervisorState,
    *,
    code: str,
    message: str,
    node: str,
) -> list[dict[str, Any]]:
    errors = list(state.get("structured_errors", []))
    errors.append({"code": code, "message": message, "node": node})
    return errors


def _extract_failure_code(payload: dict[str, Any]) -> str:
    booking_result = payload.get("booking_result")
    if isinstance(booking_result, dict):
        code = booking_result.get("code")
        if code:
            return str(code)

    structured_errors = payload.get("structured_errors")
    if isinstance(structured_errors, list):
        for item in reversed(structured_errors):
            if not isinstance(item, dict):
                continue
            code = item.get("code")
            if code:
                return str(code)
    return ""


def _is_booking_failed_validation(payload: dict[str, Any]) -> bool:
    if str(payload.get("booking_mode") or "") != "booking_failed":
        return False
    code = _extract_failure_code(payload)
    return code in _VALIDATION_BOOKING_ERROR_CODES


def _augment_booking_contract_fields(payload: dict[str, Any]) -> dict[str, Any]:
    augmented = dict(payload)
    missing_fields = augmented.get("booking_missing_fields")
    if not isinstance(missing_fields, list):
        missing_fields = []
    # Keep legacy key during migration while exposing contract-aligned name.
    augmented["booking_blocked_missing_fields"] = list(missing_fields)
    augmented["booking_failed_validation"] = _is_booking_failed_validation(augmented)
    return augmented


async def profile_user_node(state: SupervisorState) -> SupervisorState:
    started = perf_counter()
    run_id = str(state.get("trace_run_id") or "")
    patient_user_id = state.get("patient_user_id") or state.get("user_id")
    if run_id:
        emit_workflow_trace_event(
            workflow_family="specialized_doctor",
            thread_id=str(state.get("thread_id") or ""),
            run_id=run_id,
            event_type="node_started",
            node_name="profile_user_node",
            actor_user_id=str(state.get("actor_user_id") or ""),
            patient_user_id=str(patient_user_id or ""),
        )
    if not patient_user_id:
        return {
            "structured_errors": _append_structured_error(
                state,
                code="MissingPatientUserId",
                message="patient_user_id is required",
                node="profile_user_node",
            )
        }

    try:
        snapshot = await asyncio.to_thread(profile_user, patient_user_id)
        emit_workflow_trace_event(
            workflow_family="specialized_doctor",
            thread_id=str(state.get("thread_id") or ""),
            run_id=run_id,
            event_type="node_completed",
            node_name="profile_user_node",
            status="ok",
            duration_ms=int((perf_counter() - started) * 1000),
            actor_user_id=str(state.get("actor_user_id") or ""),
            patient_user_id=str(patient_user_id),
        )
        return {"patient_profile_snapshot": snapshot}
    except Exception as exc:
        return {
            "structured_errors": _append_structured_error(
                state,
                code="ProfileUserFailed",
                message=str(exc),
                node="profile_user_node",
            )
        }


async def match_doctors_node(state: SupervisorState) -> SupervisorState:
    started = perf_counter()
    run_id = str(state.get("trace_run_id") or "")
    need_text = str(state.get("need_text") or state.get("inferred_need") or "").strip()
    patient_user_id = state.get("patient_user_id") or state.get("user_id")
    max_suggestions = int(state.get("max_suggestions", 5))
    if not need_text:
        return {
            "structured_errors": _append_structured_error(
                state,
                code="MissingNeedText",
                message="need_text is required",
                node="match_doctors_node",
            )
        }
    if not patient_user_id:
        return {
            "structured_errors": _append_structured_error(
                state,
                code="MissingPatientUserId",
                message="patient_user_id is required",
                node="match_doctors_node",
            )
        }

    try:
        match_result = await asyncio.to_thread(
            search_doctors_for_need,
            need_text,
            patient_user_id,
            max_suggestions,
        )
        ranked = match_result.get("candidates", [])
        emit_telemetry_event(
            "doctor_search_initiated",
            request_path="/supervisor/doctor/route",
            endpoint_family="specialized",
            sample_key=f"{state.get('thread_id')}:{need_text}:doctor_search",
            payload={
                "thread_id": state.get("thread_id"),
                "actor_user_id": state.get("actor_user_id"),
                "patient_user_id": patient_user_id,
                "need_text": need_text,
                "inferred_specialties_count": len(match_result.get("inferred_specialties", [])),
                "llm_refinement_enabled": bool(match_result.get("llm_refinement_applied", False)),
                "candidate_count": len(ranked),
            },
        )
        top_rankings = [
            {
                "doctor_id": c.get("doctor_id"),
                "specialty_match_rank": c.get("ranking_features", {}).get("specialty_match_rank"),
                "proximity_score": c.get("ranking_features", {}).get("proximity_score"),
                "proximity_mode": c.get("ranking_features", {}).get("proximity_mode"),
                "availability_at": c.get("ranking_features", {}).get("earliest_available_at"),
                "avg_fee": c.get("ranking_features", {}).get("avg_fee"),
            }
            for c in ranked[: min(5, len(ranked))]
        ]
        emit_telemetry_event(
            "ranking_emitted",
            request_path="/supervisor/doctor/route",
            endpoint_family="specialized",
            sample_key=f"{state.get('thread_id')}:ranking_emitted",
            payload={
                "thread_id": state.get("thread_id"),
                "actor_user_id": state.get("actor_user_id"),
                "patient_user_id": patient_user_id,
                "candidate_count": len(ranked),
                "top_k": len(top_rankings),
                "top_candidates": top_rankings,
            },
        )
        if run_id:
            emit_workflow_trace_event(
                workflow_family="specialized_doctor",
                thread_id=str(state.get("thread_id") or ""),
                run_id=run_id,
                event_type="node_completed",
                node_name="match_doctors_node",
                status="ok",
                duration_ms=int((perf_counter() - started) * 1000),
                actor_user_id=str(state.get("actor_user_id") or ""),
                patient_user_id=str(patient_user_id),
                payload={"candidate_count": len(ranked)},
            )
        return {
            "inferred_need": need_text,
            "ranked_doctor_candidates": ranked,
        }
    except Exception as exc:
        return {
            "structured_errors": _append_structured_error(
                state,
                code="MatchDoctorsFailed",
                message=str(exc),
                node="match_doctors_node",
            )
        }


def suggest_cards_node(state: SupervisorState) -> SupervisorState:
    ranked = state.get("ranked_doctor_candidates", [])
    cards = [
        {
            "doctor_id": c.get("doctor_id"),
            "doctor_name": c.get("doctor_name"),
            "specialty": c.get("specialty"),
            "clinic_address": c.get("clinic_address"),
            "earliest_available_at": c.get("earliest_available_at"),
            "session_price": c.get("avg_session_price"),
            "ranking_score": c.get("ranking_features", {}).get("proximity_score", 0.0),
            "rationale": c.get("ranking_reason", "specialty+availability+proximity+price"),
        }
        for c in ranked
    ]
    run_id = str(state.get("trace_run_id") or "")
    if run_id:
        emit_workflow_trace_event(
            workflow_family="specialized_doctor",
            thread_id=str(state.get("thread_id") or ""),
            run_id=run_id,
            event_type="node_completed",
            node_name="suggest_cards_node",
            status="ok",
            actor_user_id=str(state.get("actor_user_id") or ""),
            patient_user_id=str(state.get("patient_user_id") or ""),
            payload={"suggestion_count": len(cards)},
        )
    return {
        "suggestion_cards": cards,
        "cards_emitted": True,
    }


async def profile_view_node(state: SupervisorState) -> SupervisorState:
    started = perf_counter()
    selected_doctor = state.get("selected_doctor")
    resolved_doctor, resolution_status, resolution_candidates = await _resolve_selected_doctor_from_candidates(
        selected_doctor if isinstance(selected_doctor, dict) else None,
        state.get("ranked_doctor_candidates", []),
    )
    selected_date = _coerce_date_value(state.get("selected_appointment_date"))
    selected_time = _coerce_time_value(state.get("selected_appointment_time"))

    booking_selection = BookingSelectionInput.from_workflow_selection(
        selected_doctor=resolved_doctor if isinstance(resolved_doctor, dict) else None,
        selected_appointment_date=selected_date,
        selected_appointment_time=selected_time,
        slot_id=state.get("selected_slot_id"),
        booking_timezone=str(state.get("booking_timezone", "UTC")),
        booking_reason=state.get("booking_reason"),
        policy_context=state.get("policy_context") if isinstance(state.get("policy_context"), dict) else {},
    )
    missing = booking_selection.workflow_missing_fields(
        selected_doctor=resolved_doctor if isinstance(resolved_doctor, dict) else None,
    )

    if resolution_status in {"not_found", "ambiguous"} and "selected_doctor" not in missing:
        missing.append("selected_doctor")

    booking_ready = len(missing) == 0
    blocked_reason = "ready_for_booking" if booking_ready else "missing_required_booking_fields"
    structured_errors = list(state.get("structured_errors", []))

    if resolution_status == "not_found":
        blocked_reason = "doctor_name_not_found"
        structured_errors = _append_structured_error(
            state,
            code="DoctorNameNotFound",
            message="Selected doctor name could not be resolved to a unique doctor_id",
            node="profile_view_node",
        )
    elif resolution_status == "ambiguous":
        blocked_reason = "doctor_name_ambiguous"
        structured_errors = _append_structured_error(
            state,
            code="DoctorNameAmbiguous",
            message="Selected doctor name maps to multiple possible doctors",
            node="profile_view_node",
        )

    result = {
        "selected_doctor": resolved_doctor if resolved_doctor is not None else selected_doctor,
        "doctor_resolution_status": resolution_status,
        "doctor_resolution_candidates": resolution_candidates,
        "booking_ready": booking_ready,
        "booking_missing_fields": missing,
        "booking_blocked_reason": blocked_reason,
        "booking_requirements": missing,
        "selected_appointment_date": selected_date or state.get("selected_appointment_date"),
        "selected_appointment_time": selected_time or state.get("selected_appointment_time"),
        "booking_mode": state.get("booking_mode", "suggest_only") if booking_ready else "suggest_only",
        "booking_attempted": bool(state.get("booking_attempted", False)),
        "booking_committed": bool(state.get("booking_committed", False)),
        "structured_errors": structured_errors,
    }
    run_id = str(state.get("trace_run_id") or "")
    if run_id:
        emit_workflow_trace_event(
            workflow_family="specialized_doctor",
            thread_id=str(state.get("thread_id") or ""),
            run_id=run_id,
            event_type="node_completed",
            node_name="profile_view_node",
            status="ok",
            duration_ms=int((perf_counter() - started) * 1000),
            actor_user_id=str(state.get("actor_user_id") or ""),
            patient_user_id=str(state.get("patient_user_id") or ""),
            payload={
                "booking_ready": booking_ready,
                "missing_fields": missing,
                "doctor_resolution_status": resolution_status,
            },
        )
        emit_workflow_trace_event(
            workflow_family="specialized_doctor",
            thread_id=str(state.get("thread_id") or ""),
            run_id=run_id,
            event_type="route_selected",
            node_name="profile_view_node",
            status="ok",
            actor_user_id=str(state.get("actor_user_id") or ""),
            patient_user_id=str(state.get("patient_user_id") or ""),
            payload={"next_route": _route_booking_path(result)},
        )
    return result


async def conditional_book_node(state: SupervisorState) -> SupervisorState:
    started = perf_counter()
    run_id = str(state.get("trace_run_id") or "")
    if bool(state.get("booking_committed", False)):
        return {
            "booking_attempted": True,
            "booking_committed": True,
            "booking_mode": state.get("booking_mode", "booked"),
            "booking_result": state.get("booking_result", {}),
            "approval_outcome": state.get("approval_outcome"),
            "structured_errors": list(state.get("structured_errors", [])),
        }

    selected_doctor = state.get("selected_doctor") or {}
    doctor_id = str(selected_doctor.get("doctor_id") or "").strip()
    doctor_name = str(selected_doctor.get("doctor_name") or "").strip()
    slot_id = str(state.get("selected_slot_id") or "").strip() or None
    appointment_date = _coerce_date_value(state.get("selected_appointment_date"))
    appointment_time = _coerce_time_value(state.get("selected_appointment_time"))
    booking_timezone = str(state.get("booking_timezone") or "UTC")
    booking_reason = state.get("booking_reason")
    policy_context = state.get("policy_context") if isinstance(state.get("policy_context"), dict) else {}
    patient_user_id = str(state.get("patient_user_id") or state.get("user_id") or "").strip()
    actor_user_id = str(state.get("actor_user_id") or state.get("user_id") or "").strip()
    thread_id = str(state.get("thread_id") or "").strip()
    requires_datetime = not bool(slot_id)

    if not doctor_id or (requires_datetime and (not appointment_date or not appointment_time)):
        missing: list[str] = []
        if not doctor_id:
            missing.append("selected_doctor")
        if requires_datetime and not appointment_date:
            missing.append("selected_appointment_date")
        if requires_datetime and not appointment_time:
            missing.append("selected_appointment_time")

        blocked_reason = "missing_required_booking_fields"
        if not doctor_id and doctor_name:
            resolution_status = str(state.get("doctor_resolution_status") or "")
            if resolution_status == "not_found":
                blocked_reason = "doctor_name_not_found"
            elif resolution_status == "ambiguous":
                blocked_reason = "doctor_name_ambiguous"

        result = {
            "booking_ready": False,
            "booking_mode": "suggest_only",
            "booking_missing_fields": missing,
            "booking_requirements": missing,
            "booking_blocked_reason": blocked_reason,
            "booking_attempted": False,
            "booking_committed": False,
            "booking_result": {},
            "approval_outcome": None,
            "structured_errors": list(state.get("structured_errors", [])),
        }
        if run_id:
            emit_workflow_trace_event(
                workflow_family="specialized_doctor",
                thread_id=thread_id,
                run_id=run_id,
                event_type="node_completed",
                node_name="conditional_book_node",
                status="blocked",
                duration_ms=int((perf_counter() - started) * 1000),
                actor_user_id=actor_user_id,
                patient_user_id=patient_user_id,
                payload={"missing_fields": missing, "booking_blocked_reason": blocked_reason},
            )
        return result

    if not thread_id:
        result = {
            "booking_ready": True,
            "booking_mode": "booking_failed",
            "booking_attempted": False,
            "booking_committed": False,
            "booking_result": {
                "status": "failed",
                "code": "MissingThreadId",
                "message": "thread_id is required",
            },
            "approval_outcome": None,
            "structured_errors": _append_structured_error(
                state,
                code="MissingThreadId",
                message="thread_id is required",
                node="conditional_book_node",
            ),
        }
        if run_id:
            emit_workflow_trace_event(
                workflow_family="specialized_doctor",
                thread_id=thread_id,
                run_id=run_id,
                event_type="node_completed",
                node_name="conditional_book_node",
                status="error",
                duration_ms=int((perf_counter() - started) * 1000),
                actor_user_id=actor_user_id,
                patient_user_id=patient_user_id,
                payload={"denial_reason_code": "MissingThreadId"},
            )
        return result

    try:
        emit_telemetry_event(
            "booking_attempted",
            request_path="/supervisor/doctor/route",
            endpoint_family="specialized",
            sample_key=f"{thread_id}:booking_attempted",
            payload={
                "thread_id": thread_id,
                "actor_user_id": actor_user_id,
                "patient_user_id": patient_user_id,
                "doctor_id": doctor_id,
                "resolution_mode": "slot_id" if slot_id else "datetime_fallback",
                "booking_timezone": booking_timezone,
            },
        )
        result = await asyncio.to_thread(
            book_appointment,
            thread_id=thread_id,
            actor_user_id=actor_user_id,
            patient_user_id=patient_user_id,
            doctor_id=doctor_id,
            slot_id=slot_id,
            appointment_date=appointment_date,
            appointment_time=appointment_time,
            booking_timezone=booking_timezone,
            booking_reason=booking_reason,
            policy_context=policy_context,
            doctor_name=selected_doctor.get("doctor_name"),
        )
        result = {
            "booking_ready": True,
            "booking_mode": "booked",
            "booking_attempted": True,
            "booking_committed": True,
            "booking_result": result,
            "approval_outcome": None,
            "structured_errors": list(state.get("structured_errors", [])),
        }
        if run_id:
            emit_workflow_trace_event(
                workflow_family="specialized_doctor",
                thread_id=thread_id,
                run_id=run_id,
                event_type="node_completed",
                node_name="conditional_book_node",
                status="ok",
                duration_ms=int((perf_counter() - started) * 1000),
                actor_user_id=actor_user_id,
                patient_user_id=patient_user_id,
                payload={"booking_committed": True},
            )
        return result
    except BookingDomainError as exc:
        if exc.code == "ApprovalRequired":
            detail = dict(exc.detail or {})
            approval_id = str(detail.get("approval_id") or "")
            approval_outcome = {
                "approval_id": approval_id,
                "status": "pending",
                "requested_at": detail.get("requested_at"),
                "expires_at": detail.get("expires_at"),
                "required_by_policy": True,
                "review_context_summary": detail.get("review_context_summary") if isinstance(detail.get("review_context_summary"), dict) else {},
            }
            emit_telemetry_event(
                "approval_requested",
                request_path="/supervisor/doctor/route",
                endpoint_family="specialized",
                sample_key=f"{thread_id}:{approval_id}:approval_requested",
                payload={
                    "thread_id": thread_id,
                    "actor_user_id": actor_user_id,
                    "patient_user_id": patient_user_id,
                    "approval_id": approval_id,
                    "policy_decision": detail.get("policy_decision"),
                },
            )
            if run_id:
                emit_workflow_trace_event(
                    workflow_family="specialized_doctor",
                    thread_id=thread_id,
                    run_id=run_id,
                    event_type="approval_requested",
                    node_name="conditional_book_node",
                    status="pending",
                    duration_ms=int((perf_counter() - started) * 1000),
                    actor_user_id=actor_user_id,
                    patient_user_id=patient_user_id,
                    payload={
                        "approval_id": approval_id,
                        "approval_status": "pending",
                        "policy_decision": detail.get("policy_decision"),
                    },
                )
            return {
                "booking_ready": True,
                "booking_mode": "booking_pending_approval",
                "booking_attempted": True,
                "booking_committed": False,
                "booking_result": {},
                "approval_outcome": approval_outcome,
                "structured_errors": list(state.get("structured_errors", [])),
            }
        emit_telemetry_event(
            "booking_denied",
            request_path="/supervisor/doctor/route",
            endpoint_family="specialized",
            sample_key=f"{thread_id}:{exc.code}:booking_denied",
            payload={
                "thread_id": thread_id,
                "actor_user_id": actor_user_id,
                "patient_user_id": patient_user_id,
                "doctor_id": doctor_id,
                "denial_reason_code": exc.code,
                "denial_category": _booking_denial_category(exc.code),
            },
        )
        result = {
            "booking_ready": True,
            "booking_mode": "booking_failed",
            "booking_attempted": True,
            "booking_committed": False,
            "booking_result": {
                "status": "failed",
                "code": exc.code,
                "message": exc.message,
            },
            "approval_outcome": None,
            "structured_errors": _append_structured_error(
                state,
                code=exc.code,
                message=exc.message,
                node="conditional_book_node",
            ),
        }
        if run_id:
            emit_workflow_trace_event(
                workflow_family="specialized_doctor",
                thread_id=thread_id,
                run_id=run_id,
                event_type="node_completed",
                node_name="conditional_book_node",
                status="denied",
                duration_ms=int((perf_counter() - started) * 1000),
                actor_user_id=actor_user_id,
                patient_user_id=patient_user_id,
                payload={"denial_reason_code": exc.code, "denial_category": _booking_denial_category(exc.code)},
            )
        return result
    except Exception as exc:
        emit_telemetry_event(
            "workflow_failed",
            request_path="/supervisor/doctor/route",
            endpoint_family="specialized",
            sample_key=f"{thread_id}:{type(exc).__name__}:workflow_failed",
            payload={
                "thread_id": thread_id,
                "actor_user_id": actor_user_id,
                "patient_user_id": patient_user_id,
                "failure_stage": "conditional_book_node",
                "error_class": type(exc).__name__,
                "error_code_or_type": type(exc).__name__,
            },
        )
        result = {
            "booking_ready": True,
            "booking_mode": "booking_failed",
            "booking_attempted": True,
            "booking_committed": False,
            "booking_result": {
                "status": "failed",
                "code": "BookingUnhandledError",
                "message": str(exc),
            },
            "approval_outcome": None,
            "structured_errors": _append_structured_error(
                state,
                code="BookingUnhandledError",
                message=str(exc),
                node="conditional_book_node",
            ),
        }
        if run_id:
            emit_workflow_trace_event(
                workflow_family="specialized_doctor",
                thread_id=thread_id,
                run_id=run_id,
                event_type="node_completed",
                node_name="conditional_book_node",
                status="error",
                duration_ms=int((perf_counter() - started) * 1000),
                actor_user_id=actor_user_id,
                patient_user_id=patient_user_id,
                payload={"denial_reason_code": "BookingUnhandledError"},
            )
        return result


def _route_booking_path(state: SupervisorState) -> str:
    return "conditional_book_node" if bool(state.get("booking_ready")) else "suggest_only_end"


def _build_generic_graph():
    graph = StateGraph(SupervisorState)
    graph.add_node("plan", _plan_node)
    graph.add_node("execute", _execute_node)
    graph.add_node("normalize", _normalize_node)
    graph.add_edge(START, "plan")
    graph.add_edge("plan", "execute")
    graph.add_edge("execute", "normalize")
    graph.add_edge("normalize", END)
    return graph.compile()


def _build_doctor_matching_graph():
    graph = StateGraph(SupervisorState)
    graph.add_node("profile_user_node", profile_user_node)
    graph.add_node("match_doctors_node", match_doctors_node)
    graph.add_node("suggest_cards_node", suggest_cards_node)
    graph.add_node("profile_view_node", profile_view_node)
    graph.add_node("conditional_book_node", conditional_book_node)

    graph.add_edge(START, "profile_user_node")
    graph.add_edge("profile_user_node", "match_doctors_node")
    graph.add_edge("match_doctors_node", "suggest_cards_node")
    graph.add_edge("suggest_cards_node", "profile_view_node")
    graph.add_conditional_edges(
        "profile_view_node",
        _route_booking_path,
        {
            "conditional_book_node": "conditional_book_node",
            "suggest_only_end": "synthesize_node",
        },
    )
    graph.add_node("synthesize_node", synthesize_node)
    graph.add_edge("conditional_book_node", "synthesize_node")
    graph.add_edge("synthesize_node", END)
    return graph.compile(checkpointer=get_checkpoint_saver())


_WORKFLOW = _build_generic_graph()
_DOCTOR_WORKFLOW = _build_doctor_matching_graph()


def build_graph_config(thread_id: str) -> dict[str, Any]:
    normalized_thread_id = str(thread_id or "").strip()
    if not normalized_thread_id:
        raise ValueError("thread_id is required")
    return {"configurable": {"thread_id": normalized_thread_id}}


def _merge_state_for_resume(
    incoming_state: SupervisorState,
    checkpoint_state: SupervisorState | None,
) -> SupervisorState:
    if not checkpoint_state:
        merged = dict(incoming_state)
        merged["resume_from_checkpoint"] = False
        merged["checkpoint_version"] = CHECKPOINT_VERSION
        return merged

    merged: SupervisorState = dict(checkpoint_state)
    committed = bool(checkpoint_state.get("booking_committed", False))

    # Identity and scope fields follow the latest request values.
    for key in ("user_id", "actor_user_id", "patient_user_id", "thread_id"):
        if key in incoming_state and incoming_state.get(key):
            merged[key] = incoming_state[key]

    # Request-only controls can update only before commit.
    if not committed:
        for key in _NON_DESTRUCTIVE_INPUT_FIELDS:
            if key in incoming_state:
                merged[key] = incoming_state[key]

    # Preserve committed booking outcomes regardless of request updates.
    for key in _BOOKING_COMMITTED_FIELDS:
        if key in checkpoint_state:
            merged[key] = checkpoint_state[key]

    merged["resume_from_checkpoint"] = True
    merged["checkpoint_version"] = CHECKPOINT_VERSION
    return merged


async def load_thread_state(thread_id: str) -> SupervisorState | None:
    config = build_graph_config(thread_id)
    snapshot = await _DOCTOR_WORKFLOW.aget_state(config)
    values = dict(snapshot.values or {})
    return values or None


async def invoke_with_checkpoint(state: SupervisorState, thread_id: str) -> SupervisorState:
    checkpoint_state = await load_thread_state(thread_id)
    merged_state = _merge_state_for_resume(state, checkpoint_state)
    config = build_graph_config(thread_id)
    out = await _DOCTOR_WORKFLOW.ainvoke(merged_state, config=config)
    return dict(out)


def _doctor_workflow_response(out: SupervisorState) -> dict[str, Any]:
    response = {
        "thread_id": out.get("thread_id"),
        "patient_profile_snapshot": out.get("patient_profile_snapshot", {}),
        "inferred_need": out.get("inferred_need", ""),
        "suggestion_cards": out.get("suggestion_cards", []),
        "booking_ready": out.get("booking_ready", False),
        "booking_missing_fields": out.get("booking_missing_fields", []),
        "booking_blocked_reason": out.get("booking_blocked_reason", ""),
        "booking_requirements": out.get("booking_requirements", []),
        "cards_emitted": bool(out.get("cards_emitted", False)),
        "booking_attempted": bool(out.get("booking_attempted", False)),
        "booking_committed": bool(out.get("booking_committed", False)),
        "resume_from_checkpoint": bool(out.get("resume_from_checkpoint", False)),
        "checkpoint_version": out.get("checkpoint_version", CHECKPOINT_VERSION),
        "booking_mode": out.get("booking_mode", "suggest_only"),
        "booking_result": out.get("booking_result", {}),
        "approval_outcome": out.get("approval_outcome"),
        "structured_errors": out.get("structured_errors", []),
        "doctor_resolution_status": out.get("doctor_resolution_status", ""),
        "doctor_resolution_candidates": out.get("doctor_resolution_candidates", []),
        # Phase 5: synthesis
        "ai_message": out.get("ai_message", ""),
        "ai_message_type": out.get("ai_message_type", ""),
        "unified_response": out.get("unified_response"),
    }
    return _augment_booking_contract_fields(response)


async def execute_supervisor_workflow(user_id: str, task_specs: list[dict[str, Any]]) -> dict[str, Any]:
    state: SupervisorState = {"user_id": user_id, "task_specs": task_specs}
    out = await _WORKFLOW.ainvoke(state)
    return {
        "user_id": user_id,
        "planned_stages": out.get("planned_stages", []),
        "results": out.get("results", {}),
        "errors": out.get("errors", []),
    }


async def execute_doctor_match_workflow(state: SupervisorState) -> dict[str, Any]:
    run_id = str(state.get("trace_run_id") or new_run_id())
    state["trace_run_id"] = run_id
    thread_id = str(state.get("thread_id") or "").strip()
    emit_workflow_trace_event(
        workflow_family="specialized_doctor",
        thread_id=thread_id,
        run_id=run_id,
        event_type="run_started",
        actor_user_id=str(state.get("actor_user_id") or ""),
        patient_user_id=str(state.get("patient_user_id") or ""),
        status="started",
    )
    emit_telemetry_event(
        "workflow_started",
        request_path="/supervisor/doctor/route",
        endpoint_family="specialized",
        sample_key=f"{thread_id}:workflow_started",
        payload={
            "thread_id": thread_id,
            "actor_user_id": state.get("actor_user_id"),
            "patient_user_id": state.get("patient_user_id"),
            "max_suggestions": state.get("max_suggestions", 5),
        },
    )
    out: SupervisorState = {}
    if not thread_id:
        out = {
            "thread_id": thread_id,
            "booking_mode": "booking_failed",
            "booking_attempted": False,
            "booking_committed": False,
            "booking_result": {
                "status": "failed",
                "code": "MissingThreadId",
                "message": "thread_id is required",
            },
            "structured_errors": _append_structured_error(
                state,
                code="MissingThreadId",
                message="thread_id is required",
                node="execute_doctor_matching_workflow",
            ),
        }
    else:
        try:
            async with lock_manager.acquire_thread(thread_id, timeout=THREAD_LOCK_TIMEOUT_SECONDS):
                out = await invoke_with_checkpoint(state, thread_id)
        except TimeoutError as exc:
            out = {
                "thread_id": thread_id,
                "booking_mode": "booking_failed",
                "booking_attempted": False,
                "booking_committed": False,
                "booking_result": {
                    "status": "failed",
                    "code": "ThreadLockTimeout",
                    "message": str(exc),
                },
                "structured_errors": _append_structured_error(
                    state,
                    code="ThreadLockTimeout",
                    message=str(exc),
                    node="execute_doctor_match_workflow",
                ),
            }
        except Exception as exc:
            log.exception("Doctor matching workflow failed for thread %s", thread_id)
            emit_telemetry_event(
                "workflow_failed",
                request_path="/supervisor/doctor/route",
                endpoint_family="specialized",
                sample_key=f"{thread_id}:workflow_failed:{type(exc).__name__}",
                payload={
                    "thread_id": thread_id,
                    "actor_user_id": state.get("actor_user_id"),
                    "patient_user_id": state.get("patient_user_id"),
                    "failure_stage": "execute_doctor_match_workflow",
                    "error_class": type(exc).__name__,
                    "error_code_or_type": type(exc).__name__,
                },
            )
            out = {
                "thread_id": thread_id,
                "booking_mode": "booking_failed",
                "booking_attempted": False,
                "booking_committed": False,
                "booking_result": {
                    "status": "failed",
                    "code": "WorkflowExecutionFailed",
                    "message": str(exc),
                },
                "structured_errors": _append_structured_error(
                    state,
                    code="WorkflowExecutionFailed",
                    message=str(exc),
                    node="execute_doctor_match_workflow",
                ),
            }
    response = _doctor_workflow_response(out)
    if response.get("booking_mode") == "booked":
        emit_telemetry_event(
            "booking_committed",
            request_path="/supervisor/doctor/route",
            endpoint_family="specialized",
            sample_key=f"{thread_id}:booking_committed",
            payload={
                "thread_id": thread_id,
                "actor_user_id": state.get("actor_user_id"),
                "patient_user_id": state.get("patient_user_id"),
                "resolution_mode": response.get("booking_result", {}).get("resolution_mode"),
                "idempotent_replay": bool(response.get("booking_result", {}).get("idempotent_replay", False)),
                "appointment_id_present": bool(response.get("booking_result", {}).get("appointment_id")),
            },
        )
    elif response.get("booking_mode") == "booking_pending_approval":
        approval_id = str((response.get("approval_outcome") or {}).get("approval_id") or "")
        emit_telemetry_event(
            "approval_pending",
            request_path="/supervisor/doctor/route",
            endpoint_family="specialized",
            sample_key=f"{thread_id}:{approval_id}:approval_pending",
            payload={
                "thread_id": thread_id,
                "actor_user_id": state.get("actor_user_id"),
                "patient_user_id": state.get("patient_user_id"),
                "approval_id": approval_id,
            },
        )
    elif response.get("booking_mode") in {"booking_failed", "suggest_only"}:
        denial_code = str(response.get("booking_result", {}).get("code") or response.get("booking_blocked_reason") or "unknown")
        emit_telemetry_event(
            "booking_denied",
            request_path="/supervisor/doctor/route",
            endpoint_family="specialized",
            sample_key=f"{thread_id}:{denial_code}:booking_denied_summary",
            payload={
                "thread_id": thread_id,
                "actor_user_id": state.get("actor_user_id"),
                "patient_user_id": state.get("patient_user_id"),
                "denial_reason_code": denial_code,
                "denial_category": _booking_denial_category(denial_code),
            },
        )

    emit_telemetry_event(
        "workflow_completed",
        request_path="/supervisor/doctor/route",
        endpoint_family="specialized",
        sample_key=f"{thread_id}:workflow_completed",
        payload={
            "thread_id": thread_id,
            "actor_user_id": state.get("actor_user_id"),
            "patient_user_id": state.get("patient_user_id"),
            "booking_mode": response.get("booking_mode"),
            "booking_committed": bool(response.get("booking_committed", False)),
            "booking_blocked_reason": response.get("booking_blocked_reason"),
        },
    )
    emit_workflow_trace_event(
        workflow_family="specialized_doctor",
        thread_id=thread_id,
        run_id=run_id,
        event_type="run_completed",
        actor_user_id=str(state.get("actor_user_id") or ""),
        patient_user_id=str(state.get("patient_user_id") or ""),
        status="ok" if response.get("booking_mode") in {"suggest_only", "booked", "booking_pending_approval"} else "error",
        payload={
            "booking_mode": response.get("booking_mode"),
            "booking_committed": bool(response.get("booking_committed", False)),
            "booking_ready": bool(response.get("booking_ready", False)),
            "approval_outcome": response.get("approval_outcome"),
            "doctor_resolution_status": response.get("doctor_resolution_status"),
            "missing_fields": response.get("booking_missing_fields", []),
            "booking_blocked_reason": response.get("booking_blocked_reason"),
        },
    )
    return response


async def execute_doctor_matching_workflow(state: SupervisorState) -> dict[str, Any]:
    """Backward-compatible alias for existing call sites."""
    return await execute_doctor_match_workflow(state)


async def execute_doctor_match_workflow_legacy(state: SupervisorState) -> dict[str, Any]:
    """Alternate non-checkpoint doctor workflow execution for controlled fallback.

    This path intentionally avoids checkpoint resume and thread lock orchestration.
    """
    thread_id = str(state.get("thread_id") or "").strip()
    if not thread_id:
        return _doctor_workflow_response(
            {
                "thread_id": "",
                "booking_mode": "booking_failed",
                "booking_attempted": False,
                "booking_committed": False,
                "booking_result": {
                    "status": "failed",
                    "code": "MissingThreadId",
                    "message": "thread_id is required",
                },
                "structured_errors": _append_structured_error(
                    state,
                    code="MissingThreadId",
                    message="thread_id is required",
                    node="execute_doctor_match_workflow_legacy",
                ),
            }
        )

    try:
        current: SupervisorState = dict(state)
        current.update(await profile_user_node(current))
        current.update(await match_doctors_node(current))
        current.update(suggest_cards_node(current))
        current.update(await profile_view_node(current))

        if bool(current.get("booking_ready")):
            current.update(await conditional_book_node(current))
        else:
            current.setdefault("booking_mode", "suggest_only")
            current.setdefault("booking_attempted", False)
            current.setdefault("booking_committed", False)
            current.setdefault("booking_result", {})

        current["resume_from_checkpoint"] = False
        current["checkpoint_version"] = CHECKPOINT_VERSION
        return _doctor_workflow_response(current)
    except Exception as exc:
        log.exception("Legacy doctor workflow fallback failed for thread %s", thread_id)
        return _doctor_workflow_response(
            {
                "thread_id": thread_id,
                "booking_mode": "booking_failed",
                "booking_attempted": False,
                "booking_committed": False,
                "booking_result": {
                    "status": "failed",
                    "code": "WorkflowExecutionFailed",
                    "message": str(exc),
                },
                "structured_errors": _append_structured_error(
                    state,
                    code="WorkflowExecutionFailed",
                    message=str(exc),
                    node="execute_doctor_match_workflow_legacy",
                ),
                "resume_from_checkpoint": False,
                "checkpoint_version": CHECKPOINT_VERSION,
            }
        )


async def stream_doctor_match_workflow(state: SupervisorState) -> AsyncIterator[dict[str, Any]]:
    """Streaming specialized workflow while preserving existing SSE event envelope."""
    thread_id = str(state.get("thread_id") or "").strip()
    run_id = str(state.get("trace_run_id") or new_run_id())
    state["trace_run_id"] = run_id
    stream_owner = str(state.get("actor_user_id") or state.get("user_id") or thread_id).strip()

    if not thread_id:
        yield {
            "type": "error",
            "message": "thread_id is required",
        }
        return

    cancel_token = stream_manager.create_stream_token(stream_owner)
    stage_index = {name: idx for idx, name in enumerate(_DOCTOR_GRAPH_NODE_ORDER, start=1)}

    try:
        emit_workflow_trace_event(
            workflow_family="specialized_doctor",
            thread_id=thread_id,
            run_id=run_id,
            event_type="run_started",
            actor_user_id=str(state.get("actor_user_id") or ""),
            patient_user_id=str(state.get("patient_user_id") or ""),
            status="started",
            payload={"streaming": True},
        )
        if cancel_token.is_set():
            emit_workflow_trace_event(
                workflow_family="specialized_doctor",
                thread_id=thread_id,
                run_id=run_id,
                event_type="run_cancelled",
                actor_user_id=str(state.get("actor_user_id") or ""),
                patient_user_id=str(state.get("patient_user_id") or ""),
                status="cancelled",
            )
            yield {"type": "cancelled"}
            return

        yield {
            "type": "plan",
            "stages": [[name] for name in _DOCTOR_GRAPH_NODE_ORDER],
            "total_stages": len(_DOCTOR_GRAPH_NODE_ORDER),
            "total_tasks": len(_DOCTOR_GRAPH_NODE_ORDER),
        }

        async with lock_manager.acquire_thread(thread_id, timeout=THREAD_LOCK_TIMEOUT_SECONDS):
            checkpoint_state = await load_thread_state(thread_id)
            merged_state = _merge_state_for_resume(state, checkpoint_state)
            config = build_graph_config(thread_id)

            async for chunk in _DOCTOR_WORKFLOW.astream(merged_state, config=config):
                if cancel_token.is_set():
                    emit_workflow_trace_event(
                        workflow_family="specialized_doctor",
                        thread_id=thread_id,
                        run_id=run_id,
                        event_type="run_cancelled",
                        actor_user_id=str(state.get("actor_user_id") or ""),
                        patient_user_id=str(state.get("patient_user_id") or ""),
                        status="cancelled",
                    )
                    yield {"type": "cancelled"}
                    return

                for node_name, node_result in chunk.items():
                    idx = stage_index.get(node_name)
                    if idx is None:
                        continue
                    projected_result = (
                        _augment_booking_contract_fields(node_result)
                        if isinstance(node_result, dict)
                        else node_result
                    )
                    yield {
                        "type": "stage_start",
                        "stage_index": idx,
                        "total_stages": len(_DOCTOR_GRAPH_NODE_ORDER),
                        "task_ids": [node_name],
                    }
                    yield {
                        "type": "stage_complete",
                        "stage_index": idx,
                        "total_stages": len(_DOCTOR_GRAPH_NODE_ORDER),
                        "results": {node_name: projected_result},
                    }
                    emit_telemetry_event(
                        "stage_completed",
                        request_path="/supervisor/doctor/stream",
                        endpoint_family="specialized",
                        sample_key=f"{thread_id}:{node_name}:stage_completed",
                        payload={
                            "thread_id": thread_id,
                            "actor_user_id": state.get("actor_user_id"),
                            "patient_user_id": state.get("patient_user_id"),
                            "stage_name": node_name,
                            "stage_index": idx,
                        },
                    )

            final_state = await load_thread_state(thread_id)
            response = _doctor_workflow_response(final_state or merged_state)
            emit_workflow_trace_event(
                workflow_family="specialized_doctor",
                thread_id=thread_id,
                run_id=run_id,
                event_type="run_completed",
                actor_user_id=str(state.get("actor_user_id") or ""),
                patient_user_id=str(state.get("patient_user_id") or ""),
                status="ok",
                payload={
                    "streaming": True,
                    "booking_mode": response.get("booking_mode"),
                    "booking_committed": bool(response.get("booking_committed", False)),
                },
            )
            yield {
                "type": "complete",
                "results": response,
                "errors": response.get("structured_errors", []),
                "stages": [[name] for name in _DOCTOR_GRAPH_NODE_ORDER],
            }
    except TimeoutError as exc:
        emit_workflow_trace_event(
            workflow_family="specialized_doctor",
            thread_id=thread_id,
            run_id=run_id,
            event_type="run_failed",
            actor_user_id=str(state.get("actor_user_id") or ""),
            patient_user_id=str(state.get("patient_user_id") or ""),
            status="error",
            payload={"error_code": "ThreadLockTimeout"},
        )
        yield {
            "type": "error",
            "message": str(exc),
        }
    except Exception as exc:
        emit_workflow_trace_event(
            workflow_family="specialized_doctor",
            thread_id=thread_id,
            run_id=run_id,
            event_type="run_failed",
            actor_user_id=str(state.get("actor_user_id") or ""),
            patient_user_id=str(state.get("patient_user_id") or ""),
            status="error",
            payload={"error_code": type(exc).__name__},
        )
        log.error("Streaming doctor workflow failed for thread %s: %s", thread_id, exc)
        yield {
            "type": "error",
            "message": str(exc),
        }
    finally:
        stream_manager.remove_stream_token(stream_owner)


async def stream_supervisor_workflow(
    user_id: str,
    task_specs: list[dict[str, Any]],
) -> AsyncIterator[dict[str, Any]]:
    """Streaming version of supervisor workflow with cancellation support.
    
    Yields:
        - {"type": "plan", "stages": [...]} after planning
        - {"type": "stage_start", "stage_index": N, "task_ids": [...]} before each stage
        - {"type": "stage_complete", "stage_index": N, "results": {...}} after each stage
        - {"type": "complete", "results": {...}, "errors": [...]} at the end
        - {"type": "cancelled"} if stream was cancelled
        - {"type": "error", "message": "..."} on error
    """
    cancel_token = stream_manager.create_stream_token(user_id)
    
    try:
        # Validate and build tasks
        if cancel_token.is_set():
            yield {"type": "cancelled"}
            return
        
        planned_tasks = [
            _validate_and_build_tool_task(user_id, spec, idx)
            for idx, spec in enumerate(task_specs, start=1)
        ]
        
        # Plan stages
        if cancel_token.is_set():
            yield {"type": "cancelled"}
            return
        
        stages = build_parallel_stages(planned_tasks)
        stage_ids = [[t.task_id for t in s.tasks] for s in stages]
        
        yield {
            "type": "plan",
            "stages": stage_ids,
            "total_stages": len(stages),
            "total_tasks": len(planned_tasks),
        }
        
        # Execute stages with streaming
        all_results: dict[str, Any] = {}
        
        for stage_index, stage in enumerate(stages, start=1):
            if cancel_token.is_set():
                yield {"type": "cancelled"}
                return
            
            task_ids = [t.task_id for t in stage.tasks]
            yield {
                "type": "stage_start",
                "stage_index": stage_index,
                "total_stages": len(stages),
                "task_ids": task_ids,
            }
            
            # Execute stage (parallel tasks)
            stage_results = {}
            try:
                # Run all tasks in stage concurrently
                task_results = await asyncio.gather(
                    *[task.runner() for task in stage.tasks],
                    return_exceptions=True,
                )
                
                for task, result in zip(stage.tasks, task_results):
                    if cancel_token.is_set():
                        yield {"type": "cancelled"}
                        return
                    
                    stage_results[task.task_id] = result
                    all_results[task.task_id] = result
                
            except Exception as e:
                log.error(f"Stage {stage_index} failed: {e}")
                stage_results["_stage_error"] = str(e)
            
            yield {
                "type": "stage_complete",
                "stage_index": stage_index,
                "total_stages": len(stages),
                "results": stage_results,
            }
        
        # Normalize results
        if cancel_token.is_set():
            yield {"type": "cancelled"}
            return
        
        normalized_results: dict[str, Any] = {}
        errors: list[str] = []
        
        for task_id, value in all_results.items():
            if isinstance(value, Exception):
                err = {"error": str(value), "type": type(value).__name__}
                normalized_results[task_id] = err
                errors.append(f"{task_id}: {err['type']}: {err['error']}")
            else:
                normalized_results[task_id] = value
        
        yield {
            "type": "complete",
            "results": normalized_results,
            "errors": errors,
            "stages": stage_ids,
        }
        
    except Exception as e:
        log.error(f"Streaming workflow failed for user {user_id}: {e}")
        yield {"type": "error", "message": str(e)}
    
    finally:
        stream_manager.remove_stream_token(user_id)


__all__ = [
    "SupervisorState",
    "build_graph_config",
    "execute_doctor_match_workflow",
    "execute_doctor_match_workflow_legacy",
    "execute_doctor_matching_workflow",
    "execute_supervisor_workflow",
    "invoke_with_checkpoint",
    "load_thread_state",
    "stream_doctor_match_workflow",
    "stream_supervisor_workflow",
]
