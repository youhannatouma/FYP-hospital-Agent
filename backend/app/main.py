from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.models import user, appointment
from app.routes import auth, users, appointments

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Hospital Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(appointments.router)

@app.get("/")
def root():
    return {"message": "Backend is running!"}
