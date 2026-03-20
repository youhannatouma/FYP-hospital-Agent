import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.models import user, appointment, time_slot
from app.routes import auth, users, appointments, doctors, payments, admin

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Hospital Backend")

# mount all routers under a common api prefix to match frontend baseURL
from fastapi import APIRouter
api_router = APIRouter(prefix="/api")

@app.middleware("http")
async def security_headers_middleware(request, call_next):
    response = await call_next(request)

    # Basic hardening headers for browsers consuming this API.
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"

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
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(appointments.router)
api_router.include_router(doctors.router)
api_router.include_router(payments.router)
api_router.include_router(admin.router)

app.include_router(api_router)

@app.get("/")
def root():
    return {"message": "Backend is running!"}
