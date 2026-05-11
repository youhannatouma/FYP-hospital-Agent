import os
import sys
# pyrefly: ignore [missing-import]
from clerk_backend_api import Clerk

# Get key from environment
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")

if not CLERK_SECRET_KEY:
    print("Error: CLERK_SECRET_KEY not found in environment.")
    sys.exit(1)

# Initialize Clerk client
client = Clerk(bearer_auth=CLERK_SECRET_KEY)

def delete_all_users():
    print("Fetching users from Clerk...")
    try:
        # Fetch up to 100 users
        users = client.users.list_users(limit=100)
        
        if not users:
            print("No users found in Clerk.")
            return

        print(f"Found {len(users)} users. Starting deletion...")
        
        deleted_count = 0
        for user in users:
            try:
                email = user.email_addresses[0].email_address if user.email_addresses else "No Email"
                client.users.delete_user(user_id=user.id)
                print(f"Successfully deleted: {email} ({user.id})")
                deleted_count += 1
            except Exception as e:
                print(f"Failed to delete {user.id}: {str(e)}")
        
        print(f"Finished. Total deleted: {deleted_count}")
        
    except Exception as e:
        print(f"Error communicating with Clerk: {str(e)}")

if __name__ == "__main__":
    delete_all_users()
