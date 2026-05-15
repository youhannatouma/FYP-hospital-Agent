import os
from pathlib import Path
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parents[1]
REPO_ROOT = BACKEND_DIR.parent

# Root .env is useful for Docker Compose substitutions; backend/.env should
# win for host-run development because it can point at 127.0.0.1 instead of db.
# Only override if we aren't already given a DATABASE_URL (useful for Docker/CI)
load_dotenv(REPO_ROOT / ".env")
load_dotenv(BACKEND_DIR / ".env", override=os.getenv("DATABASE_URL") is None)

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

# Encryption at rest
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
if ENVIRONMENT == "production" and not ENCRYPTION_KEY:
    raise RuntimeError(
        "Missing required environment variable: ENCRYPTION_KEY. "
        "Generate with: python -c \"from cryptography.fernet import Fernet; "
        "print(Fernet.generate_key().decode())\""
    )

# Redis configuration for distributed rate limiting
REDIS_ENABLED = os.getenv("REDIS_ENABLED", "false").lower() in {"true", "1", "yes"}
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Password policy settings
MIN_PASSWORD_LENGTH = int(os.getenv("MIN_PASSWORD_LENGTH", "12"))
MAX_PASSWORD_LENGTH = int(os.getenv("MAX_PASSWORD_LENGTH", "128"))
PASSWORD_EXPIRATION_DAYS = int(os.getenv("PASSWORD_EXPIRATION_DAYS", "0")) or None  # 0 = no expiration
PASSWORD_HISTORY_COUNT = int(os.getenv("PASSWORD_HISTORY_COUNT", "5"))

# Audit logging configuration
AUDIT_LOG_RETENTION_DAYS = int(os.getenv("AUDIT_LOG_RETENTION_DAYS", "365"))
AUDIT_LOG_ENABLED = os.getenv("AUDIT_LOG_ENABLED", "true").lower() in {"true", "1", "yes"}

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
        # Development: allow localhost and env overrides
        cors_env = os.getenv("CORS_ORIGINS", "").strip()
        defaults = ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"]
        if cors_env:
            defaults.extend([o.strip() for o in cors_env.split(",") if o.strip()])
        return list(set(defaults))

CORS_ORIGINS = get_cors_origins() 
