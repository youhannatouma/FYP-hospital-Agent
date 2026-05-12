import os
from pathlib import Path
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parents[1]
REPO_ROOT = BACKEND_DIR.parent

# Root .env is useful for Docker Compose substitutions; backend/.env should
# win for host-run development because it can point at 127.0.0.1 instead of db.
load_dotenv(REPO_ROOT / ".env")
load_dotenv(BACKEND_DIR / ".env", override=False)

# Environment detection (development, staging, production)
ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()
DEBUG_MODE = ENVIRONMENT != "production"

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("Missing required environment variable: DATABASE_URL")

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("Missing required environment variable: SECRET_KEY")

ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# CORS configuration with environment awareness
def get_cors_origins():
    """Get CORS origins with production safety checks."""
    if ENVIRONMENT == "production":
        cors_env = os.getenv("CORS_ORIGINS", "").strip()
        if not cors_env:
            raise RuntimeError(
                "CORS_ORIGINS required in production. "
                "Format: 'https://example.com,https://api.example.com'"
            )
        return [o.strip() for o in cors_env.split(",") if o.strip()]
    else:
        # Development: allow localhost
        return [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]

CORS_ORIGINS = get_cors_origins() 
