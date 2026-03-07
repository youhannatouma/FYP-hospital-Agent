from jose import jwt
from datetime import datetime, timedelta
from app.config import SECRET_KEY

ALGORITHM = "HS256"

def create_token(data: dict):
    to_encode = data.copy()
    to_encode["exp"] = datetime.utcnow() + timedelta(hours=12)
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
