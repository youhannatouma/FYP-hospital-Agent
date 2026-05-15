import os
import sys
import uuid
from datetime import datetime, timedelta, date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Add app to path
sys.path.append(os.getcwd())

from app.models.user import User
from app.models.medical_record import MedicalRecord
from app.models.prescription import Prescription
from app.models.appointment import Appointment
from app.models.time_slot import TimeSlot
from app.models.message import Message
from app.models.enums import AppointmentStatus

load_dotenv(".env")
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and "db:5432" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("db:5432", "localhost:5433")

if not DATABASE_URL:
    DATABASE_URL = "postgresql://postgres:1234567890@localhost:5433/FYP"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed_clinical_data():
    db = SessionLocal()
    try:
        # Get all patients
        patients = db.query(User).filter(User.role == "patient").all()
        doctors = db.query(User).filter(User.role == "doctor").all()
        
        if not patients or not doctors:
            print("No patients or doctors found. Run main seed script first.")
            return

        print(f"Found {len(patients)} patients and {len(doctors)} doctors.")

        for patient in patients:
            # Check existing records
            record_count = db.query(MedicalRecord).filter(MedicalRecord.patient_id == patient.user_id).count()
            if record_count >= 5:
                # Still check messages even if records exist
                msg_count = db.query(Message).filter(Message.receiver_id == patient.user_id).count()
                if msg_count >= 3:
                    print(f"Patient {patient.email} already has clinical data. Skipping.")
                    continue

            print(f"Seeding clinical history for {patient.first_name} {patient.last_name} ({patient.email})...")
            
            # Create records if they don't exist
            if record_count < 5:
                for i in range(8):
                    doc = doctors[i % len(doctors)]
                    days_ago = (i + 1) * 20
                    past_date = datetime.now() - timedelta(days=days_ago)
                    
                    # 1. Past Slot
                    past_slot = TimeSlot(
                        doctor_id=doc.user_id,
                        start_time=past_date.replace(hour=10, minute=0),
                        end_time=past_date.replace(hour=10, minute=30),
                        is_available=False
                    )
                    db.add(past_slot)
                    db.flush()

                    # 2. Completed Appointment
                    appt = Appointment(
                        patient_id=patient.user_id,
                        doctor_id=doc.user_id,
                        slot_id=past_slot.slot_id,
                        status=AppointmentStatus.completed,
                        appointment_type="Clinic Visit" if i % 2 == 0 else "Video Consultation",
                        fee=150.0 + (i * 10),
                        room_id=uuid.uuid4(),
                        created_at=past_date - timedelta(days=1)
                    )
                    db.add(appt)
                    db.flush()

                    # 3. Medical Record with Vitals
                    record_type = "Consultation"
                    if i == 2: record_type = "Lab Result"
                    if i == 5: record_type = "Radiology"
                    
                    vitals = {
                        "systolic": 110 + (i * 2),
                        "diastolic": 70 + (i % 5),
                        "heart_rate": 65 + (i * 1),
                        "oxygen": 97 + (i % 3),
                        "weight": 70 + (i % 10),
                        "temp": 36.6 + (i * 0.1)
                    }

                    record = MedicalRecord(
                        patient_id=patient.user_id,
                        doctor_id=doc.user_id,
                        appointment_id=appt.appointment_id,
                        record_type=record_type,
                        diagnosis=f"Follow-up for {doc.specialty} concerns" if i > 0 else "Initial Evaluation",
                        treatment="Continue prescribed regimen." if i % 2 == 0 else "Observe and report changes.",
                        clinical_notes=f"Patient reports feeling well. Vitals are within normal limits for {patient.first_name}.",
                        vitals=vitals,
                        created_at=past_date
                    )
                    db.add(record)
                    db.flush()

                    # 4. Prescription
                    if i % 2 == 0:
                        meds = ["Aspirin 81mg", "Vitamin D 2000IU"] if i == 0 else [f"Medication {chr(65+i)} 10mg"]
                        presc = Prescription(
                            doctor_id=doc.user_id,
                            patient_id=patient.user_id,
                            record_id=record.record_id,
                            medications=meds,
                            instructions="Take once daily with food.",
                            expiry_date=(date.today() + timedelta(days=90)),
                            status="Active",
                            created_at=past_date
                        )
                        db.add(presc)

            # 5. Messages
            for i in range(3):
                doc = doctors[i % len(doctors)]
                msg = Message(
                    sender_id=doc.user_id,
                    receiver_id=patient.user_id,
                    body=f"Hello {patient.first_name}, I am following up on our last {doc.specialty} session. Please let me know if you have any questions.",
                    subject=f"Follow-up: {doc.specialty}",
                    is_read=i > 0,
                    created_at=datetime.now() - timedelta(hours=(i+1)*2)
                )
                db.add(msg)

            db.commit()
            print(f"Successfully seeded history for {patient.last_name}")

    except Exception as e:
        db.rollback()
        print(f"Error seeding clinical data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_clinical_data()
