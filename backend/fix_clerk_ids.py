import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Add app to path if needed
sys.path.append(os.getcwd())

# Import models
from app.models.user import User

def fix_clerk_ids():
    # load_dotenv() # Load from current dir or parents
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        # Fallback to docker default
        database_url = "postgresql://postgres:1234567890@db:5432/FYP"
    
    print(f"[Fix] Connecting to: {database_url}")
    engine = create_engine(database_url)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        # Find users with NULL clerk_id
        users_to_fix = db.query(User).filter(User.clerk_id == None).all()
        
        if not users_to_fix:
            print("[Fix] No users found with missing clerk_id.")
            return

        print(f"[Fix] Found {len(users_to_fix)} users to update.")
        
        updated_count = 0
        for user in users_to_fix:
            prefix = user.email.split('@')[0].replace('.', '_').replace('-', '_')
            user.clerk_id = f"user_seed_{prefix}"
            updated_count += 1
            if updated_count % 10 == 0:
                print(f"[Fix] Progress: {updated_count}/{len(users_to_fix)}...")
        
        db.commit()
        print(f"[Fix] SUCCESS: Updated {updated_count} users.")
        
    except Exception as e:
        db.rollback()
        print(f"[Fix] ERROR: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fix_clerk_ids()
