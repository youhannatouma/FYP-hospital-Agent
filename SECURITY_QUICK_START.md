# Quick Start: Security Setup Guide

This guide will help you set up and deploy the security enhancements in your development and production environments.

## 📋 Table of Contents
1. [Development Setup (5 minutes)](#development-setup)
2. [Local Testing (10 minutes)](#local-testing)
3. [Production Deployment (15 minutes)](#production-deployment)
4. [Troubleshooting](#troubleshooting)

---

## Development Setup

### Step 1: Generate Encryption Key (Optional for Dev)

```bash
# Generate a new encryption key
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

# Output example:
# gAAAAABl_vQ3...abc123...xyz789...
```

### Step 2: Create `.env` File

```bash
# Copy the example
cp .env.example .env

# Edit .env with your values
# For development, you can leave ENCRYPTION_KEY empty
```

**Minimal dev `.env`:**
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/FYP
SECRET_KEY=dev-secret-key-123456789
ALGORITHM=HS256
ENVIRONMENT=development
GOOGLE_API_KEY=test-key
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Optional: Uncomment to test encryption
# ENCRYPTION_KEY=gAAAAABl_vQ3...

# Optional: Uncomment to test with Redis
# REDIS_ENABLED=true
# REDIS_URL=redis://localhost:6379/0
```

### Step 3: Install Dependencies

```bash
# Navigate to backend
cd backend

# Install requirements (includes new security packages)
pip install -r requirements.txt

# Verify installation
python -c "import redis; import cryptography; print('✓ Security packages installed')"
```

### Step 4: Run Database Migrations

```bash
# Bootstrap schema
python scripts/db_bootstrap_schema.py

# Apply migrations
python scripts/db_apply_migrations.py

# Verify audit_log table exists
psql -U postgres -d FYP -c "\dt audit_log"
```

### Step 5: Start the Backend

```bash
# From backend directory
uvicorn app.main:app --reload

# Should see:
# Uvicorn running on http://127.0.0.1:8000
```

✅ **Development environment ready!**

---

## Local Testing

### Test 1: Password Policy

```bash
# In a new terminal, from project root
python

from app.password_policy import PasswordPolicy

# Test weak password
is_valid, error = PasswordPolicy.validate("weak")
print(f"Weak: {error}")
# Output: Password must be at least 12 characters long

# Test strong password
is_valid, error = PasswordPolicy.validate("MySecurePass123!")
score = PasswordPolicy.get_strength_score("MySecurePass123!")
print(f"Strong: {is_valid}, Score: {score}")
# Output: Strong: True, Score: 85
```

### Test 2: Rate Limiting

```bash
# Test endpoint rate limiting
for i in {1..15}; do
  curl -X POST http://localhost:8000/auth/login \
    -H "Content-Type: application/json" \
    -H "X-Forwarded-For: 192.168.1.100" \
    -d '{"email":"user@test.com","password":"test123"}' \
    2>/dev/null | grep -o '"status_code":[0-9]*\|"detail":"[^"]*"'
  sleep 0.1
done

# After request 10, should see: {"detail":"Too many requests..."}
```

### Test 3: Encryption

```python
# Test encryption/decryption
from app.encryption import EncryptionManager

em = EncryptionManager()

plaintext = "555-123-4567"
encrypted = em.encrypt(plaintext)
decrypted = em.decrypt(encrypted)

print(f"Original:  {plaintext}")
print(f"Encrypted: {encrypted[:50]}...")  # Shows first 50 chars
print(f"Decrypted: {decrypted}")
print(f"✓ Match: {plaintext == decrypted}")
```

### Test 4: Audit Logging

```python
import asyncio
from app.database import SessionLocal
from app.audit import AuditLogger
from app.models.audit_log import AuditLog

async def test_audit():
    db = SessionLocal()
    
    # Log a test event
    await AuditLogger.log_login(
        db=db,
        user_email="test@example.com",
        success=True
    )
    
    # View logged events
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(3).all()
    for log in logs:
        print(f"{log.created_at} | {log.event_type} | {log.user_email}")
    
    db.close()

asyncio.run(test_audit())
```

### Test 5: Run Security Scans

```bash
# Navigate to backend
cd backend

# Install scanning tools
pip install pip-audit safety bandit

# Run pip-audit
pip-audit --desc --skip-editable

# Run safety
safety check

# Run bandit
bandit -r app
```

✅ **All features tested!**

---

## Production Deployment

### Step 1: Pre-Deployment Checklist

```bash
# [ ] Generate encryption key
ENCRYPTION_KEY=$(python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")
echo "Generated ENCRYPTION_KEY: $ENCRYPTION_KEY"

# [ ] Run vulnerability scan
pip-audit --desc
safety check

# [ ] Run full test suite
pytest backend/tests -v

# [ ] Review changes
git diff

# [ ] Backup database
pg_dump FYP > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Set Production Environment Variables

**In your deployment platform (AWS ECS, Docker, etc.):**

```bash
# Required variables
ENVIRONMENT=production
SECRET_KEY=<generate-with-secure-random-32-bytes>
ENCRYPTION_KEY=<from-step-1>
CORS_ORIGINS=https://yourhospital.com,https://api.yourhospital.com

# Redis for rate limiting
REDIS_ENABLED=true
REDIS_URL=redis://redis-service:6379/0

# Password policy
PASSWORD_EXPIRATION_DAYS=90
PASSWORD_HISTORY_COUNT=5

# Audit logging
AUDIT_LOG_ENABLED=true
AUDIT_LOG_RETENTION_DAYS=365

# Database
DATABASE_URL=postgresql://prod_user:prod_password@prod_host:5432/FYP

# Google API
GOOGLE_API_KEY=<prod-api-key>
```

### Step 3: Docker Deployment

**Update `docker-compose.yml`:**

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    environment:
      - ENVIRONMENT=production
      - SECRET_KEY=${SECRET_KEY}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
      - DATABASE_URL=postgresql://user:pass@db:5432/FYP
      - REDIS_ENABLED=true
      - REDIS_URL=redis://redis:6379/0
      - CORS_ORIGINS=${CORS_ORIGINS}
      - PASSWORD_EXPIRATION_DAYS=90
    depends_on:
      - db
      - redis
    ports:
      - "8000:8000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:18
    environment:
      POSTGRES_DB: FYP
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:
```

### Step 4: Run Database Migrations

```bash
# From container
docker exec fyp-backend python backend/scripts/db_bootstrap_schema.py
docker exec fyp-backend python backend/scripts/db_apply_migrations.py

# Verify audit_log table
docker exec fyp-db psql -U postgres -d FYP -c "\dt audit_log"
```

### Step 5: Verify Security Features

```bash
# Check API is running
curl -s http://your-api.com/health | jq .

# Test password policy
curl -X POST http://your-api.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"weak",
    "role":"patient"
  }'
# Should return 400 with password error

# Test rate limiting
for i in {1..15}; do
  curl -s -X POST http://your-api.com/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"user@test.com","password":"test"}' | grep -o '"status_code":[0-9]*'
  sleep 0.1
done
# Should see status_code: 429 after 10 requests

# Check audit logs
docker exec fyp-db psql -U postgres -d FYP -c \
  "SELECT event_type, status, created_at FROM audit_log LIMIT 5;"
```

✅ **Production deployed!**

---

## Monitoring & Maintenance

### Daily Checks

```bash
# Monitor failed login attempts (in grafana/kibana or directly)
SELECT user_email, COUNT(*) as attempts 
FROM audit_log 
WHERE event_type = 'login_failed' 
AND created_at >= NOW() - INTERVAL '1 hour'
GROUP BY user_email
ORDER BY attempts DESC;

# Check for unauthorized access attempts
SELECT ip_address, COUNT(*) as attempts
FROM audit_log
WHERE event_type = 'unauthorized_access'
AND created_at >= NOW() - INTERVAL '24 hours'
GROUP BY ip_address
ORDER BY attempts DESC;
```

### Weekly Checks

```bash
# Review audit log statistics
SELECT 
  DATE_TRUNC('day', created_at) as day,
  COUNT(*) as total_events,
  SUM(CASE WHEN status = 'failure' THEN 1 ELSE 0 END) as failures
FROM audit_log
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY day
ORDER BY day DESC;

# Check for vulnerable dependencies
pip-audit --skip-editable
```

### Monthly Tasks

- [ ] Review and update dependencies
- [ ] Rotate encryption keys (if policy requires)
- [ ] Analyze audit logs for patterns
- [ ] Review CI/CD vulnerability scan results
- [ ] Test password reset/recovery flow
- [ ] Verify backup/recovery procedures

---

## Troubleshooting

### Issue: "ENCRYPTION_KEY not provided"
**Solution:** Set `ENCRYPTION_KEY` environment variable or remove it for dev mode
```bash
export ENCRYPTION_KEY=$(python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")
```

### Issue: "Redis connection refused"
**Solution:** Either start Redis or disable it:
```bash
# Option 1: Start Redis
redis-server

# Option 2: Disable in development
# Remove REDIS_ENABLED from .env or set to false
```

### Issue: "Password validation failing in tests"
**Solution:** Ensure test passwords meet NIST requirements:
```python
# Valid test password
test_password = "TestPass123!@#"

# Test it
from app.password_policy import PasswordPolicy
is_valid, error = PasswordPolicy.validate(test_password)
assert is_valid, error
```

### Issue: "Audit logs not being created"
**Solution:** Check database connection and audit_log table:
```bash
# Verify table exists
psql -U postgres -d FYP -c "\dt audit_log"

# Check for errors in logs
docker logs backend-container | grep -i audit
```

### Issue: "Rate limiting not working"
**Solution:** Verify Redis is connected or in-memory fallback is active:
```python
from app.rate_limit import _get_redis_client
client = _get_redis_client()
print(f"Redis client: {client}")  # None means using in-memory
```

---

## Support & Resources

- 📖 [Full Documentation](SECURITY_ENHANCEMENTS.md)
- 🧪 [Testing Guide](SECURITY_TESTING.md)
- 🔑 [NIST Password Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)
- 🔒 [Cryptography Library](https://cryptography.io/en/latest/)
- 🚀 [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)

---

## Next Steps

1. ✅ Complete development setup
2. ✅ Run local security tests
3. ✅ Review security documentation
4. ✅ Update CI/CD pipeline in GitHub Actions
5. ✅ Deploy to staging environment
6. ✅ Monitor and verify security features
7. ✅ Deploy to production

Questions? Check the [Security Enhancements Documentation](SECURITY_ENHANCEMENTS.md) or create a GitHub issue.
