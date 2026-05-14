import os
import sys
import uuid
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Add app to path
sys.path.append(os.getcwd())

from app.models.user import User
from app.models.health_goal import HealthGoal

load_dotenv(".env")
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and "db:5432" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("db:5432", "localhost:5433")

if not DATABASE_URL:
    DATABASE_URL = "postgresql://postgres:1234567890@localhost:5433/FYP"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed_goals():
    db = SessionLocal()
    try:
        patients = db.query(User).filter(User.role == "patient").all()
        if not patients:
            print("No patients found.")
            return

        for patient in patients:
            # Check existing
            if db.query(HealthGoal).filter(HealthGoal.patient_id == patient.user_id).count() > 0:
                continue

            print(f"Seeding goals for {patient.email}...")
            
            goals = [
                {
                    "title": "Lower Cholesterol",
                    "target_value": "LDL < 130 mg/dL",
                    "current_value": "165 mg/dL",
                    "progress_percentage": 73,
                    "category": "Lipids",
                    "description": "Improve lipid profile through diet and exercise."
                },
                {
                    "title": "Weight Optimization",
                    "target_value": "70 kg",
                    "current_value": "75 kg",
                    "progress_percentage": 60,
                    "category": "Weight",
                    "description": "Reach target weight to reduce metabolic strain."
                }
            ]

            for g_data in goals:
                goal = HealthGoal(
                    patient_id=patient.user_id,
                    title=g_data["title"],
                    target_value=g_data["target_value"],
                    current_value=g_data["current_value"],
                    progress_percentage=g_data["progress_percentage"],
                    category=g_data["category"],
                    description=g_data["description"]
                )
                db.add(goal)
            
            db.commit()

        print("Goals seeded successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding goals: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_goals()
