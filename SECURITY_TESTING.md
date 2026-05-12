# Security Testing Examples

This file provides practical examples for testing the security enhancements.

## 1. Testing Password Policy

### Using Python Directly

```python
from app.password_policy import PasswordPolicy

# Test weak passwords
weak_passwords = [
    "short",                    # Too short
    "NoDigits123",              # Too short before fix
    "password",                 # Common password
    "123456789",                # Only digits
    "MyPass111",                # Missing special char
    "MyPass!!!!!!",             # 3+ repeated chars
    "Password123",              # Too common
    "abc123def456",             # Sequential pattern
]

for pwd in weak_passwords:
    is_valid, error = PasswordPolicy.validate(pwd)
    print(f"'{pwd}': {error if not is_valid else 'PASS'}")

# Test strong passwords
strong_passwords = [
    "MySecurePass123!",
    "H0spital@Care2024",
    "Dr.Smith#Secure$Pass",
    "P@ssw0rd!Secure123",
]

for pwd in strong_passwords:
    is_valid, error = PasswordPolicy.validate(pwd)
    score = PasswordPolicy.get_strength_score(pwd)
    strength = PasswordPolicy.get_strength_description(pwd)
    print(f"'{pwd}': PASS | Score: {score} | {strength}")
```

### Using FastAPI Test Client

```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# Test registration with weak password
response = client.post(
    "/auth/register",
    json={
        "email": "user@example.com",
        "password": "weak",
        "role": "patient"
    }
)
print(f"Weak password: {response.status_code}")  # Should be 400
print(f"Error: {response.json()['detail']}")     # Password error message

# Test registration with strong password
response = client.post(
    "/auth/register",
    json={
        "email": "user@example.com",
        "password": "MySecurePass123!",
        "role": "patient"
    }
)
print(f"Strong password: {response.status_code}")  # Should be 200
print(f"Response: {response.json()}")
```

---

## 2. Testing Rate Limiting

### Simulate Rate Limit Exceeded

```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# Attempt 11 logins within 60 seconds (limit is 10)
for i in range(11):
    response = client.post(
        "/auth/login",
        json={
            "email": f"user{i}@example.com",
            "password": "password123"
        },
        headers={"X-Forwarded-For": "192.168.1.1"}  # Same IP
    )
    
    print(f"Attempt {i+1}: {response.status_code}")
    if response.status_code == 429:
        print(f"Rate limited! Message: {response.json()['detail']}")
        break

# With Redis enabled, test across multiple processes
# With in-memory, test rate limiting in single process
```

### Load Testing with Apache Bench

```bash
# Install Apache Bench
# Ubuntu: sudo apt-get install apache2-utils
# macOS: brew install httpd

# Test rate limiting on login endpoint
ab -n 20 -c 5 -p login.json -T application/json http://localhost:8000/auth/login

# Where login.json contains:
# {"email": "user@example.com", "password": "password123"}
```

---

## 3. Testing Encryption

### Manual Encryption Test

```python
from app.encryption import EncryptionManager

# Generate a new key
key = EncryptionManager.generate_key()
print(f"Generated key: {key}")

# Initialize manager with key
em = EncryptionManager(master_key=key)

# Test encryption/decryption
plaintext = "555-123-4567"
encrypted = em.encrypt(plaintext)
decrypted = em.decrypt(encrypted)

print(f"Original:  {plaintext}")
print(f"Encrypted: {encrypted}")
print(f"Decrypted: {decrypted}")

assert plaintext == decrypted, "Decryption failed!"
print("✓ Encryption test passed")
```

### Database Encryption Test

```python
import os
os.environ["ENCRYPTION_KEY"] = "your-key-here"  # Set before imports

from app.database import SessionLocal
from app.models.user import User
from app.encryption import decrypt_field

db = SessionLocal()

# Create user with encrypted fields
user = User(
    email="doctor@example.com",
    phone_number_encrypted="555-123-4567",
    license_number_encrypted="MD123456",
    role="doctor"
)
db.add(user)
db.commit()

# Retrieve user
retrieved = db.query(User).filter(User.email == "doctor@example.com").first()

# Decrypt fields
phone = decrypt_field(retrieved.phone_number_encrypted)
license = decrypt_field(retrieved.license_number_encrypted)

print(f"Phone: {phone}")
print(f"License: {license}")

db.close()
```

### Verify Database Storage

```bash
# Connect to PostgreSQL
psql -U postgres -d FYP

# Query encrypted field
SELECT user_id, email, phone_number FROM usr WHERE email = 'doctor@example.com';

# Should see encrypted value like: gAAAAABlg4...
# Not: 555-123-4567
```

---

## 4. Testing Audit Logging

### Capture Audit Events

```python
import asyncio
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.audit_log import AuditLog, AuditEventType
from app.audit import AuditLogger

async def test_audit_logging():
    db = SessionLocal()
    
    # Log a login attempt
    await AuditLogger.log_login(
        db=db,
        user_email="test@example.com",
        success=True
    )
    
    # Query audit logs
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(5).all()
    
    for log in logs:
        print(f"{log.created_at} | {log.event_type} | {log.user_email} | {log.status}")
    
    db.close()

# Run the test
asyncio.run(test_audit_logging())
```

### Verify Audit Trail

```sql
-- PostgreSQL query to view audit logs
SELECT 
    log_id,
    event_type,
    user_email,
    ip_address,
    status,
    created_at
FROM audit_log
ORDER BY created_at DESC
LIMIT 20;

-- Find all failed login attempts
SELECT * FROM audit_log 
WHERE event_type = 'login_failed' 
AND created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Find all medical record access by specific user
SELECT * FROM audit_log
WHERE user_id = 'user-uuid'
AND resource_type = 'medical_record'
ORDER BY created_at DESC;
```

---

## 5. Testing Vulnerability Scanning

### Local Vulnerability Scan

```bash
# Navigate to project root
cd backend

# Install scanning tools
pip install pip-audit safety bandit

# Run pip-audit
echo "=== Running pip-audit ==="
pip-audit --desc --skip-editable

# Run safety
echo "=== Running safety ==="
safety check --json

# Run bandit
echo "=== Running bandit ==="
bandit -r app -f txt
```

### Check Specific Package Vulnerability

```bash
# Check if a package has known vulnerabilities
pip-audit --desc --format json | grep "specific-package"

# Update vulnerable package
pip install --upgrade <package-name>

# Verify fix
pip-audit
```

---

## 6. Testing Distributed Rate Limiting with Redis

### Setup Redis Locally

```bash
# Docker
docker run -d -p 6379:6379 redis:7-alpine

# Or macOS with Homebrew
brew install redis
redis-server
```

### Test Redis Rate Limiting

```python
import redis
from app.rate_limit import rate_limit_request
from fastapi import Request
from fastapi.testclient import TestClient

# Verify Redis connection
r = redis.from_url("redis://localhost:6379/0")
print(r.ping())  # Should print: True

# Create mock request
class MockRequest:
    def __init__(self, ip: str):
        self.client = type('obj', (object,), {'host': ip})
        self.headers = {}

# Test rate limiting
request = MockRequest("192.168.1.1")

try:
    for i in range(15):
        rate_limit_request(
            request=request,
            key_prefix="test_limit",
            limit=10,
            window_seconds=60
        )
        print(f"Request {i+1}: OK")
except Exception as e:
    print(f"Request {i+1}: Rate limited - {e.detail}")
```

---

## 7. Integration Test Suite

### Create `tests/test_security_features.py`

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.password_policy import PasswordPolicy

client = TestClient(app)


class TestPasswordPolicy:
    def test_valid_password(self):
        is_valid, _ = PasswordPolicy.validate("MySecurePass123!")
        assert is_valid is True
    
    def test_weak_password_too_short(self):
        is_valid, error = PasswordPolicy.validate("Short1!")
        assert is_valid is False
        assert "12 characters" in error
    
    def test_common_password(self):
        is_valid, error = PasswordPolicy.validate("Password123!")
        assert is_valid is False
        assert "too common" in error.lower()


class TestRateLimiting:
    def test_rate_limit_exceeded(self):
        # Make 11 requests (limit is 10)
        for i in range(10):
            response = client.post(
                "/auth/login",
                json={"email": f"user{i}@test.com", "password": "pass"},
                headers={"X-Forwarded-For": "192.168.1.1"}
            )
        
        # 11th request should be rate limited
        response = client.post(
            "/auth/login",
            json={"email": "user@test.com", "password": "pass"},
            headers={"X-Forwarded-For": "192.168.1.1"}
        )
        assert response.status_code == 429


class TestEncryption:
    def test_encryption_decryption(self):
        from app.encryption import EncryptionManager
        em = EncryptionManager()
        
        plaintext = "sensitive-data"
        encrypted = em.encrypt(plaintext)
        decrypted = em.decrypt(encrypted)
        
        assert plaintext == decrypted


class TestAuditLogging:
    @pytest.mark.asyncio
    async def test_audit_log_created(self):
        from app.audit import AuditLogger
        from app.models.audit_log import AuditLog, AuditEventType
        from app.database import SessionLocal
        
        db = SessionLocal()
        
        await AuditLogger.log_login(
            db=db,
            user_email="test@example.com",
            success=True
        )
        
        # Verify log was created
        log = db.query(AuditLog).filter(
            AuditLog.user_email == "test@example.com"
        ).first()
        
        assert log is not None
        assert log.event_type == AuditEventType.LOGIN_SUCCESS
        
        db.close()


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
```

**Run tests:**
```bash
pip install pytest pytest-asyncio
pytest tests/test_security_features.py -v
```

---

## 8. Compliance Verification

### Generate Audit Report

```python
from app.database import SessionLocal
from app.models.audit_log import AuditLog
from datetime import datetime, timedelta
import json

db = SessionLocal()

# Generate monthly access report
month_ago = datetime.utcnow() - timedelta(days=30)

logs = db.query(AuditLog).filter(
    AuditLog.created_at >= month_ago
).order_by(AuditLog.created_at.desc()).all()

# Create report
report = {
    "period": f"{(month_ago.date())} to {datetime.utcnow().date()}",
    "total_events": len(logs),
    "failed_authentications": len([l for l in logs if "failed" in l.event_type]),
    "medical_record_access": len([l for l in logs if l.resource_type == "medical_record"]),
    "unauthorized_access_attempts": len([l for l in logs if "unauthorized" in l.event_type]),
}

# Save report
with open("audit_report.json", "w") as f:
    json.dump(report, f, indent=2)

db.close()
```

---

## Next Steps

1. **Run all tests locally** before committing
2. **Monitor CI/CD** vulnerability scan results
3. **Review audit logs** regularly for security events
4. **Update dependencies** as new versions become available
5. **Conduct security training** for development team
