import sys
import os

# Ensure the backend package is importable
sys.path.insert(0, os.path.dirname(__file__))

from app.database import engine, Base
from app.models import user, appointment, time_slot, medical_record, prescription, notification, message, chat, pharmacy, workflow_trace_event, audit_log, health_goal

def create_tables():
    print("[Tables] Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("[Tables] DONE.")

if __name__ == "__main__":
    create_tables()
