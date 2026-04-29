"""
Database Seed Script
--------------------
Populates the hospital database with realistic data:
  - 1 Admin
  - 8 Doctors (one per specialty)
  - 5 Patients
  - Time slots for each doctor (2 weeks, Mon–Fri, 9 AM–5 PM, 30-min intervals)
  - 3 Sample appointments

Idempotent: skips seeding if doctors already exist.
Can be run standalone or imported and called from app.main.

Usage (standalone):
    cd backend
    ..\.venv\Scripts\python.exe seed_database.py
"""

import sys
import os
from datetime import datetime, timedelta, date
from uuid import uuid4

# Ensure the backend package is importable when running standalone
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.time_slot import TimeSlot
from app.models.appointment import Appointment
from app.models.medical_record import MedicalRecord
from app.models.prescription import Prescription
from app.models.payment import Payment
from app.models.notification import Notification
from app.models.enums import AppointmentStatus
from app.models.invoice import Invoice

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
        "insurance_provider": "BlueCross BlueShield",
        "insurance_plan": "Premium Health Plus",
        "insurance_member_id": "BCB-4521-8837",
        "insurance_group_number": "GRP-1842",
        "insurance_deductible": 1500.0,
        "insurance_deductible_met": 820.0,
        "insurance_out_of_pocket_max": 5000.0,
        "insurance_out_of_pocket_used": 235.0,
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


def seed_database():
    """
    Populate the database with realistic seed data.
    Idempotent — skips if doctors already exist.
    """
    db = SessionLocal()
    try:
        # Check if data already exists
        existing_doctors = db.query(User).filter(User.role == "doctor").count()
        if existing_doctors >= 8:
            print("[Seed] Database already seeded (found %d doctors). Skipping." % existing_doctors)
            return

        print("[Seed] Seeding database with real data...")

        # ── Admin ──────────────────────────────────────────────────────────────
        admin_exists = db.query(User).filter(User.email == ADMIN["email"]).first()
        if not admin_exists:
            admin_user = User(**ADMIN)
            db.add(admin_user)
            print("[Seed]   + Admin: %s" % ADMIN["email"])
        else:
            print("[Seed]   ~ Admin already exists")

        # ── Doctors ────────────────────────────────────────────────────────────
        doctor_records = []
        for doc_data in DOCTORS:
            existing = db.query(User).filter(User.email == doc_data["email"]).first()
            if existing:
                doctor_records.append(existing)
                print("[Seed]   ~ Doctor already exists: %s" % doc_data["email"])
                continue
            doctor = User(**doc_data)
            db.add(doctor)
            db.flush()  # get the user_id assigned
            doctor_records.append(doctor)
            print("[Seed]   + Doctor: Dr. %s %s (%s)" % (doc_data["first_name"], doc_data["last_name"], doc_data["specialty"]))

        # ── Patients ───────────────────────────────────────────────────────────
        patient_records = []
        for pat_data in PATIENTS:
            existing = db.query(User).filter(User.email == pat_data["email"]).first()
            if existing:
                patient_records.append(existing)
                print("[Seed]   ~ Patient already exists: %s" % pat_data["email"])
                continue
            patient = User(**pat_data)
            db.add(patient)
            db.flush()
            patient_records.append(patient)
            print("[Seed]   + Patient: %s %s" % (pat_data["first_name"], pat_data["last_name"]))

        # ── Time Slots ─────────────────────────────────────────────────────────
        # Generate Mon–Fri, 9 AM–5 PM, 30-min slots for the next 14 days
        existing_slots = db.query(TimeSlot).count()
        if existing_slots == 0:
            today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            slot_count = 0
            for doctor in doctor_records:
                for day_offset in range(14):
                    slot_date = today + timedelta(days=day_offset)
                    # Skip weekends (5 = Saturday, 6 = Sunday)
                    if slot_date.weekday() >= 5:
                        continue
                    # 9:00 AM to 4:30 PM (last slot starts at 4:30, ends at 5:00)
                    for hour in range(9, 17):
                        for minute in [0, 30]:
                            if hour == 16 and minute == 30:
                                continue  # Skip 4:30 PM end would be 5:00 PM
                            start = slot_date.replace(hour=hour, minute=minute)
                            end = start + timedelta(minutes=30)
                            slot = TimeSlot(
                                doctor_id=doctor.user_id,
                                start_time=start,
                                end_time=end,
                                is_available=True,
                            )
                            db.add(slot)
                            slot_count += 1
            print("[Seed]   + Created %d time slots across 8 doctors" % slot_count)
        else:
            print("[Seed]   ~ Time slots already exist (%d slots)" % existing_slots)

        # ── Sample Appointments & History ──────────────────────────────────────
        existing_appointments = db.query(Appointment).count()
        if existing_appointments <= 3 and len(patient_records) >= 1 and len(doctor_records) >= 3:
            first_patient = patient_records[0]
            print("[Seed]   + Generating Clinical History for %s..." % first_patient.email)
            
            # 1. Create PREVIOUS history (Completed Appointments + Records + Prescriptions)
            # We'll use the first 3 doctors for history
            for i in range(3):
                doc = doctor_records[i]
                # Past date (e.g. 10 days ago)
                past_date = datetime.now() - timedelta(days=(10 + i))
                
                # Create a slot for the past
                past_slot = TimeSlot(
                    doctor_id=doc.user_id,
                    start_time=past_date.replace(hour=10, minute=0),
                    end_time=past_date.replace(hour=10, minute=30),
                    is_available=False
                )
                db.add(past_slot)
                db.flush()
                
                # Create completed appointment
                appt = Appointment(
                    patient_id=first_patient.user_id,
                    doctor_id=doc.user_id,
                    slot_id=past_slot.slot_id,
                    status=AppointmentStatus.completed,
                    appointment_type="Clinic Visit",
                    fee=150.0,
                    room_id=uuid4(),
                    created_at=past_date - timedelta(days=1)
                )
                db.add(appt)
                db.flush()
                
                # Create Medical Record
                record = MedicalRecord(
                    patient_id=first_patient.user_id,
                    doctor_id=doc.user_id,
                    appointment_id=appt.appointment_id,
                    record_type="Consultation",
                    diagnosis=f"Chronic {doc.specialty} follow-up",
                    treatment="Continue current treatment plan and monitor progress.",
                    clinical_notes="Patient is responding well to medication. Recommended a light exercise regimen.",
                    created_at=past_date
                )
                db.add(record)
                db.flush()
                
                # Create Prescription
                presc = Prescription(
                    doctor_id=doc.user_id,
                    patient_id=first_patient.user_id,
                    record_id=record.record_id,
                    medications=["Medication Alpha 5mg", "Beta Blocker 10mg"],
                    instructions="Take one tablet every morning after breakfast.",
                    expiry_date=(date.today() + timedelta(days=30)),
                    created_at=past_date
                )
                db.add(presc)
                print("[Seed]     * Record created: Dr %s (%s)" % (doc.last_name, doc.specialty))

            # 2. Create FUTURE appointments (Scheduled)
            # Use the 4th and 5th doctors for future
            for i in range(3, 5):
                doc = doctor_records[i]
                target_day = datetime.now() + timedelta(days=(i + 1))
                while target_day.weekday() >= 5: target_day += timedelta(days=1)
                
                slot = db.query(TimeSlot).filter(
                    TimeSlot.doctor_id == doc.user_id,
                    TimeSlot.is_available == True,
                    TimeSlot.start_time >= target_day.replace(hour=0, minute=0)
                ).first()
                
                if slot:
                    future_appt = Appointment(
                        patient_id=first_patient.user_id,
                        doctor_id=doc.user_id,
                        slot_id=slot.slot_id,
                        status=AppointmentStatus.scheduled,
                        appointment_type="Video Consultation",
                        fee=200.0,
                        room_id=uuid4()
                    )
                    slot.is_available = False
                    db.add(future_appt)
                    print("[Seed]     * Scheduled: Dr %s (%s)" % (doc.last_name, doc.specialty))
        else:
            print("[Seed]   ~ Clinical history already exists or insufficient records")

        # ── Invoices ──────────────────────────────────────────────────────────
        existing_invoices = db.query(Invoice).count()
        if existing_invoices == 0 and len(patient_records) >= 1:
            first_patient = patient_records[0]
            print("[Seed]   + Seeding Invoices for %s..." % first_patient.email)
            
            # Fetch completed appointments for this patient
            comp_appts = db.query(Appointment).filter(
                Appointment.patient_id == first_patient.user_id,
                Appointment.status == AppointmentStatus.completed
            ).all()
            
            for appt in comp_appts:
                doc = db.query(User).filter(User.user_id == appt.doctor_id).first()
                # Create an invoice for each completed appointment
                invoice = Invoice(
                    patient_id=first_patient.user_id,
                    appointment_id=appt.appointment_id,
                    date=appt.created_at.date(),
                    description=f"Consultation with Dr. {doc.last_name} ({doc.specialty})",
                    provider=f"Hospital Clinic - {doc.specialty}",
                    total_amount=appt.fee or 150.0,
                    insurance_paid=(appt.fee or 150.0) * 0.8, # Assume 80% coverage
                    patient_due=(appt.fee or 150.0) * 0.2,   # Assume 20% due
                    status="Due" if appt == comp_appts[0] else "Paid", # Make one due
                    due_date=appt.created_at.date() + timedelta(days=30)
                )
                db.add(invoice)
                
            print("[Seed]   + Created %d invoices" % len(comp_appts))

        db.commit()
        print("[Seed] Database seeding completed successfully!")

    except Exception as e:
        db.rollback()
        print("[Seed] Error during seeding: %s" % str(e))
        raise
    finally:
        db.close()


if __name__ == "__main__":
    # When run standalone, ensure tables exist first
    Base.metadata.create_all(bind=engine)
    seed_database()
