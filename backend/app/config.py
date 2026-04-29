import os
from pathlib import Path
from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parents[1]
REPO_ROOT = BACKEND_DIR.parent

# Root .env is useful for Docker Compose substitutions; backend/.env should
# win for host-run development because it can point at 127.0.0.1 instead of db.
load_dotenv(REPO_ROOT / ".env")
load_dotenv(BACKEND_DIR / ".env", override=True)

DATABASE_URL = os.getenv("DATABASE_URL")

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("Missing required environment variable: SECRET_KEY")

ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = 60 
