import os
import logging

from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.models import user, appointment, time_slot
from app.routes import auth, users, appointments, doctors, payments, admin, medical_records, prescriptions, notifications

log = logging.getLogger("hospital")
logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown hooks."""
    # ── Create tables ──────────────────────────────────────────────────────
    from app.models import user, appointment, time_slot, medical_record, prescription, notification
    Base.metadata.create_all(bind=engine)
    log.info("Database tables ensured.")

    # ── Auto-seed if empty ─────────────────────────────────────────────────
    try:
        from seed_database import seed_database
        seed_database()
    except Exception as e:
        log.warning("Auto-seed skipped or failed: %s", e)

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

    # Only enable HSTS when actually running over HTTPS.
    if request.url.scheme == "https":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"

    return response

# CORS: allow only known origins and required headers.
_cors_origins_env = os.getenv("CORS_ORIGINS", "http://localhost:3000")
cors_origins = [o.strip() for o in _cors_origins_env.split(",") if o.strip()]

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

app.include_router(api_router)
app.mount("/ws", sio_app)

@app.get("/")
def root():
    return {"message": "Backend is running!"}
