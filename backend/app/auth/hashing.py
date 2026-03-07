from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"])

def hash_password(password: str) -> str:
    if len(password) > 72:
        password = password[:72]  # Truncate if needed
    return pwd_context.hash(password)

def verify_password(password: str, hashed: str):
    return pwd_context.verify(password, hashed)
