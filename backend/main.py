import os
import json
import hashlib
import logging
from datetime import date, time
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field
from pydantic import ValidationError
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from dotenv import load_dotenv

# Load environment variables from repo root so local run works from any cwd.
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(BACKEND_DIR)
load_dotenv(os.path.join(REPO_ROOT, ".env"))

# Import backend modules from organized packages.
# Run with: uvicorn backend.main:app --reload
from .memory import memory_tools
from .orchestration.supervisor_workflow import (
    execute_doctor_match_workflow,
    execute_doctor_match_workflow_legacy,
    execute_supervisor_workflow,
    stream_doctor_match_workflow,
    stream_supervisor_workflow,
)
from .app.schemas.doctor_matching_agent import DoctorMatchAgentRequest, DoctorMatchAgentResponse
from .app.schemas.unified_agent_response import UnifiedAgentRequest, UnifiedAgentResponse
from .orchestration.synthesis import synthesize_response, stream_synthesize_response
from .tools.medication_tools import medication_pipeline
from .middleware import stream_manager, approval_manager
from .scripts.db_apply_migrations import apply_phase_migrations, verify_required_indexes
from .telemetry import emit_telemetry_event
from .tools.doctor_matching_tools import BookingDomainError, book_appointment
from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from .telemetry.workflow_trace import (
    emit_workflow_trace_event,
    encode_trace_cursor,
    list_workflow_trace_events,
    serialize_trace_event,
)

# Set up logging
logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)


DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "1234567890")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "FYP")

DATABASE_URL = os.getenv("DATABASE_URL") or f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL)

# Memory snapshot path (relative paths are anchored to backend directory).
snapshot_path_env = os.getenv("MEMORY_SNAPSHOT_PATH", "data/memory_snapshot.json")
if os.path.isabs(snapshot_path_env):
    SNAPSHOT_PATH = snapshot_path_env
else:
    SNAPSHOT_PATH = os.path.join(BACKEND_DIR, snapshot_path_env)

# Ensure snapshot directory exists before memory load/save.
os.makedirs(os.path.dirname(SNAPSHOT_PATH), exist_ok=True)


def _verify_database_connectivity() -> None:
    """Fail fast on startup if DB config is wrong or database is unreachable."""
    health = _database_health_snapshot()
    if health["ok"]:
        log.info("Database connectivity check passed (database=%s)", health.get("database"))
        return

    log.error("Database connectivity check failed: %s", health.get("error"))
    log.error(
        "Verify DB_HOST/DB_PORT/DB_NAME (for host Docker Postgres often DB_PORT=5433)."
    )
    raise RuntimeError(
        "Database is not reachable or database does not exist. "
        "Check DATABASE_URL or DB_* environment variables."
    )


def _database_health_snapshot() -> dict:
    """Return current DB health for startup checks and health endpoints."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            current_db = conn.execute(text("SELECT current_database()")).scalar()
        return {
            "ok": True,
            "database": current_db,
            "host": DB_HOST,
            "port": DB_PORT,
            "db_name": DB_NAME,
        }
    except Exception as exc:
        return {
            "ok": False,
            "error": str(exc),
            "host": DB_HOST,
            "port": DB_PORT,
            "db_name": DB_NAME,
        }


def _env_flag(name: str, default: bool) -> bool:
    """Parse common boolean env flag formats."""
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def _env_int(name: str, default: int) -> int:
    raw = os.getenv(name)
    if raw is None:
        return default
    try:
        return int(raw)
    except ValueError:
        return default


def _rollout_mode() -> str:
    raw = os.getenv("SPECIALIZED_DOCTOR_ROLLOUT_MODE", "shadow").strip().lower()
    if raw not in {"off", "shadow", "canary", "on"}:
        return "shadow"
    return raw


def _rollout_canary_percent() -> int:
    return max(0, min(100, _env_int("SPECIALIZED_DOCTOR_CANARY_PERCENT", 5)))


def _stable_bucket_percent(actor_user_id: str, thread_id: str) -> int:
    key = str(actor_user_id or thread_id or "").strip()
    digest = hashlib.sha256(key.encode("utf-8")).hexdigest()
    return int(digest[:8], 16) % 100


def _select_doctor_endpoint_family(actor_user_id: str, thread_id: str) -> str:
    mode = _rollout_mode()
    if mode in {"off", "shadow"}:
        return "legacy"
    if mode == "on":
        return "dedicated"
    # canary
    return "dedicated" if _stable_bucket_percent(actor_user_id, thread_id) < _rollout_canary_percent() else "legacy"


def _is_fallback_eligible(exc: Exception) -> bool:
    return not isinstance(exc, (HTTPException, ValueError, BookingDomainError))


def _emit_endpoint_selection_event(
    *,
    request_path: str,
    endpoint_selected: str,
    routing_reason: str,
    request: DoctorMatchAgentRequest,
) -> None:
    emit_telemetry_event(
        "endpoint_selection",
        request_path=request_path,
        endpoint_family=endpoint_selected,
        sample_key=f"{request.actor_user_id}:{request.thread_id}:endpoint_selection",
        payload={
            "thread_id": request.thread_id,
            "actor_user_id": request.actor_user_id,
            "patient_user_id": request.patient_user_id,
            "endpoint_family_selected": endpoint_selected,
            "routing_reason": routing_reason,
            "rollout_mode": _rollout_mode(),
            "canary_percent": _rollout_canary_percent(),
            "auto_fallback_enabled": _env_flag("SPECIALIZED_DOCTOR_AUTO_FALLBACK", True),
        },
    )


def _enforce_database_safeguards() -> None:
    """Apply phase migrations and verify required booking indexes."""
    database_dir = Path(REPO_ROOT) / "database"

    if _env_flag("DB_SKIP_MIGRATIONS", False):
        log.warning("Skipping DB migration application because DB_SKIP_MIGRATIONS is enabled")
    else:
        summary = apply_phase_migrations(engine=engine, database_dir=database_dir, dry_run=False)
        log.info(
            "DB migrations completed (applied=%s skipped=%s)",
            summary.get("applied", 0),
            summary.get("skipped", 0),
        )

    if _env_flag("DB_ENFORCE_REQUIRED_INDEXES", True):
        missing = verify_required_indexes(engine)
        if missing:
            raise RuntimeError(f"Missing required DB safeguard indexes: {', '.join(missing)}")
        log.info("Required DB safeguard indexes verified")
    else:
        log.warning("Required index verification disabled by DB_ENFORCE_REQUIRED_INDEXES")


# ── Lifespan: load/save memory on startup/shutdown ──────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load memory on startup, save on shutdown."""
    # Startup
    _verify_database_connectivity()
    _enforce_database_safeguards()

    log.info("Loading memory snapshot...")
    loaded = memory_tools.load_snapshot(SNAPSHOT_PATH)
    log.info(f"Loaded {loaded} users from memory snapshot")
    
    yield
    
    # Shutdown
    log.info("Saving memory snapshot...")
    success = memory_tools.save_snapshot(SNAPSHOT_PATH)
    log.info(f"Memory snapshot saved: {success}")


app = FastAPI(title="MyApp Backend", lifespan=lifespan)

_BOOKING_ERROR_STATUS: dict[str, int] = {
    "PatientNotFound": 404,
    "DoctorNotFound": 404,
    "ActorNotFound": 404,
    "AuthorizationPolicyNotConfigured": 503,
    "ActorPatientScopeViolation": 403,
    "InvalidPatientRole": 422,
    "InvalidBookingActorRole": 403,
    "MissingAuditReason": 422,
    "ApprovalRequired": 409,
    "DoctorIdentityMismatch": 422,
    "BookingSlotNotFound": 404,
    "BookingSlotUnavailable": 409,
    "BookingSlotAlreadyBooked": 409,
    "BookingPersistenceError": 503,
}


@app.exception_handler(BookingDomainError)
async def booking_domain_error_handler(_: Request, exc: BookingDomainError):
    """Map booking domain failures to consistent HTTP responses."""
    status_code = _BOOKING_ERROR_STATUS.get(exc.code, 400)
    return JSONResponse(
        status_code=status_code,
        content={"error": {"code": exc.code, "message": exc.message, "detail": exc.detail}},
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # your frontend
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Backend is running!"}


@app.get("/health/db")
def database_health():
    """Lightweight DB health endpoint for readiness checks."""
    status = _database_health_snapshot()
    if not status.get("ok"):
        raise HTTPException(status_code=503, detail=status)
    return status

@app.get("/users")
def get_users():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT * FROM usr"))
            users = [dict(row) for row in result]
        return users
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Memory API Models ───────────────────────────────────────────────────
class FactInput(BaseModel):
    predicate: str
    value: str


class AddFactsRequest(BaseModel):
    user_id: str
    facts: list[FactInput]


class RecallRequest(BaseModel):
    user_id: str
    query: str
    k: int = 5


class SupervisorTaskInput(BaseModel):
    task_id: str | None = None
    tool_name: str
    query: str | None = None
    k: int = 5
    facts: list[FactInput] = Field(default_factory=list)


class SupervisorRouteRequest(BaseModel):
    user_id: str
    tasks: list[SupervisorTaskInput]


SupervisorRequestPayload = SupervisorRouteRequest | DoctorMatchAgentRequest


class ApprovalActionRequest(BaseModel):
    human_user_id: str
    response_message: Optional[str] = None


class ApprovalResumeRequest(BaseModel):
    thread_id: str
    actor_user_id: str
    patient_user_id: str
    doctor_id: str
    slot_id: Optional[str] = None
    appointment_date: Optional[str] = None
    appointment_time: Optional[str] = None
    booking_timezone: str = "UTC"
    booking_reason: Optional[str] = None
    policy_context: dict = Field(default_factory=dict)
    doctor_name: Optional[str] = None


def _is_doctor_match_request(request: SupervisorRequestPayload) -> bool:
    return isinstance(request, DoctorMatchAgentRequest)


def _doctor_state_from_request(request: DoctorMatchAgentRequest) -> dict:
    selected_doctor = None
    selected_date = None
    selected_time = None
    selected_slot_id = None
    booking_timezone = "UTC"
    booking_reason = None
    policy_context: dict = {}

    if request.booking is not None:
        selected_slot_id = request.booking.slot_id
        selected_date = request.booking.appointment_date
        selected_time = request.booking.appointment_time
        booking_timezone = request.booking.booking_timezone
        booking_reason = request.booking.booking_reason
        policy_context = request.booking.policy_context

        if request.booking.doctor_name:
            selected_doctor = {
                # doctor_id is unresolved from route payload and must be resolved downstream.
                "doctor_name": request.booking.doctor_name,
            }

    return {
        "thread_id": request.thread_id,
        "actor_user_id": request.actor_user_id,
        "patient_user_id": request.patient_user_id,
        "need_text": request.need_text,
        "max_suggestions": request.max_suggestions,
        "selected_doctor": selected_doctor,
        "selected_slot_id": selected_slot_id,
        "selected_appointment_date": selected_date,
        "selected_appointment_time": selected_time,
        "booking_timezone": booking_timezone,
        "booking_reason": booking_reason,
        "policy_context": policy_context,
    }


async def _execute_doctor_workflow_with_fallback(
    request: DoctorMatchAgentRequest,
    *,
    request_path: str,
    endpoint_family: str,
) -> dict:
    doctor_state = _doctor_state_from_request(request)
    try:
        return await execute_doctor_match_workflow(doctor_state)
    except Exception as exc:
        if endpoint_family == "legacy":
            raise
        if not _env_flag("SPECIALIZED_DOCTOR_AUTO_FALLBACK", True):
            raise
        if not _is_fallback_eligible(exc):
            raise

        if _env_flag("SPECIALIZED_DOCTOR_FALLBACK_REASON_LOGGING", True):
            log.warning(
                "Specialized fallback triggered for thread=%s actor=%s from=%s due to %s",
                request.thread_id,
                request.actor_user_id,
                endpoint_family,
                type(exc).__name__,
            )

        emit_telemetry_event(
            "fallback_triggered",
            request_path=request_path,
            endpoint_family="legacy",
            sample_key=f"{request.actor_user_id}:{request.thread_id}:fallback",
            payload={
                "thread_id": request.thread_id,
                "actor_user_id": request.actor_user_id,
                "patient_user_id": request.patient_user_id,
                "from_path": endpoint_family,
                "to_path": "legacy",
                "failure_class": type(exc).__name__,
                "failure_code": getattr(exc, "code", type(exc).__name__),
            },
        )
        return await execute_doctor_match_workflow_legacy(doctor_state)


def _coerce_doctor_response_contract(
    workflow_response: dict,
    request: DoctorMatchAgentRequest,
    *,
    strict: bool,
) -> dict:
    """Convert internal workflow payload into strict DoctorMatchAgentResponse schema."""
    if not isinstance(workflow_response, dict) or "booking_mode" not in workflow_response:
        return workflow_response

    mode = str(workflow_response.get("booking_mode") or "suggest_only")
    missing_fields = workflow_response.get("booking_blocked_missing_fields")
    if not isinstance(missing_fields, list):
        missing_fields = workflow_response.get("booking_missing_fields", [])
    if not isinstance(missing_fields, list):
        missing_fields = []

    profile = workflow_response.get("patient_profile_snapshot")
    profile = profile if isinstance(profile, dict) else {}
    structured_errors = workflow_response.get("structured_errors")
    if not isinstance(structured_errors, list):
        structured_errors = []

    suggestions_in = workflow_response.get("suggestion_cards")
    suggestions_in = suggestions_in if isinstance(suggestions_in, list) else []
    suggestions: list[dict] = []
    for item in suggestions_in:
        if not isinstance(item, dict):
            continue
        suggestions.append(
            {
                "doctor_id": item.get("doctor_id"),
                "doctor_name": item.get("doctor_name"),
                "specialty": item.get("specialty"),
                "clinic_address": item.get("clinic_address"),
                "session_price": item.get("session_price"),
                "earliest_available_at": item.get("earliest_available_at"),
                "ranking_score": float(item.get("ranking_score") or 0.0),
                "rationale": item.get("rationale") or "specialty+availability+proximity+price",
            }
        )

    booking_result = workflow_response.get("booking_result")
    booking_result = booking_result if isinstance(booking_result, dict) else {}
    approval_outcome = workflow_response.get("approval_outcome")
    approval_outcome = approval_outcome if isinstance(approval_outcome, dict) else None
    booking_outcome = None
    if mode in {"booked", "booking_failed"}:
        booking_outcome = {
            "status": "booked" if mode == "booked" else "failed",
            "appointment_id": booking_result.get("appointment_id"),
            "slot_id": booking_result.get("slot_id"),
            "doctor_id": booking_result.get("doctor_id"),
            "doctor_name": request.booking.doctor_name if request.booking else None,
            "appointment_date": booking_result.get("appointment_date"),
            "appointment_time": booking_result.get("appointment_time"),
            "resolution_mode": booking_result.get("resolution_mode"),
            "normalized_booking_time_utc": booking_result.get("normalized_booking_time_utc"),
            "message": str(booking_result.get("message") or ("Appointment booked" if mode == "booked" else "Booking failed")),
        }

    payload = {
        "thread_id": workflow_response.get("thread_id") or request.thread_id,
        "actor_user_id": request.actor_user_id,
        "patient_user_id": request.patient_user_id,
        "inferred_need": workflow_response.get("inferred_need") or request.need_text,
        "patient_profile_snapshot": {
            "user_id": profile.get("user_id") or request.patient_user_id,
            "first_name": profile.get("first_name"),
            "last_name": profile.get("last_name"),
            "age": profile.get("age"),
            "gender": profile.get("gender"),
            "allergies": profile.get("allergies") if isinstance(profile.get("allergies"), list) else [],
            "chronic_conditions": (
                profile.get("chronic_conditions") if isinstance(profile.get("chronic_conditions"), list) else []
            ),
        },
        "suggestions": suggestions,
        "booking_readiness": {
            "ready": mode != "suggest_only",
            "missing_fields": missing_fields,
            "reason": str(
                workflow_response.get("booking_blocked_reason")
                or ("ready_for_booking" if mode != "suggest_only" else "missing_required_booking_fields")
            ),
        },
        "booking_mode": mode,
        "booking_outcome": booking_outcome,
        "approval_outcome": approval_outcome,
        "errors": structured_errors,
    }

    try:
        model = DoctorMatchAgentResponse.model_validate(payload)
        return model.model_dump(mode="json")
    except ValidationError:
        if strict:
            raise
        log.warning("Doctor response schema coercion skipped for non-conforming stream payload")
        return workflow_response


def _build_sse_response(event_generator):
    return StreamingResponse(
        event_generator,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
        },
    )


def _trace_event_visible_to_user(event: dict, user: User) -> bool:
    if str(user.role) == "admin":
        return True
    user_id = str(user.user_id)
    return user_id in {
        str(event.get("actor_user_id") or ""),
        str(event.get("patient_user_id") or ""),
    }


def _mask_trace_event_for_user(event: dict, user: User) -> dict:
    if str(user.role) == "admin":
        return event

    masked = dict(event)
    user_id = str(user.user_id)
    actor = str(masked.get("actor_user_id") or "")
    patient = str(masked.get("patient_user_id") or "")
    masked["actor_user_id"] = actor if actor == user_id else None
    masked["patient_user_id"] = patient if patient == user_id else None
    return masked


# ── Memory API Routes ───────────────────────────────────────────────────
@app.post("/memory/add")
def add_memory_facts(request: AddFactsRequest):
    """Add preference facts for a user."""
    facts = [{"predicate": f.predicate, "value": f.value} for f in request.facts]
    try:
        count = memory_tools.add_facts(request.user_id, facts)
        return {"added": count, "total": memory_tools.user_fact_count(request.user_id)}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        log.error(f"Failed to add facts: {e}")
        raise HTTPException(status_code=500, detail="Failed to add facts")


@app.post("/memory/recall")
def recall_memory(request: RecallRequest):
    """Recall relevant facts for a user based on query."""
    try:
        facts = memory_tools.recall(request.user_id, request.query, k=request.k)
        return {"facts": facts, "count": len(facts)}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        log.error(f"Failed to recall facts: {e}")
        raise HTTPException(status_code=500, detail="Failed to recall facts")


@app.get("/memory/context/{user_id}")
def get_memory_context(user_id: str, query: str, k: int = 5):
    """Get formatted memory context for prompt injection."""
    try:
        context = memory_tools.memory_context(user_id, query, k=k)
        return {"context": context}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/memory/count/{user_id}")
def get_fact_count(user_id: str):
    """Get the number of stored facts for a user."""
    return {"user_id": user_id, "fact_count": memory_tools.user_fact_count(user_id)}


@app.delete("/memory/clear/{user_id}")
def clear_user_memory(user_id: str):
    """Delete all stored facts for a user."""
    memory_tools.clear_user(user_id)
    return {"message": f"Memory cleared for user {user_id}"}


@app.post("/memory/save")
def save_memory_snapshot():
    """Manually trigger memory snapshot save."""
    success = memory_tools.save_snapshot(SNAPSHOT_PATH)
    if success:
        return {"message": "Memory snapshot saved successfully"}
    raise HTTPException(status_code=500, detail="Failed to save memory snapshot")


# ── Supervisor routing endpoint ────────────────────────────────────────
@app.post("/supervisor/doctor/route", response_model=DoctorMatchAgentResponse)
async def supervisor_doctor_route(request: DoctorMatchAgentRequest):
    """Execute specialized doctor-matching workflow via dedicated endpoint."""
    rate_limiter = stream_manager.get_rate_limiter()
    allowed, error_msg = rate_limiter.check_rate_limit(request.actor_user_id)
    if not allowed:
        raise HTTPException(status_code=429, detail=error_msg)

    try:
        selected = _select_doctor_endpoint_family(request.actor_user_id, request.thread_id)
        _emit_endpoint_selection_event(
            request_path="/supervisor/doctor/route",
            endpoint_selected=selected,
            routing_reason="dedicated_endpoint_request",
            request=request,
        )
        out = await _execute_doctor_workflow_with_fallback(
            request,
            request_path="/supervisor/doctor/route",
            endpoint_family=selected,
        )
        return _coerce_doctor_response_contract(out, request, strict=True)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=500, detail=f"Doctor response contract validation failed: {e}")


@app.post("/supervisor/route")
async def supervisor_route(request: SupervisorRequestPayload):
    """Build and execute workflows via legacy multiplexed endpoint.

    Deprecated for specialized doctor requests. Prefer `/supervisor/doctor/route`.
    """
    # Rate limit check
    rate_limiter = stream_manager.get_rate_limiter()
    rate_limit_user = request.actor_user_id if _is_doctor_match_request(request) else request.user_id
    allowed, error_msg = rate_limiter.check_rate_limit(rate_limit_user)
    if not allowed:
        raise HTTPException(status_code=429, detail=error_msg)
    
    try:
        if _is_doctor_match_request(request):
            selected = _select_doctor_endpoint_family(request.actor_user_id, request.thread_id)
            _emit_endpoint_selection_event(
                request_path="/supervisor/route",
                endpoint_selected=selected,
                routing_reason="legacy_multiplexed_request",
                request=request,
            )
            log.warning(
                "DEPRECATION: DoctorMatchAgentRequest on /supervisor/route is deprecated; "
                "use /supervisor/doctor/route (actor_user_id=%s thread_id=%s)",
                request.actor_user_id,
                request.thread_id,
            )
            out = await _execute_doctor_workflow_with_fallback(
                request,
                request_path="/supervisor/route",
                endpoint_family=selected,
            )
            return _coerce_doctor_response_contract(out, request, strict=False)

        task_specs = [task.model_dump() for task in request.tasks]
        return await execute_supervisor_workflow(request.user_id, task_specs)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── Phase 3: Streaming SSE Endpoints ────────────────────────────────────
@app.post("/supervisor/doctor/stream")
async def supervisor_doctor_stream(request: DoctorMatchAgentRequest):
    """Stream specialized doctor workflow via dedicated endpoint."""
    rate_limiter = stream_manager.get_rate_limiter()
    allowed, error_msg = rate_limiter.check_rate_limit(request.actor_user_id)
    if not allowed:
        raise HTTPException(status_code=429, detail=error_msg)

    selected = _select_doctor_endpoint_family(request.actor_user_id, request.thread_id)
    _emit_endpoint_selection_event(
        request_path="/supervisor/doctor/stream",
        endpoint_selected=selected,
        routing_reason="dedicated_stream_request",
        request=request,
    )

    async def event_generator():
        try:
            doctor_state = _doctor_state_from_request(request)
            async for event in stream_doctor_match_workflow(doctor_state):
                yield f"data: {json.dumps(event)}\n\n"
        except ValueError as e:
            error_event = {"type": "error", "message": str(e)}
            yield f"data: {json.dumps(error_event)}\n\n"
        except Exception as e:
            if (
                selected != "legacy"
                and _env_flag("SPECIALIZED_DOCTOR_AUTO_FALLBACK", True)
                and _is_fallback_eligible(e)
            ):
                if _env_flag("SPECIALIZED_DOCTOR_FALLBACK_REASON_LOGGING", True):
                    log.warning(
                        "Specialized stream fallback triggered for thread=%s actor=%s due to %s",
                        request.thread_id,
                        request.actor_user_id,
                        type(e).__name__,
                    )
                emit_telemetry_event(
                    "fallback_triggered",
                    request_path="/supervisor/doctor/stream",
                    endpoint_family="legacy",
                    sample_key=f"{request.actor_user_id}:{request.thread_id}:stream_fallback",
                    payload={
                        "thread_id": request.thread_id,
                        "actor_user_id": request.actor_user_id,
                        "patient_user_id": request.patient_user_id,
                        "from_path": selected,
                        "to_path": "legacy",
                        "failure_class": type(e).__name__,
                        "failure_code": getattr(e, "code", type(e).__name__),
                    },
                )
                doctor_state = _doctor_state_from_request(request)
                fallback_result = await execute_doctor_match_workflow_legacy(doctor_state)
                yield f"data: {json.dumps({'type': 'complete', 'results': _coerce_doctor_response_contract(fallback_result, request, strict=False), 'errors': fallback_result.get('structured_errors', []), 'stages': []})}\n\n"
            else:
                log.error("Stream error for doctor actor %s: %s", request.actor_user_id, e)
                error_event = {"type": "error", "message": "Internal server error"}
                yield f"data: {json.dumps(error_event)}\n\n"

    return _build_sse_response(event_generator())


@app.post("/supervisor/stream")
async def supervisor_stream(request: SupervisorRequestPayload):
    """Execute workflows with SSE via legacy multiplexed endpoint.

    Deprecated for specialized doctor requests. Prefer `/supervisor/doctor/stream`.
    
    Streams partial results as execution progresses, allowing:
    - Real-time progress updates
    - Mid-generation interruption
    - Automatic reprompt handling (cancels previous stream)
    
    SSE event format:
    - data: {"type": "plan", "stages": [...]}
    - data: {"type": "stage_start", "stage_index": N, ...}
    - data: {"type": "stage_complete", "stage_index": N, "results": {...}}
    - data: {"type": "complete", "results": {...}, "errors": [...]}
    - data: {"type": "cancelled"}
    - data: {"type": "error", "message": "..."}
    """
    # Rate limit check
    rate_limiter = stream_manager.get_rate_limiter()
    rate_limit_user = request.actor_user_id if _is_doctor_match_request(request) else request.user_id
    allowed, error_msg = rate_limiter.check_rate_limit(rate_limit_user)
    if not allowed:
        raise HTTPException(status_code=429, detail=error_msg)
    
    async def event_generator():
        try:
            if _is_doctor_match_request(request):
                selected = _select_doctor_endpoint_family(request.actor_user_id, request.thread_id)
                _emit_endpoint_selection_event(
                    request_path="/supervisor/stream",
                    endpoint_selected=selected,
                    routing_reason="legacy_multiplexed_stream_request",
                    request=request,
                )
                log.warning(
                    "DEPRECATION: DoctorMatchAgentRequest on /supervisor/stream is deprecated; "
                    "use /supervisor/doctor/stream (actor_user_id=%s thread_id=%s)",
                    request.actor_user_id,
                    request.thread_id,
                )
                doctor_state = _doctor_state_from_request(request)
                async for event in stream_doctor_match_workflow(doctor_state):
                    yield f"data: {json.dumps(event)}\n\n"
            else:
                task_specs = [task.model_dump() for task in request.tasks]
                async for event in stream_supervisor_workflow(request.user_id, task_specs):
                    # SSE format: "data: {json}\n\n"
                    yield f"data: {json.dumps(event)}\n\n"
        except ValueError as e:
            error_event = {"type": "error", "message": str(e)}
            yield f"data: {json.dumps(error_event)}\n\n"
        except Exception as e:
            stream_user = request.actor_user_id if _is_doctor_match_request(request) else request.user_id
            log.error(f"Stream error for user {stream_user}: {e}")
            error_event = {"type": "error", "message": "Internal server error"}
            yield f"data: {json.dumps(error_event)}\n\n"

    return _build_sse_response(event_generator())


@app.post("/supervisor/cancel/{user_id}")
async def cancel_supervisor_stream(user_id: str):
    """Cancel active stream for a user (interrupt mid-generation).
    
    Used for stop button functionality.
    """
    cancelled = stream_manager.cancel_stream(user_id)
    if cancelled:
        return {"message": f"Stream cancelled for user {user_id}"}
    return {"message": f"No active stream for user {user_id}"}


@app.post("/supervisor/doctor/cancel/{actor_user_id}")
async def cancel_supervisor_doctor_stream(actor_user_id: str):
    """Cancel active doctor-specialized stream by actor_user_id."""
    cancelled = stream_manager.cancel_stream(actor_user_id)
    if cancelled:
        return {"message": f"Doctor stream cancelled for actor {actor_user_id}"}
    return {"message": f"No active doctor stream for actor {actor_user_id}"}


@app.get("/supervisor/doctor/threads/{thread_id}/workflow-traces")
def get_supervisor_doctor_workflow_traces(
    thread_id: str,
    run_id: str | None = None,
    before_cursor: str | None = None,
    before_trace_id: str | None = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    safe_limit = min(max(int(limit), 1), 200)
    rows = list_workflow_trace_events(
        db=db,
        workflow_family="specialized_doctor",
        thread_id=str(thread_id),
        run_id=run_id,
        before_cursor=before_cursor or before_trace_id,
        visible_to_user_id=None if str(user.role) == "admin" else str(user.user_id),
        limit=safe_limit + 1,
    )
    serialized = [serialize_trace_event(r) for r in rows]
    if not serialized and str(user.role) != "admin":
        raise HTTPException(status_code=404, detail="Trace thread not found")
    page = serialized[:safe_limit]
    has_more = len(serialized) > safe_limit
    next_cursor = (
        encode_trace_cursor(
            occurred_at=rows[safe_limit - 1].occurred_at,
            sequence=int(rows[safe_limit - 1].sequence),
            trace_id=str(rows[safe_limit - 1].trace_id),
        )
        if has_more and page
        else None
    )
    return {
        "thread_id": str(thread_id),
        "workflow_family": "specialized_doctor",
        "run_id": run_id,
        "events": [_mask_trace_event_for_user(e, user) for e in page],
        "next_cursor": next_cursor,
    }


@app.get("/rate-limit/status/{user_id}")
async def rate_limit_status(user_id: str):
    """Get current rate limit status for a user."""
    rate_limiter = stream_manager.get_rate_limiter()
    return rate_limiter.get_stats(user_id)


# ── Phase 3: Human Approval Endpoints ───────────────────────────────────
@app.get("/approval/pending")
async def list_pending_approvals(user_id: Optional[str] = None):
    """List all pending approval requests, optionally filtered by user.
    
    Query params:
        user_id: Optional filter by user ID
    
    Returns:
        List of pending approval requests
    """
    approvals = approval_manager.list_pending_approvals(user_id)
    
    return {
        "pending_approvals": [
            {
                "approval_id": a.approval_id,
                "user_id": a.user_id,
                "task_id": a.task_id,
                "tool_name": a.tool_name,
                "operation_type": a.operation_type,
                "context": a.context,
                "created_at": a.created_at.isoformat(),
                "expires_at": a.expires_at.isoformat(),
                "status": a.status.value,
            }
            for a in approvals
        ],
        "count": len(approvals),
    }


@app.get("/approval/{approval_id}")
async def get_approval_status(approval_id: str):
    """Get status of a specific approval request."""
    request = approval_manager.get_approval_request(approval_id)
    
    if not request:
        raise HTTPException(status_code=404, detail="Approval request not found")
    
    return {
        "approval_id": request.approval_id,
        "user_id": request.user_id,
        "task_id": request.task_id,
        "tool_name": request.tool_name,
        "operation_type": request.operation_type,
        "context": request.context,
        "status": request.status.value,
        "created_at": request.created_at.isoformat(),
        "expires_at": request.expires_at.isoformat(),
        "human_user_id": request.human_user_id,
        "human_response": request.human_response,
        "responded_at": request.responded_at.isoformat() if request.responded_at else None,
    }


@app.post("/approval/{approval_id}/approve")
async def approve_approval_request(approval_id: str, request: ApprovalActionRequest):
    """Approve a pending request.
    
    Body:
        human_user_id: ID of the human approver
        response_message: Optional message from approver
    """
    success, message = approval_manager.approve_request(
        approval_id,
        request.human_user_id,
        request.response_message,
    )
    
    if not success:
        raise HTTPException(status_code=400, detail=message)
    approval = approval_manager.get_approval_request(approval_id)
    thread_id = ""
    if approval and isinstance(approval.task_id, str) and ":" in approval.task_id:
        thread_id = approval.task_id.split(":", 1)[1]
    emit_telemetry_event(
        "approval_approved",
        request_path=f"/approval/{approval_id}/approve",
        endpoint_family="specialized",
        sample_key=f"{approval_id}:approval_approved",
        payload={"approval_id": approval_id, "thread_id": thread_id, "human_user_id": request.human_user_id},
    )
    return {"message": message, "approval_id": approval_id, "status": "approved"}


@app.post("/approval/{approval_id}/reject")
async def reject_approval_request(approval_id: str, request: ApprovalActionRequest):
    """Reject a pending request.
    
    Body:
        human_user_id: ID of the human approver
        response_message: Optional message from approver
    """
    success, message = approval_manager.reject_request(
        approval_id,
        request.human_user_id,
        request.response_message,
    )
    
    if not success:
        raise HTTPException(status_code=400, detail=message)
    approval = approval_manager.get_approval_request(approval_id)
    thread_id = ""
    if approval and isinstance(approval.task_id, str) and ":" in approval.task_id:
        thread_id = approval.task_id.split(":", 1)[1]
    emit_telemetry_event(
        "approval_rejected",
        request_path=f"/approval/{approval_id}/reject",
        endpoint_family="specialized",
        sample_key=f"{approval_id}:approval_rejected",
        payload={"approval_id": approval_id, "thread_id": thread_id, "human_user_id": request.human_user_id},
    )
    return {"message": message, "approval_id": approval_id, "status": "rejected"}


@app.post("/supervisor/doctor/approval/{approval_id}/resume")
async def resume_approved_booking(approval_id: str, request: ApprovalResumeRequest):
    approval = approval_manager.get_approval_request(approval_id)
    if not approval:
        raise HTTPException(status_code=404, detail="Approval request not found")
    if approval.status.value == "expired":
        emit_telemetry_event(
            "approval_expired",
            request_path=f"/supervisor/doctor/approval/{approval_id}/resume",
            endpoint_family="specialized",
            sample_key=f"{approval_id}:approval_expired",
            payload={"approval_id": approval_id, "thread_id": request.thread_id},
        )
        raise HTTPException(status_code=409, detail="Approval request expired")
    if approval.status.value == "rejected":
        emit_telemetry_event(
            "approval_rejected",
            request_path=f"/supervisor/doctor/approval/{approval_id}/resume",
            endpoint_family="specialized",
            sample_key=f"{approval_id}:approval_rejected",
            payload={"approval_id": approval_id, "thread_id": request.thread_id},
        )
        raise HTTPException(status_code=409, detail="Approval request rejected")
    if approval.status.value != "approved":
        raise HTTPException(status_code=409, detail="Approval request must be approved before resume")

    appointment_date = date.fromisoformat(request.appointment_date) if request.appointment_date else None
    appointment_time = time.fromisoformat(request.appointment_time) if request.appointment_time else None

    emit_telemetry_event(
        "approval_resume_started",
        request_path=f"/supervisor/doctor/approval/{approval_id}/resume",
        endpoint_family="specialized",
        sample_key=f"{approval_id}:approval_resume_started",
        payload={"approval_id": approval_id, "thread_id": request.thread_id},
    )
    emit_workflow_trace_event(
        workflow_family="specialized_doctor",
        thread_id=request.thread_id,
        run_id=f"resume-{approval_id}",
        event_type="approval_resume_started",
        node_name="approval_resume",
        status="started",
        actor_user_id=request.actor_user_id,
        patient_user_id=request.patient_user_id,
        payload={"approval_id": approval_id},
    )

    try:
        result = book_appointment(
            thread_id=request.thread_id,
            actor_user_id=request.actor_user_id,
            patient_user_id=request.patient_user_id,
            doctor_id=request.doctor_id,
            slot_id=request.slot_id,
            appointment_date=appointment_date,
            appointment_time=appointment_time,
            booking_timezone=request.booking_timezone,
            booking_reason=request.booking_reason,
            policy_context=dict(request.policy_context or {}),
            doctor_name=request.doctor_name,
        )
        approval_manager.complete_request(
            approval_id,
            status=approval_manager.ApprovalStatus.APPROVED,
            response_message="approved_resumed",
        )
        emit_telemetry_event(
            "approval_resume_succeeded",
            request_path=f"/supervisor/doctor/approval/{approval_id}/resume",
            endpoint_family="specialized",
            sample_key=f"{approval_id}:approval_resume_succeeded",
            payload={"approval_id": approval_id, "thread_id": request.thread_id},
        )
        emit_workflow_trace_event(
            workflow_family="specialized_doctor",
            thread_id=request.thread_id,
            run_id=f"resume-{approval_id}",
            event_type="approval_resume_succeeded",
            node_name="approval_resume",
            status="ok",
            actor_user_id=request.actor_user_id,
            patient_user_id=request.patient_user_id,
            payload={"approval_id": approval_id, "booking_mode": "booked"},
        )
        return {
            "approval_id": approval_id,
            "booking_mode": "booked",
            "booking_outcome": result,
            "approval_outcome": {"approval_id": approval_id, "status": "approved_resumed"},
        }
    except BookingDomainError as exc:
        approval_manager.complete_request(
            approval_id,
            status=approval_manager.ApprovalStatus.APPROVED,
            response_message="approved_resume_failed",
        )
        emit_telemetry_event(
            "approval_resume_failed",
            request_path=f"/supervisor/doctor/approval/{approval_id}/resume",
            endpoint_family="specialized",
            sample_key=f"{approval_id}:approval_resume_failed:{exc.code}",
            payload={"approval_id": approval_id, "thread_id": request.thread_id, "error_code": exc.code},
        )
        emit_workflow_trace_event(
            workflow_family="specialized_doctor",
            thread_id=request.thread_id,
            run_id=f"resume-{approval_id}",
            event_type="approval_resume_failed",
            node_name="approval_resume",
            status="error",
            actor_user_id=request.actor_user_id,
            patient_user_id=request.patient_user_id,
            payload={"approval_id": approval_id, "error_code": exc.code},
        )
        return {
            "approval_id": approval_id,
            "booking_mode": "booking_failed",
            "booking_outcome": exc.to_dict(),
            "approval_outcome": {"approval_id": approval_id, "status": "approved_resume_failed"},
        }


@app.post("/approval/cleanup")
async def cleanup_approvals():
    """Manually trigger cleanup of expired approval requests."""
    approval_manager.cleanup_expired_approvals()
    return {"message": "Cleanup complete"}


# ── Phase 5: Unified Assistant Endpoints ────────────────────────────────

def _unified_doctor_state_from_request(request: UnifiedAgentRequest) -> dict:
    """Convert UnifiedAgentRequest to doctor workflow state dict."""
    selected_doctor = None
    selected_date = None
    selected_time = None
    selected_slot_id = None
    booking_timezone = "UTC"
    booking_reason = None
    policy_context: dict = {}

    booking = request.booking or {}
    if booking:
        selected_slot_id = booking.get("slot_id")
        selected_date = booking.get("appointment_date")
        selected_time = booking.get("appointment_time")
        booking_timezone = booking.get("booking_timezone", "UTC")
        booking_reason = booking.get("booking_reason")
        policy_context = booking.get("policy_context", {})
        if booking.get("doctor_name"):
            selected_doctor = {"doctor_name": booking["doctor_name"]}

    return {
        "thread_id": request.thread_id,
        "actor_user_id": request.actor_user_id,
        "patient_user_id": request.patient_user_id,
        "need_text": request.need_text,
        "max_suggestions": request.max_suggestions,
        "selected_doctor": selected_doctor,
        "selected_slot_id": selected_slot_id,
        "selected_appointment_date": selected_date,
        "selected_appointment_time": selected_time,
        "booking_timezone": booking_timezone,
        "booking_reason": booking_reason,
        "policy_context": policy_context,
    }


@app.post("/supervisor/unified", response_model=UnifiedAgentResponse)
async def supervisor_unified(request: UnifiedAgentRequest):
    """Unified endpoint that runs medication + appointment pipelines and returns an AI-generated message.

    The response includes both the natural-language message and structured data
    for frontend interactive elements.
    """
    rate_limiter = stream_manager.get_rate_limiter()
    allowed, error_msg = rate_limiter.check_rate_limit(request.actor_user_id)
    if not allowed:
        raise HTTPException(status_code=429, detail=error_msg)

    # 1. Run medication pipeline if requested
    med_result = None
    if request.include_medication:
        symptom = (request.symptom or request.need_text).strip()
        med_result = medication_pipeline(
            symptom=symptom,
            user_id=request.patient_user_id,
        )

    # 2. Run doctor matching workflow if requested
    doctor_result = None
    if request.include_appointment:
        doctor_state = _unified_doctor_state_from_request(request)
        try:
            doctor_result = await execute_doctor_match_workflow(doctor_state)
        except Exception as exc:
            if _env_flag("SPECIALIZED_DOCTOR_AUTO_FALLBACK", True) and _is_fallback_eligible(exc):
                log.warning("Unified endpoint fallback triggered: %s", type(exc).__name__)
                doctor_result = await execute_doctor_match_workflow_legacy(doctor_state)
            else:
                raise

    # 3. Get patient profile (from doctor result or fresh lookup)
    patient_profile = {}
    if doctor_result and doctor_result.get("patient_profile_snapshot"):
        patient_profile = doctor_result["patient_profile_snapshot"]
    else:
        try:
            from .tools.doctor_matching_tools import profile_user as profile_user_tool
            patient_profile = profile_user_tool(request.patient_user_id)
        except Exception:
            patient_profile = {"user_id": request.patient_user_id}

    # 4. Synthesize
    synthesized = synthesize_response(
        patient_profile=patient_profile,
        symptom=request.symptom or request.need_text,
        need_text=request.need_text,
        medication_result=med_result,
        doctor_result=doctor_result,
        structured_errors=doctor_result.get("structured_errors", []) if doctor_result else [],
    )

    return synthesized


@app.post("/supervisor/unified/stream")
async def supervisor_unified_stream(request: UnifiedAgentRequest):
    """Stream the AI message token-by-token (ChatGPT-style).

    Yields SSE events:
        data: {"type": "delta", "content": "..."}
        ...
        data: {"type": "complete", "response": {...}}
    """
    rate_limiter = stream_manager.get_rate_limiter()
    allowed, error_msg = rate_limiter.check_rate_limit(request.actor_user_id)
    if not allowed:
        raise HTTPException(status_code=429, detail=error_msg)

    async def event_generator():
        # 1. Run medication pipeline if requested
        med_result = None
        if request.include_medication:
            symptom = (request.symptom or request.need_text).strip()
            med_result = medication_pipeline(
                symptom=symptom,
                user_id=request.patient_user_id,
            )

        # 2. Run doctor matching workflow if requested
        doctor_result = None
        if request.include_appointment:
            doctor_state = _unified_doctor_state_from_request(request)
            try:
                doctor_result = await execute_doctor_match_workflow(doctor_state)
            except Exception as exc:
                if _env_flag("SPECIALIZED_DOCTOR_AUTO_FALLBACK", True) and _is_fallback_eligible(exc):
                    log.warning("Unified stream fallback triggered: %s", type(exc).__name__)
                    doctor_result = await execute_doctor_match_workflow_legacy(doctor_state)
                else:
                    error_event = {"type": "error", "message": str(exc)}
                    yield f"data: {json.dumps(error_event)}\n\n"
                    return

        # 3. Get patient profile
        patient_profile = {}
        if doctor_result and doctor_result.get("patient_profile_snapshot"):
            patient_profile = doctor_result["patient_profile_snapshot"]
        else:
            try:
                from .tools.doctor_matching_tools import profile_user as profile_user_tool
                patient_profile = profile_user_tool(request.patient_user_id)
            except Exception:
                patient_profile = {"user_id": request.patient_user_id}

        # 4. Stream synthesis
        try:
            async for chunk in stream_synthesize_response(
                patient_profile=patient_profile,
                symptom=request.symptom or request.need_text,
                need_text=request.need_text,
                medication_result=med_result,
                doctor_result=doctor_result,
                structured_errors=doctor_result.get("structured_errors", []) if doctor_result else [],
            ):
                yield f"data: {json.dumps(chunk)}\n\n"
        except Exception as exc:
            log.error("Unified stream synthesis failed: %s", exc)
            error_event = {"type": "error", "message": "Internal server error"}
            yield f"data: {json.dumps(error_event)}\n\n"

    return _build_sse_response(event_generator())
