import os
# pyrefly: ignore [missing-import]
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://postgres:1234567890@db:5432/FYP"
engine = create_engine(DATABASE_URL)

def manual_test():
    with engine.connect() as conn:
        print("Inserting test user...")
        conn.execute(text("""
            INSERT INTO usr (user_id, email, role, first_name, last_name, status) 
            VALUES ('00000000-0000-0000-0000-000000000001', 'test@example.com', 'doctor', 'Test', 'Doctor', 'Active')
        """))
        conn.commit()
        print("Manual insert success.")

if __name__ == "__main__":
    manual_test()
