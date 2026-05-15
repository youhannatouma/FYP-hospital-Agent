import sys
import os
import random
from datetime import datetime, timedelta, date
from uuid import uuid4

# Ensure the backend package is importable
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.time_slot import TimeSlot
from app.models.appointment import Appointment
from app.models.medical_record import MedicalRecord
from app.models.prescription import Prescription
from app.models.health_goal import HealthGoal
from app.models.pharmacy import Medication, Pharmacy, PharmacyInventory

# Data pools for generation
FIRST_NAMES = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Christopher", "Karen"]
LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"]
SPECIALTIES = ["Cardiology", "Dermatology", "Orthopedics", "Pediatrics", "Neurology", "Gynecology", "General Surgery", "Internal Medicine", "Psychiatry", "Endocrinology"]
RECORD_TYPES = ["Consultation", "Lab Result", "Surgery", "Follow-up", "Imaging", "Vaccination"]
DIAGNOSES = ["Chronic Hypertension", "Type 2 Diabetes", "Mild Asthma", "Lower Back Pain", "Vitamin D Deficiency", "Seasonal Allergies", "Acute Bronchitis", "Hyperlipidemia"]

def generate_phone():
    return f"+971-50-{random.randint(100, 999)}-{random.randint(1000, 9999)}"

def seed_massive_data():
    db = SessionLocal()
    try:
        print("[MassiveSeed] Initializing massive data generation...")
        
        # Ensure tables exist
        Base.metadata.create_all(bind=engine)
        print("[MassiveSeed] Tables verified.")
        doctors = []
        for i in range(20):
            email = f"doctor.{i}@hospital-care.com"
            existing = db.query(User).filter(User.email == email).first()
            if existing:
                doctors.append(existing)
                continue
            
            doc = User(
                email=email,
                first_name=random.choice(FIRST_NAMES),
                last_name=random.choice(LAST_NAMES),
                role="doctor",
                specialty=random.choice(SPECIALTIES),
                license_number_encrypted=f"LIC-{random.randint(10000, 99999)}",
                years_of_experience=random.randint(5, 30),
                qualifications=["MD", "Board Certified"],
                clinic_address_encrypted=f"Building {random.randint(1, 10)}, Suite {random.randint(100, 500)}",
                phone_number_plaintext=generate_phone(),
                status="Active"
            )
            db.add(doc)
            db.flush()
            doctors.append(doc)
        print(f"[MassiveSeed] Generated {len(doctors)} doctors.")

        # 2. Generate 100 Patients
        patients = []
        # Include current users who might be in the system but have no data
        existing_patients = db.query(User).filter(User.role == "patient").all()
        patients.extend(existing_patients)
        
        for i in range(100):
            email = f"patient.{i}@test-user.com"
            existing = db.query(User).filter(User.email == email).first()
            if existing:
                patients.append(existing)
                continue
            
            pat = User(
                email=email,
                first_name=random.choice(FIRST_NAMES),
                last_name=random.choice(LAST_NAMES),
                role="patient",
                phone_number_plaintext=generate_phone(),
                date_of_birth=date(random.randint(1960, 2010), random.randint(1, 12), random.randint(1, 28)),
                gender=random.choice(["Male", "Female", "Other"]),
                blood_type=random.choice(["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"]),
                address=f"{random.randint(1, 999)} {random.choice(LAST_NAMES)} St, Dubai",
                allergies=random.sample(["Penicillin", "Peanuts", "Latex", "Aspirin"], random.randint(0, 2)),
                chronic_conditions=random.sample(DIAGNOSES, random.randint(0, 2)),
                status="Active"
            )
            db.add(pat)
            db.flush()
            patients.append(pat)
        print(f"[MassiveSeed] Generated/Linked {len(patients)} patients.")

        # 3. Generate Clinical History (Records, Appointments, Prescriptions)
        print("[MassiveSeed] Generating clinical history for all patients...")
        record_count = 0
        appt_count = 0
        
        for patient in patients:
            # Each patient gets 5-15 historical records
            num_records = random.randint(5, 15)
            for j in range(num_records):
                doc = random.choice(doctors)
                past_date = datetime.now() - timedelta(days=random.randint(1, 730))
                
                # Medical Record
                record = MedicalRecord(
                    patient_id=patient.user_id,
                    doctor_id=doc.user_id,
                    record_type=random.choice(RECORD_TYPES),
                    title=f"{random.choice(RECORD_TYPES)}: {doc.specialty}",
                    diagnosis=random.choice(DIAGNOSES),
                    treatment="Follow-up in 3 months. Maintain current medications.",
                    clinical_notes="Patient reporting stable condition. Vitals within normal range.",
                    vitals={
                        "systolic": random.randint(110, 140),
                        "diastolic": random.randint(70, 90),
                        "heart_rate": random.randint(60, 100),
                        "oxygen": random.randint(95, 100)
                    },
                    created_at=past_date
                )
                db.add(record)
                db.flush()
                record_count += 1
                
                # Prescription (50% chance per record)
                if random.random() > 0.5:
                    presc = Prescription(
                        patient_id=patient.user_id,
                        doctor_id=doc.user_id,
                        record_id=record.record_id,
                        medications=[f"Medication {random.choice(['X', 'Y', 'Z'])} {random.randint(5, 50)}mg"],
                        instructions="Take once daily after meals.",
                        expiry_date=(date.today() + timedelta(days=90)),
                        status="Active",
                        created_at=past_date
                    )
                    db.add(presc)

                # Past Appointment for this record
                past_slot = TimeSlot(
                    doctor_id=doc.user_id,
                    start_time=past_date,
                    end_time=past_date + timedelta(minutes=30),
                    is_available=False
                )
                db.add(past_slot)
                db.flush()
                
                appt = Appointment(
                    patient_id=patient.user_id,
                    doctor_id=doc.user_id,
                    slot_id=past_slot.slot_id,
                    status="completed",
                    appointment_type=random.choice(["Clinic Visit", "Video Consultation"]),
                    fee=float(random.randint(100, 500)),
                    room_id=uuid4(),
                    created_at=past_date - timedelta(days=7)
                )
                db.add(appt)
                appt_count += 1

            # Future Appointments (1-2 per patient)
            for k in range(random.randint(1, 2)):
                doc = random.choice(doctors)
                future_date = datetime.now() + timedelta(days=random.randint(1, 30))
                
                future_slot = TimeSlot(
                    doctor_id=doc.user_id,
                    start_time=future_date.replace(hour=random.randint(9, 16), minute=random.choice([0, 30])),
                    end_time=future_date + timedelta(minutes=30),
                    is_available=False
                )
                db.add(future_slot)
                db.flush()
                
                future_appt = Appointment(
                    patient_id=patient.user_id,
                    doctor_id=doc.user_id,
                    slot_id=future_slot.slot_id,
                    status="scheduled",
                    appointment_type=random.choice(["Clinic Visit", "Video Consultation"]),
                    fee=float(random.randint(150, 600)),
                    room_id=uuid4()
                )
                db.add(future_appt)
                appt_count += 1
                
            # Health Goals (1-3 per patient)
            for l in range(random.randint(1, 3)):
                goal = HealthGoal(
                    patient_id=patient.user_id,
                    title=f"{random.choice(['Reduce', 'Maintain', 'Improve'])} {random.choice(['Weight', 'Steps', 'Hydration', 'Sleep'])}",
                    description="Strategically managed goal for lifestyle optimization.",
                    target_value=str(random.randint(70, 100)),
                    current_value=str(random.randint(20, 70)),
                    status=random.choice(["Active", "Completed"]),
                    progress_percentage=random.randint(10, 95),
                    created_at=datetime.now() - timedelta(days=random.randint(1, 30))
                )
                db.add(goal)

        db.commit()
        print(f"[MassiveSeed] SUCCESS: Generated {record_count} records and {appt_count} appointments.")

    except Exception as e:
        import traceback
        traceback.print_exc()
        db.rollback()
        print(f"[MassiveSeed] ERROR: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_massive_data()
