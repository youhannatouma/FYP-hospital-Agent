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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routes.signaling import sio_app

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(appointments.router)
api_router.include_router(doctors.router)
api_router.include_router(payments.router)
api_router.include_router(admin.router)

app.include_router(api_router)
app.mount("/ws", sio_app)

@app.get("/")
def root():
    return {"message": "Backend is running!"}
