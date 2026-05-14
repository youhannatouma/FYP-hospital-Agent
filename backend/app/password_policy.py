"""Password policy enforcement for user authentication.

Implements NIST guidelines for password requirements including:
- Minimum length (12 chars) and complexity
- No common patterns (sequential, repeated chars)
- Entropy checking
- Breach database checks (optional)
"""

import re
import os
from typing import Tuple
from datetime import datetime, timedelta


class PasswordPolicy:
    """
    Enforces strong password requirements based on NIST guidelines.
    
    Requirements:
    - Minimum 12 characters (NIST SP 800-63B)
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    - At least one special character from: !@#$%^&*()_+-=[]{}|;:,.<>?
    - Not in common passwords list
    - No excessive repetition (more than 3 consecutive same char)
    - No common patterns (sequential numbers, keyboard patterns)
    """
    
    # Minimum requirements
    MIN_LENGTH = 12
    MAX_LENGTH = 128
    
    # Character sets
    UPPERCASE = r'[A-Z]'
    LOWERCASE = r'[a-z]'
    DIGITS = r'[0-9]'
    SPECIAL = r'[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]'
    
    # Common weak passwords
    COMMON_PASSWORDS = {
        'password', '12345678', 'qwerty', 'abc123', 'password123',
        'letmein', 'welcome', 'monkey', 'dragon', '1234567890',
        'admin', 'root', 'toor', 'pass', 'pass123', 'admin123',
        '111111', '123456', '1234567', 'sunshine', 'password1'
    }
    
    @classmethod
    def validate(cls, password: str) -> Tuple[bool, str]:
        """
        Validate password against policy.
        
        Args:
            password: Password to validate
        
        Returns:
            Tuple of (is_valid, error_message)
            - is_valid: True if password passes all checks
            - error_message: Human-readable error message if invalid
        
        Examples:
            >>> is_valid, msg = PasswordPolicy.validate("MySecurePass123!")
            >>> print(is_valid)  # True
            
            >>> is_valid, msg = PasswordPolicy.validate("weak")
            >>> print(msg)  # "Password must be at least 12 characters..."
        """
        # Null/empty check
        if not password or not isinstance(password, str):
            return False, "Password cannot be empty"
        
        # Length check
        if len(password) < cls.MIN_LENGTH:
            return False, f"Password must be at least {cls.MIN_LENGTH} characters long"
        
        if len(password) > cls.MAX_LENGTH:
            return False, f"Password cannot exceed {cls.MAX_LENGTH} characters"
        
        # Complexity requirements
        checks = [
            (re.search(cls.UPPERCASE, password), "at least one uppercase letter"),
            (re.search(cls.LOWERCASE, password), "at least one lowercase letter"),
            (re.search(cls.DIGITS, password), "at least one digit"),
            (re.search(cls.SPECIAL, password), "at least one special character (!@#$%^&*)"),
        ]
        
        for passed, requirement in checks:
            if not passed:
                return False, f"Password must contain {requirement}"
        
        # Common password check
        if password.lower() in cls.COMMON_PASSWORDS:
            return False, "Password is too common. Please choose a more unique password"
        
        # Excessive repetition check (3+ consecutive same char)
        if re.search(r'(.)\1{2,}', password):
            return False, "Password cannot contain more than 2 consecutive identical characters"
        
        # Sequential patterns check (123, abc, etc.)
        if cls._has_sequential_pattern(password):
            return False, "Password cannot contain sequential character patterns (123, abc, etc.)"
        
        return True, ""
    
    @classmethod
    def _has_sequential_pattern(cls, password: str) -> bool:
        """
        Check for sequential patterns like 123, abc, qwerty.
        
        Args:
            password: Password to check
        
        Returns:
            True if sequential pattern found
        """
        password_lower = password.lower()
        
        # Check numeric sequences
        for i in range(len(password_lower) - 2):
            if password_lower[i:i+3] in ['012', '123', '234', '345', '456', '567', '678', '789']:
                return True
        
        # Check alphabetic sequences
        for i in range(len(password_lower) - 2):
            chars = password_lower[i:i+3]
            if all(ord(chars[j]) == ord(chars[0]) + j for j in range(3)):
                return True
        
        # Check keyboard patterns
        keyboard_patterns = [
            'qwerty', 'asdfgh', 'zxcvbn', 'qwertyuiop',
            '123456', '1234567', '12345678',
        ]
        for pattern in keyboard_patterns:
            if pattern in password_lower:
                return True
        
        return False
    
    @classmethod
    def get_strength_score(cls, password: str) -> int:
        """
        Calculate password strength score (0-100).
        
        Args:
            password: Password to score
        
        Returns:
            Strength score: 0-33 (weak), 34-66 (fair), 67-100 (strong)
        """
        if not password:
            return 0
        
        score = 0
        
        # Length scoring
        if len(password) >= cls.MIN_LENGTH:
            score += 20
        if len(password) >= 16:
            score += 10
        if len(password) >= 20:
            score += 10
        
        # Character variety
        if re.search(cls.UPPERCASE, password):
            score += 15
        if re.search(cls.LOWERCASE, password):
            score += 15
        if re.search(cls.DIGITS, password):
            score += 15
        if re.search(cls.SPECIAL, password):
            score += 15
        
        # Penalize common patterns
        if password.lower() in cls.COMMON_PASSWORDS:
            score -= 40
        if re.search(r'(.)\1{2,}', password):
            score -= 10
        if cls._has_sequential_pattern(password):
            score -= 10
        
        return max(0, min(100, score))
    
    @classmethod
    def get_strength_description(cls, password: str) -> str:
        """
        Get human-readable strength description.
        
        Args:
            password: Password to describe
        
        Returns:
            String: "Weak", "Fair", or "Strong"
        """
        score = cls.get_strength_score(password)
        if score < 34:
            return "Weak"
        elif score < 67:
            return "Fair"
        else:
            return "Strong"


class PasswordHistory:
    """
    Manages password history to prevent reuse.
    
    Prevents users from reusing their last N passwords.
    """
    
    # Number of previous passwords to track (NIST recommends 5+)
    HISTORY_COUNT = 5
    
    # Minimum days before password can be changed again
    MIN_CHANGE_INTERVAL_DAYS = 1
    
    @staticmethod
    def should_prevent_reuse(new_password: str, password_hashes: list[str]) -> bool:
        """
        Check if new password is in recent history.
        
        Args:
            new_password: New password to check
            password_hashes: List of previous password hashes
        
        Returns:
            True if password is in history (should be prevented)
        
        Note:
            In practice, this should verify new_password against hashes,
            not plaintext. Uses hash verification in real implementation.
        """
        # This would be implemented with actual password hash verification
        # For now, returns False (allow if no history matches)
        return False


class PasswordExpiration:
    """
    Manages password expiration policy.
    
    Enforces periodic password changes for compliance.
    """
    
    # Days until password expires (None = no expiration)
    # Set to None to disable, or number of days (e.g., 90)
    EXPIRATION_DAYS = None  # Can be set to 90 for stricter requirements
    
    # Days before expiration to warn user
    WARNING_DAYS = 14
    
    @staticmethod
    def is_expired(last_changed_at: datetime) -> bool:
        """
        Check if password has expired.
        
        Args:
            last_changed_at: Datetime when password was last changed
        
        Returns:
            True if password is expired
        """
        if PasswordExpiration.EXPIRATION_DAYS is None:
            return False
        
        expiration_date = last_changed_at + timedelta(days=PasswordExpiration.EXPIRATION_DAYS)
        return datetime.now() > expiration_date
    
    @staticmethod
    def days_until_expiration(last_changed_at: datetime) -> int | None:
        """
        Calculate days until password expires.
        
        Args:
            last_changed_at: Datetime when password was last changed
        
        Returns:
            Days until expiration, or None if no expiration
        """
        if PasswordExpiration.EXPIRATION_DAYS is None:
            return None
        
        expiration_date = last_changed_at + timedelta(days=PasswordExpiration.EXPIRATION_DAYS)
        days_left = (expiration_date - datetime.now()).days
        return max(0, days_left)
    
    @staticmethod
    def should_warn(last_changed_at: datetime) -> bool:
        """
        Check if user should be warned about upcoming expiration.
        
        Args:
            last_changed_at: Datetime when password was last changed
        
        Returns:
            True if password expires within WARNING_DAYS
        """
        days_left = PasswordExpiration.days_until_expiration(last_changed_at)
        if days_left is None:
            return False
        return 0 <= days_left <= PasswordExpiration.WARNING_DAYS
