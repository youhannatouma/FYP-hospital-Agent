from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError


DB_USER = "postgres"
DB_PASSWORD = "1234567890"
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "FYP"

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL)


app = FastAPI(title="MyApp Backend")

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
