import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv(".env")
DATABASE_URL = os.getenv("DATABASE_URL")
if "db:5432" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("db:5432", "localhost:5433")

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    # List all columns in 'message'
    result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'message'"))
    print(f"Columns in 'message' table: {[row[0] for row in result]}")
    
    # Check if any messages exist
    result = conn.execute(text("SELECT count(*) FROM message"))
    print(f"Total messages: {result.scalar()}")
