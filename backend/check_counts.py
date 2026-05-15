import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv(".env")
db_url = os.getenv("DATABASE_URL")
if db_url and "db:5432" in db_url:
    db_url = db_url.replace("db:5432", "localhost:5433")

engine = create_engine(db_url)
with engine.connect() as conn:
    mr = conn.execute(text("SELECT count(1) FROM medical_record")).fetchone()[0]
    pr = conn.execute(text("SELECT count(1) FROM prescription")).fetchone()[0]
    ms = conn.execute(text("SELECT count(1) FROM messages")).fetchone()[0]
    pt = conn.execute(text("SELECT count(1) FROM usr WHERE role='patient'")).fetchone()[0]
    
    print(f"Patients: {pt}")
    print(f"Medical Records: {mr}")
    print(f"Prescriptions: {pr}")
    print(f"Messages: {ms}")
