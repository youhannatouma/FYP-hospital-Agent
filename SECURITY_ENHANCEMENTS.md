# Security Enhancements Guide

This document describes the comprehensive security enhancements implemented in the FYP Hospital Agent project.

## Overview

The following security measures have been implemented:

1. ✅ **Redis-based rate limiting** for distributed systems
2. ✅ **Encryption at rest** for sensitive data
3. ✅ **Comprehensive audit logging** for security events
4. ✅ **Password policy enforcement** with NIST guidelines
5. ✅ **Automated vulnerability scanning** in CI/CD

---

## 1. Redis-Based Rate Limiting

### What Changed
- Upgraded from in-memory rate limiting to distributed Redis-based rate limiting
- Maintains backward compatibility with in-memory fallback for development

### Configuration

**Environment Variables:**
```bash
# Enable Redis rate limiting
REDIS_ENABLED=true
REDIS_URL=redis://localhost:6379/0

# For Docker/production
REDIS_URL=redis://redis-service:6379/0
```

**Default Rate Limits (in `app/rate_limit.py`):**
- Authentication Register: 5 requests/minute per IP
- Authentication Login: 10 requests/minute per IP
- Token Refresh: 20 requests/minute per IP
- General API: 100 requests/minute per IP
- File Upload: 10 requests/hour per IP

### How It Works
```python
# Automatically integrated in routes
from app.rate_limit import rate_limit_request

@router.post("/login")
def login(user: UserLogin, request: Request, db: Session = Depends(get_db)):
    # Rate limit check (uses Redis if available, fallback to in-memory)
    rate_limit_request(
        request=request,
        key_prefix="auth_login",
        limit=10,
        window_seconds=60
    )
    # ... rest of login logic
```

### Production Deployment
```yaml
# docker-compose.yml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

---

## 2. Encryption at Rest

### What Changed
- Implemented Fernet (AES-256) encryption for sensitive PII fields
- Automatic encryption/decryption via SQLAlchemy hooks
- Supports optional encryption (can be disabled in development)

### Encrypted Fields
The following fields are encrypted when stored in the database:

**User Model:**
- `phone_number` - Customer PII
- `license_number` - Healthcare provider identifier
- `clinic_address` - Healthcare provider PII
- `emergency_contact` - Patient PII

**Medical Records** (recommended):
- SSN (if stored)
- Insurance information
- Specific diagnoses

### Configuration

**Generate Encryption Key:**
```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

**Environment Variables:**
```bash
# Required for production
ENCRYPTION_KEY=<generated_key_here>

# Optional: disable encryption in development
# (Simply omit ENCRYPTION_KEY env var)
```

### Usage

**Encrypting Data:**
```python
from app.encryption import encrypt_field, decrypt_field

# Automatic encryption on save (via SQLAlchemy hook)
user = User(
    email="doctor@example.com",
    phone_number_encrypted="555-1234",  # Auto-encrypted on save
    license_number_encrypted="MD123456"  # Auto-encrypted on save
)
db.add(user)
db.commit()

# Manual encryption
encrypted_ssn = encrypt_field("123-45-6789")
decrypted_ssn = decrypt_field(encrypted_ssn)
```

**Reading Encrypted Fields:**
```python
from app.encryption import decrypt_field

user = db.query(User).filter(User.email == "doctor@example.com").first()

# Decrypt sensitive fields
phone = decrypt_field(user.phone_number_encrypted)
license = decrypt_field(user.license_number_encrypted)
```

### Database Migration

If migrating existing data, use this script:

```python
from app.encryption import get_encryption_manager
from app.database import SessionLocal
from app.models.user import User

em = get_encryption_manager()
db = SessionLocal()

# Encrypt existing plaintext phone numbers
for user in db.query(User).filter(User.phone_number_plaintext.isnot(None)).all():
    user.phone_number_encrypted = em.encrypt(user.phone_number_plaintext)
    user.phone_number_plaintext = None

db.commit()
db.close()
```

---

## 3. Comprehensive Audit Logging

### What Changed
- Integrated audit logging into authentication endpoints
- Captures all security-relevant events with full context
- Supports HIPAA/GDPR compliance requirements

### Audited Events
- Login success/failure
- User registration
- Unauthorized access attempts
- Medical record access (view, create, modify, delete)
- Prescription management
- Payment transactions
- Administrative actions
- Role/permission changes

### Usage

**In Route Handlers:**
```python
from app.audit import AuditLogger
from app.models.audit_log import AuditEventType

# Log login attempt
await AuditLogger.log_login(
    db=db,
    user_email="user@example.com",
    success=True,
    request=request
)

# Log data access (medical records)
await AuditLogger.log_data_access(
    db=db,
    action="view",  # create, view, modify, delete
    user_id=current_user.user_id,
    user_email=current_user.email,
    user_role=current_user.role,
    resource_id=medical_record_id,
    resource_type="medical_record",
    request=request,
    details={"reason": "Patient consultation"}
)

# Log administrative actions
await AuditLogger.log_admin_action(
    db=db,
    user_id=admin_id,
    action_description="Suspended user account",
    target_user_id=suspended_user_id,
    request=request
)

# Log authorization failures
await AuditLogger.log_authorization_failure(
    db=db,
    user_id=attacker_id,
    resource_id=medical_record_id,
    resource_type="medical_record",
    reason="Insufficient permissions",
    request=request
)
```

### Querying Audit Logs
```python
from app.models.audit_log import AuditLog, AuditEventType
from datetime import datetime, timedelta

db = SessionLocal()

# Find all failed login attempts in last 24 hours
failed_logins = db.query(AuditLog).filter(
    AuditLog.event_type == AuditEventType.LOGIN_FAILED,
    AuditLog.created_at >= datetime.utcnow() - timedelta(days=1)
).all()

# Find all medical record access by specific user
record_access = db.query(AuditLog).filter(
    AuditLog.user_id == "user-uuid",
    AuditLog.resource_type == "medical_record"
).order_by(AuditLog.created_at.desc()).all()

# Find all unauthorized access attempts
unauthorized = db.query(AuditLog).filter(
    AuditLog.event_type == AuditEventType.UNAUTHORIZED_ACCESS
).all()

# Generate compliance report
from sqlalchemy import func

access_report = db.query(
    AuditLog.user_id,
    AuditLog.resource_type,
    func.count(AuditLog.log_id).label('access_count')
).filter(
    AuditLog.event_type == AuditEventType.MEDICAL_RECORD_VIEW,
    AuditLog.created_at >= datetime.utcnow() - timedelta(days=30)
).group_by(
    AuditLog.user_id,
    AuditLog.resource_type
).all()
```

### Audit Log Retention
```bash
# Set retention period (default: 365 days)
AUDIT_LOG_RETENTION_DAYS=365

# Disable audit logging (not recommended)
AUDIT_LOG_ENABLED=false
```

---

## 4. Password Policy Enforcement

### What Changed
- Implemented NIST SP 800-63B password requirements
- Password strength validation and scoring
- Prevention of common/weak passwords
- Optional password expiration

### Requirements
- Minimum length: 12 characters
- Maximum length: 128 characters
- Must contain:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one digit
  - At least one special character: `!@#$%^&*()_+-=[]{}|;:,.<>?`
- No excessive repetition (3+ same consecutive chars)
- No sequential patterns (123, abc, qwerty)
- Not in common passwords list

### Configuration

**Environment Variables:**
```bash
# Password policy settings
MIN_PASSWORD_LENGTH=12              # Default: 12 (NIST minimum)
MAX_PASSWORD_LENGTH=128             # Default: 128
PASSWORD_EXPIRATION_DAYS=90         # Set to 0 for no expiration
PASSWORD_HISTORY_COUNT=5            # Prevent reuse of last N passwords
```

### Usage

**Validate Password:**
```python
from app.password_policy import PasswordPolicy

# Validate password
is_valid, error_msg = PasswordPolicy.validate("MySecurePass123!")
if not is_valid:
    raise HTTPException(status_code=400, detail=error_msg)

# Get strength score (0-100)
score = PasswordPolicy.get_strength_score("MySecurePass123!")
# Returns: 85

# Get readable strength description
strength = PasswordPolicy.get_strength_description("MySecurePass123!")
# Returns: "Strong"
```

**Integrated in Auth Routes:**
```python
from app.password_policy import PasswordPolicy

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Validate password policy
    is_valid, error_msg = PasswordPolicy.validate(user.password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)
    
    # Password is now guaranteed to be strong
    user = User(email=user.email, password_hash=hash_password(user.password))
    db.add(user)
    db.commit()
```

### Password Expiration (Optional)
```python
from app.password_policy import PasswordExpiration

# Check if password is expired
if PasswordExpiration.is_expired(user.password_changed_at):
    raise HTTPException(status_code=403, detail="Password expired")

# Get days until expiration
days_left = PasswordExpiration.days_until_expiration(user.password_changed_at)

# Check if should warn user
if PasswordExpiration.should_warn(user.password_changed_at):
    # Include warning in response
    warning = f"Password expires in {days_left} days"
```

---

## 5. Automated Vulnerability Scanning in CI/CD

### What Changed
- Added security scanning job to GitHub Actions
- Scans for known CVE vulnerabilities in dependencies
- Checks code for security issues using Bandit
- Blocks deployment if critical vulnerabilities found

### Scanning Tools

**1. pip-audit** - PYPA Vulnerability Database
- Scans for known CVE vulnerabilities in pip packages
- Database updated regularly
- Fast and reliable

**2. safety** - Python Security Advisory Database
- Independent vulnerability database
- Additional checks beyond PYPA

**3. bandit** - Python Security Code Analysis
- Scans code for insecure patterns
- Detects hardcoded credentials, SQL injection risks, etc.
- Configurable rules

### CI/CD Workflow

The security scanning job runs on every push and PR:

```yaml
dependency-security:
  runs-on: ubuntu-latest
  steps:
    - name: Run pip-audit
    - name: Run safety
    - name: Run bandit
    - name: Fail if critical vulnerabilities found
    - name: Upload security reports
```

### Local Testing

**Run security scans locally:**
```bash
# Install scanning tools
pip install pip-audit safety bandit

# Run pip-audit
pip-audit --desc --skip-editable

# Run safety
safety check

# Run bandit
bandit -r backend/app -f json -o bandit-report.json
```

### Handling Vulnerabilities

**If vulnerabilities are found:**

1. **Check severity:** Review each finding
2. **Update packages:** `pip install --upgrade <package>`
3. **Test thoroughly:** Ensure updates don't break functionality
4. **If no fix available:**
   - Evaluate risk vs benefit
   - Document decision
   - Implement workarounds if possible

**Example: Updating a vulnerable package**
```bash
# Show detailed audit report
pip-audit --desc

# Update specific package
pip install --upgrade cryptography

# Re-run scan to verify
pip-audit

# Update requirements.txt
pip freeze > backend/requirements.txt
```

### GitHub Actions Artifacts

Security reports are uploaded as artifacts:
- `bandit-report.json` - Detailed security analysis
- Available for 30 days for review

### Ignoring False Positives (Cautiously)

**For legitimate false positives only:**

Create `.bandit` file:
```yaml
exclude_dirs:
  - /test
skip:
  - B101  # assert_used
  - B601  # paramiko_calls
```

---

## 6. Environment Configuration

### Development Setup

**Create `.env` file:**
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/FYP

# JWT
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256

# Encryption (optional for dev)
# ENCRYPTION_KEY=<from: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())">

# Redis (optional for dev)
# REDIS_ENABLED=false

# Environment
ENVIRONMENT=development

# Google API
GOOGLE_API_KEY=test-key

# CORS
# CORS_ORIGINS=http://localhost:3000
```

### Production Setup

**Required Environment Variables:**
```bash
# All from development +

# MUST have encryption key
ENCRYPTION_KEY=<generated-key>

# MUST have Redis for distributed rate limiting
REDIS_ENABLED=true
REDIS_URL=redis://redis-service:6379/0

# MUST specify CORS origins (no wildcards!)
CORS_ORIGINS=https://yourhospital.com,https://api.yourhospital.com

# Password policy
PASSWORD_EXPIRATION_DAYS=90
PASSWORD_HISTORY_COUNT=5

# Audit logging retention
AUDIT_LOG_RETENTION_DAYS=365

# Environment
ENVIRONMENT=production
```

**Docker Compose Example:**
```yaml
version: '3.8'
services:
  backend:
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/FYP
      - SECRET_KEY=${SECRET_KEY}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
      - REDIS_ENABLED=true
      - REDIS_URL=redis://redis:6379/0
      - ENVIRONMENT=production
      - CORS_ORIGINS=${CORS_ORIGINS}

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

---

## 7. Security Checklist

### Before Production Deployment

- [ ] Generate and securely store `ENCRYPTION_KEY`
- [ ] Configure Redis instance for distributed systems
- [ ] Set `ENVIRONMENT=production`
- [ ] Define `CORS_ORIGINS` (specific domains only)
- [ ] Set `PASSWORD_EXPIRATION_DAYS` to appropriate value (e.g., 90)
- [ ] Run full vulnerability scan: `pip-audit && safety check && bandit -r backend/app`
- [ ] Review audit log configuration and retention
- [ ] Test password validation with multiple passwords
- [ ] Test rate limiting under load
- [ ] Enable HTTPS/TLS for all endpoints
- [ ] Configure database encryption (at-rest)
- [ ] Set up log aggregation for audit logs
- [ ] Configure backup/recovery procedures

### Ongoing Maintenance

- [ ] Monitor security scanning CI/CD job
- [ ] Update dependencies regularly (`pip install --upgrade`)
- [ ] Review audit logs for suspicious activity
- [ ] Test password reset/recovery flows
- [ ] Verify rate limiting effectiveness
- [ ] Check encryption key backups
- [ ] Conduct periodic security audits

---

## 8. Troubleshooting

### Encryption Errors
```
ValueError: ENCRYPTION_KEY not provided or set in environment
```
**Solution:** Set `ENCRYPTION_KEY` environment variable or disable encryption for development

### Rate Limiting Issues
```
Redis connection refused
```
**Solution:** Either:
1. Start Redis service, or
2. Set `REDIS_ENABLED=false` to use in-memory fallback

### Password Validation Failures
```
Password must be at least 12 characters long
```
**Solution:** Users must follow NIST guidelines. Provide password strength feedback.

### Audit Log Errors
```
Failed to write audit log
```
**Solution:** Check database connection and that audit log table exists. Audit failures don't block operations.

---

## References

- [NIST SP 800-63B: Digital Identity Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)
- [OWASP Password Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Cryptography.io Fernet](https://cryptography.io/en/latest/fernet/)
- [HIPAA Security Rule Compliance](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
- [pip-audit Documentation](https://github.com/pypa/pip-audit)
- [Bandit Security Linter](https://bandit.readthedocs.io/)

---

## Support

For security issues or questions, please contact the security team or create a security issue in the repository.
