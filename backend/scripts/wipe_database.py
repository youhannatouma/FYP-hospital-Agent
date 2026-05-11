import os
import sys
# pyrefly: ignore [missing-import]
from sqlalchemy import text
# pyrefly: ignore [missing-import]

# Ensure the backend package is importable
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.database import SessionLocal, engine, Base

def wipe_database():
    print("Connecting to database...")
    db = SessionLocal()
    try:
        print("Dropping all records from tables...")
        # Order matters due to foreign keys
        tables = [
            "notifications",
            "payments",
            "prescriptions",
            "medical_records",
            "appointments",
            "time_slots",
            "pharmacy_inventory",
            "medications",
            "pharmacies",
            "users"
        ]
        
        for table in tables:
            try:
                db.execute(text(f"TRUNCATE TABLE {table} RESTART IDENTITY CASCADE;"))
                print(f"  - Truncated {table}")
            except Exception as e:
                print(f"  - Skip {table} (might not exist): {str(e)}")
        
        db.commit()
        print("Database wiped successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error wiping database: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    wipe_database()
