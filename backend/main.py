import os
import json
import logging
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from dotenv import load_dotenv

# Load environment variables from repo root so local run works from any cwd.
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(BACKEND_DIR)
load_dotenv(os.path.join(REPO_ROOT, ".env"))

# Import backend modules from organized packages.
# Run with: uvicorn backend.main:app --reload
from .memory import memory_tools
from .orchestration.supervisor_workflow import (
    execute_supervisor_workflow,
    stream_supervisor_workflow,
)
from .middleware import stream_manager, approval_manager

# Set up logging
logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)


DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "1234567890")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "FYP")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL)

# Memory snapshot path (relative paths are anchored to backend directory).
snapshot_path_env = os.getenv("MEMORY_SNAPSHOT_PATH", "data/memory_snapshot.json")
if os.path.isabs(snapshot_path_env):
    SNAPSHOT_PATH = snapshot_path_env
else:
    SNAPSHOT_PATH = os.path.join(BACKEND_DIR, snapshot_path_env)

# Ensure snapshot directory exists before memory load/save.
os.makedirs(os.path.dirname(SNAPSHOT_PATH), exist_ok=True)


# ── Lifespan: load/save memory on startup/shutdown ──────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load memory on startup, save on shutdown."""
    # Startup
    log.info("Loading memory snapshot...")
    loaded = memory_tools.load_snapshot(SNAPSHOT_PATH)
    log.info(f"Loaded {loaded} users from memory snapshot")
    
    yield
    
    # Shutdown
    log.info("Saving memory snapshot...")
    success = memory_tools.save_snapshot(SNAPSHOT_PATH)
    log.info(f"Memory snapshot saved: {success}")


app = FastAPI(title="MyApp Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # your frontend
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Backend is running!"}

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


class ApprovalActionRequest(BaseModel):
    human_user_id: str
    response_message: Optional[str] = None


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
@app.post("/supervisor/route")
async def supervisor_route(request: SupervisorRouteRequest):
    """Build and execute a safe parallel plan via LangGraph state workflow."""
    # Rate limit check
    rate_limiter = stream_manager.get_rate_limiter()
    allowed, error_msg = rate_limiter.check_rate_limit(request.user_id)
    if not allowed:
        raise HTTPException(status_code=429, detail=error_msg)
    
    try:
        task_specs = [task.model_dump() for task in request.tasks]
        return await execute_supervisor_workflow(request.user_id, task_specs)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── Phase 3: Streaming SSE Endpoints ────────────────────────────────────
@app.post("/supervisor/stream")
async def supervisor_stream(request: SupervisorRouteRequest):
    """Execute supervisor workflow with SSE streaming.
    
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
    allowed, error_msg = rate_limiter.check_rate_limit(request.user_id)
    if not allowed:
        raise HTTPException(status_code=429, detail=error_msg)
    
    async def event_generator():
        try:
            task_specs = [task.model_dump() for task in request.tasks]
            async for event in stream_supervisor_workflow(request.user_id, task_specs):
                # SSE format: "data: {json}\n\n"
                yield f"data: {json.dumps(event)}\n\n"
        except ValueError as e:
            error_event = {"type": "error", "message": str(e)}
            yield f"data: {json.dumps(error_event)}\n\n"
        except Exception as e:
            log.error(f"Stream error for user {request.user_id}: {e}")
            error_event = {"type": "error", "message": "Internal server error"}
            yield f"data: {json.dumps(error_event)}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
        },
    )


@app.post("/supervisor/cancel/{user_id}")
async def cancel_supervisor_stream(user_id: str):
    """Cancel active stream for a user (interrupt mid-generation).
    
    Used for stop button functionality.
    """
    cancelled = stream_manager.cancel_stream(user_id)
    if cancelled:
        return {"message": f"Stream cancelled for user {user_id}"}
    return {"message": f"No active stream for user {user_id}"}


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
    
    return {"message": message, "approval_id": approval_id, "status": "rejected"}


@app.post("/approval/cleanup")
async def cleanup_approvals():
    """Manually trigger cleanup of expired approval requests."""
    approval_manager.cleanup_expired_approvals()
    return {"message": "Cleanup complete"}
