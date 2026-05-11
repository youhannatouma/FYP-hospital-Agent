import os
import sys
import random
import time
import uuid
# pyrefly: ignore [missing-import]
from clerk_backend_api import Clerk
# pyrefly: ignore [missing-import]
from sqlalchemy import create_engine, text

# Configuration
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY", "sk_test_IACjDK1hYiFFtdsNlDlJDYx71dIZ83XjxjJK2NtQSh")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:1234567890@db:5432/FYP")

# Initialize Clients
clerk = Clerk(bearer_auth=CLERK_SECRET_KEY)
engine = create_engine(DATABASE_URL)

# Synthetic Data Components
FIRST_NAMES = ["Ahmed", "Fatima", "Omar", "Sarah", "Youssef", "Layla", "Karim", "Nadia", "John", "Emily", "David", "Anna", "Michael", "Sophia", "Robert", "Isabella"]
LAST_NAMES = ["Al-Rashid", "Hassan", "Khalil", "Mansour", "Nabil", "Ibrahim", "Bakri", "El-Amin", "Johnson", "Smith", "Chen", "Martinez", "Williams", "Brown", "Jones", "Garcia"]
SPECIALTIES = ["Cardiology", "Dermatology", "Orthopedics", "Pediatrics", "Neurology", "Gynecology", "General Surgery", "Internal Medicine", "Psychiatry", "Ophthalmology"]

def generate_user_data(role, index):
    first = random.choice(FIRST_NAMES)
    last = random.choice(LAST_NAMES)
    email = f"{role}.{index}.{uuid.uuid4().hex[:6]}@hospital-seed.com"
    return {
        "first_name": first,
        "last_name": last,
        "email": email,
        "role": role,
        "password": "Password_Seed_2026_FYP!", # Secure password to pass Clerk's breach check
        "specialty": random.choice(SPECIALTIES) if role == "doctor" else None
    }

def mass_seed():
    print(f"Starting mass seed of 25 doctors and 75 patients (Clerk Dev Limit: 100)...")
    
    users_to_create = []
    # Generate 25 Doctors
    for i in range(25):
        users_to_create.append(generate_user_data("doctor", i))
    
    # Generate 75 Patients
    for i in range(75):
        users_to_create.append(generate_user_data("patient", i))

    count = 0
    batch_size = 10 # Small batches to handle rate limits and DB commits
    
    for i in range(0, len(users_to_create), batch_size):
        batch = users_to_create[i:i+batch_size]
        db_records = []
        
        for user_data in batch:
            retries = 3
            while retries > 0:
                try:
                    # 1. Create in Clerk
                    clerk_user = clerk.users.create(
                        email_address=[user_data["email"]],
                        password=user_data["password"],
                        first_name=user_data["first_name"],
                        last_name=user_data["last_name"],
                        username=user_data["email"].split('@')[0].replace('.', '_'),
                        public_metadata={"role": user_data["role"]}
                    )
                    
                    # 2. Prepare DB record
                    db_records.append({
                        "user_id": str(uuid.uuid4()),
                        "clerk_id": clerk_user.id,
                        "email": user_data["email"],
                        "first_name": user_data["first_name"],
                        "last_name": user_data["last_name"],
                        "role": user_data["role"],
                        "specialty": user_data["specialty"],
                        "status": "Active"
                    })
                    
                    count += 1
                    if count % 10 == 0:
                        print(f"Progress: {count}/{len(users_to_create)} users created...")
                    
                    # Delay to respect Clerk rate limits
                    time.sleep(1.5) 
                    break # Success, exit retry loop
                    
                except Exception as e:
                    if "429" in str(e):
                        print(f"Rate limited (429). Sleeping for 10s... (Retries left: {retries})")
                        time.sleep(10)
                        retries -= 1
                    else:
                        print(f"Error creating user {user_data['email']}: {e}")
                        break # Non-retryable error

        # 3. Bulk Insert batch into DB
        if db_records:
            try:
                with engine.connect() as conn:
                    for record in db_records:
                        conn.execute(text("""
                            INSERT INTO usr (user_id, clerk_id, email, first_name, last_name, role, specialty, status)
                            VALUES (:user_id, :clerk_id, :email, :first_name, :last_name, :role, :specialty, :status)
                        """), record)
                    conn.commit()
            except Exception as e:
                print(f"Database insertion error for batch: {e}")

    print(f"Mass seeding finished. Total users created: {count}")

if __name__ == "__main__":
    mass_seed()
