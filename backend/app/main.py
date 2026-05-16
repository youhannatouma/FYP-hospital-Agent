import os
import logging

from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.database import Base, engine
from app.models import user, appointment, time_slot, message, chat, pharmacy, workflow_trace_event, audit_log, health_goal
from app.routes import auth, users, appointments, doctors, payments, admin, medical_records, prescriptions, notifications, messages, assistant, health_goals
from app.config import CORS_ORIGINS, DEBUG_MODE, ENVIRONMENT
from shared.gemini import log_assistant_llm_status_once

log = logging.getLogger("hospital")
logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown hooks."""
    # ── Create tables ──────────────────────────────────────────────────────
    from app.models import user, appointment, time_slot, medical_record, prescription, notification, message, chat, pharmacy, workflow_trace_event, audit_log, health_goal
    Base.metadata.create_all(bind=engine)
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE IF EXISTS usr ADD COLUMN IF NOT EXISTS current_medications TEXT[]"))
    log.info("Database tables ensured.")

    # ── Auto-seed if empty ─────────────────────────────────────────────────
    try:
        from seed_database import seed_database
        seed_database()
    except Exception as e:
        log.warning("Auto-seed skipped or failed: %s", e)

    log.info(f"Starting application in {ENVIRONMENT} mode")
    log_assistant_llm_status_once()

    yield  # app is running
    log.info("Shutting down.")


app = FastAPI(title="Hospital Backend", lifespan=lifespan)

# mount all routers under a common api prefix to match frontend baseURL
api_router = APIRouter(prefix="/api")

@app.middleware("http")
async def security_headers_middleware(request, call_next):
    response = await call_next(request)

    # Basic hardening headers for browsers consuming this API.
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=*, camera=*"

    # Only enable HSTS when actually running over HTTPS or in production mode.
    # In production, HSTS should always be enforced (requires HTTPS).
    if request.url.scheme == "https" or (ENVIRONMENT == "production" and not DEBUG_MODE):
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"

    return response

# CORS: use configured origins from config.py
cors_origins = CORS_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

from app.routes.signaling import sio_app

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(appointments.router)
api_router.include_router(doctors.router)
api_router.include_router(payments.router)
api_router.include_router(admin.router)
api_router.include_router(medical_records.router)
api_router.include_router(prescriptions.router)
api_router.include_router(notifications.router)
api_router.include_router(messages.router)
api_router.include_router(assistant.router)
api_router.include_router(health_goals.router)

app.include_router(api_router)
app.mount("/ws", sio_app)

@app.get("/")
def root():
    return {"message": "Backend is running!"}
