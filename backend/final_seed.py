import sys
import os
from datetime import datetime, timedelta, date
from uuid import uuid4
# pyrefly: ignore [missing-import]
from sqlalchemy import create_engine, text
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import sessionmaker

# ─── Seed Data ───────────────────────────────────────────────────────────────

ADMIN = {
    "email": "admin@hospital-care.com",
    "first_name": "Admin",
    "last_name": "System",
    "role": "admin",
    "phone_number": "+971-50-000-0001",
    "status": "Active",
}

DOCTORS = [
    {
        "email": "dr.ahmed.cardiology@gmail.com",
        "first_name": "Ahmed",
        "last_name": "Al-Rashid",
        "role": "doctor",
        "specialty": "Cardiology",
        "license_number": "MD-CARD-2024-001",
        "years_of_experience": 15,
        "qualifications": ["MD", "FACC", "Board Certified Cardiologist"],
        "clinic_address": "Downtown Medical Center, Building A, Floor 3",
        "phone_number": "+971-50-100-0001",
        "status": "Active",
    },
    {
        "email": "dr.fatima.dermatology@gmail.com",
        "first_name": "Fatima",
        "last_name": "Hassan",
        "role": "doctor",
        "specialty": "Dermatology",
        "license_number": "MD-DERM-2024-002",
        "years_of_experience": 10,
        "qualifications": ["MD", "Board Certified Dermatologist", "Fellow AAD"],
        "clinic_address": "SkinCare Clinic, Sheikh Zayed Road, Suite 501",
        "phone_number": "+971-50-100-0002",
        "status": "Active",
    },
    {
        "email": "dr.omar.orthopedics@gmail.com",
        "first_name": "Omar",
        "last_name": "Khalil",
        "role": "doctor",
        "specialty": "Orthopedics",
        "license_number": "MD-ORTH-2024-003",
        "years_of_experience": 12,
        "qualifications": ["MD", "MS Orthopedics", "Fellow AAOS"],
        "clinic_address": "Bone & Joint Center, JBR Walk, Level 2",
        "phone_number": "+971-50-100-0003",
        "status": "Active",
    },
    {
        "email": "dr.sarah.pediatrics@gmail.com",
        "first_name": "Sarah",
        "last_name": "Mansour",
        "role": "doctor",
        "specialty": "Pediatrics",
        "license_number": "MD-PEDS-2024-004",
        "years_of_experience": 8,
        "qualifications": ["MD", "Board Certified Pediatrician", "FAAP"],
        "clinic_address": "Children's Health Pavilion, Marina Mall, Floor 1",
        "phone_number": "+971-50-100-0004",
        "status": "Active",
    },
    {
        "email": "dr.youssef.neurology@gmail.com",
        "first_name": "Youssef",
        "last_name": "Nabil",
        "role": "doctor",
        "specialty": "Neurology",
        "license_number": "MD-NEUR-2024-005",
        "years_of_experience": 18,
        "qualifications": ["MD", "PhD Neuroscience", "Board Certified Neurologist"],
        "clinic_address": "Brain & Spine Institute, Healthcare City, Tower B",
        "phone_number": "+971-50-100-0005",
        "status": "Active",
    },
    {
        "email": "dr.layla.gynecology@gmail.com",
        "first_name": "Layla",
        "last_name": "Ibrahim",
        "role": "doctor",
        "specialty": "Gynecology",
        "license_number": "MD-GYNO-2024-006",
        "years_of_experience": 14,
        "qualifications": ["MD", "MRCOG", "Board Certified OB/GYN"],
        "clinic_address": "Women's Health Center, Al Wasl Road, Suite 302",
        "phone_number": "+971-50-100-0006",
        "status": "Active",
    },
    {
        "email": "dr.karim.surgery@gmail.com",
        "first_name": "Karim",
        "last_name": "Bakri",
        "role": "doctor",
        "specialty": "General Surgery",
        "license_number": "MD-SURG-2024-007",
        "years_of_experience": 20,
        "qualifications": ["MD", "FRCS", "Fellow ACS"],
        "clinic_address": "Surgical Excellence Center, Jumeirah, Building 7",
        "phone_number": "+971-50-100-0007",
        "status": "Active",
    },
    {
        "email": "dr.nadia.internalmedicine@gmail.com",
        "first_name": "Nadia",
        "last_name": "El-Amin",
        "role": "doctor",
        "specialty": "Internal Medicine",
        "license_number": "MD-INTM-2024-008",
        "years_of_experience": 11,
        "qualifications": ["MD", "Board Certified Internist", "FACP"],
        "clinic_address": "General Medicine Clinic, Business Bay, Level 4",
        "phone_number": "+971-50-100-0008",
        "status": "Active",
    },
]

PATIENTS = [
    {
        "email": "sarah.johnson@email.com",
        "first_name": "Sarah",
        "last_name": "Johnson",
        "role": "patient",
        "phone_number": "+971-55-123-4567",
        "date_of_birth": date(1990, 3, 15),
        "gender": "Female",
        "blood_type": "O+",
        "address": "456 Elm Street, Apt 12, Dubai Marina",
        "allergies": ["Penicillin", "Sulfa Drugs"],
        "chronic_conditions": ["Hypertension"],
        "emergency_contact": "John Johnson (+971-55-987-6543)",
        "status": "Active",
    },
    {
        "email": "mohammed.ali@email.com",
        "first_name": "Mohammed",
        "last_name": "Ali",
        "role": "patient",
        "phone_number": "+971-55-234-5678",
        "date_of_birth": date(1985, 7, 22),
        "gender": "Male",
        "blood_type": "A+",
        "address": "789 Palm Avenue, JBR, Dubai",
        "allergies": ["Aspirin"],
        "chronic_conditions": ["Type 2 Diabetes"],
        "emergency_contact": "Aisha Ali (+971-55-876-5432)",
        "status": "Active",
    },
    {
        "email": "emily.chen@email.com",
        "first_name": "Emily",
        "last_name": "Chen",
        "role": "patient",
        "phone_number": "+971-55-345-6789",
        "date_of_birth": date(1995, 11, 8),
        "gender": "Female",
        "blood_type": "B+",
        "address": "321 Marina Walk, Tower C, Floor 15",
        "allergies": [],
        "chronic_conditions": [],
        "emergency_contact": "David Chen (+971-55-765-4321)",
        "status": "Active",
    },
    {
        "email": "rashid.khan@email.com",
        "first_name": "Rashid",
        "last_name": "Khan",
        "role": "patient",
        "phone_number": "+971-55-456-7890",
        "date_of_birth": date(1978, 1, 30),
        "gender": "Male",
        "blood_type": "AB-",
        "address": "654 Business Bay Blvd, Suite 2201",
        "allergies": ["Latex", "Ibuprofen"],
        "chronic_conditions": ["Asthma", "Hyperlipidemia"],
        "emergency_contact": "Fatima Khan (+971-55-654-3210)",
        "status": "Active",
    },
    {
        "email": "anna.martinez@email.com",
        "first_name": "Anna",
        "last_name": "Martinez",
        "role": "patient",
        "phone_number": "+971-55-567-8901",
        "date_of_birth": date(2000, 5, 17),
        "gender": "Female",
        "blood_type": "O-",
        "address": "111 Al Wasl Road, Villa 45",
        "allergies": [],
        "chronic_conditions": [],
        "emergency_contact": "Carlos Martinez (+971-55-543-2109)",
        "status": "Active",
    },
]

# (Omitting medication catalog for brevity but would normally include)

def seed_database():
    database_url = os.getenv("DATABASE_URL", "postgresql://postgres:1234567890@db:5432/FYP")
    print(f"[Seed] Connecting to: {database_url}")
    engine = create_engine(database_url)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    # Ensure models are loaded
    sys.path.insert(0, os.path.dirname(__file__))
    from app.database import Base
    from app.models.user import User
    from app.models.time_slot import TimeSlot
    
    try:
        # 1. Force creation
        print("[Seed] Initializing tables...")
        Base.metadata.create_all(bind=engine)

        # 2. Seed Admin
        admin = User(**ADMIN)
        db.add(admin)
        print(f"[Seed] Added Admin: {admin.email}")

        # 3. Seed Doctors
        for d in DOCTORS:
            doc = User(**d)
            db.add(doc)
            print(f"[Seed] Added Doctor: {doc.email}")

        # 4. Seed Patients
        for p in PATIENTS:
            pat = User(**p)
            db.add(pat)
            print(f"[Seed] Added Patient: {pat.email}")

        db.commit()
        print("[Seed] Seeding completed successfully.")
    except Exception as e:
        db.rollback()
        print(f"[Seed] Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
