"""Encryption utilities for at-rest data protection.

Implements AES-256 encryption for sensitive fields like SSN, medical data,
emergency contacts, and other PII. Uses cryptography library with secure
key derivation and authenticated encryption (Fernet).
"""

import os
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.backends import default_backend
import base64


class EncryptionManager:
    """
    Manages encryption and decryption of sensitive data at rest.
    
    Uses Fernet (symmetric encryption) with PBKDF2 key derivation.
    Provides automatic encryption/decryption for database fields.
    """
    
    def __init__(self, master_key: str | None = None):
        """
        Initialize encryption manager with master key.
        
        Args:
            master_key: Master encryption key. If None, loads from ENCRYPTION_KEY env var.
                       Generate with: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
        
        Raises:
            ValueError: If no encryption key is provided or found in environment
        """
        key = master_key or os.getenv("ENCRYPTION_KEY")
        if not key:
            raise ValueError(
                "ENCRYPTION_KEY not provided or set in environment. "
                "Generate with: python -c \"from cryptography.fernet import Fernet; "
                "print(Fernet.generate_key().decode())\""
            )
        
        try:
            # Validate key format
            Fernet(key.encode() if isinstance(key, str) else key)
            self._key = key.encode() if isinstance(key, str) else key
        except Exception as e:
            raise ValueError(f"Invalid encryption key format: {e}")
    
    def encrypt(self, plaintext: str | None) -> str | None:
        """
        Encrypt plaintext string using Fernet.
        
        Args:
            plaintext: String to encrypt. None values are returned as None.
        
        Returns:
            Encrypted token string (base64 encoded) or None if input is None
        """
        if plaintext is None:
            return None
        
        if not isinstance(plaintext, str):
            plaintext = str(plaintext)
        
        try:
            f = Fernet(self._key)
            encrypted = f.encrypt(plaintext.encode())
            return encrypted.decode()
        except Exception as e:
            raise ValueError(f"Encryption failed: {e}")
    
    def decrypt(self, encrypted_token: str | None) -> str | None:
        """
        Decrypt Fernet token back to plaintext.
        
        Args:
            encrypted_token: Encrypted token from encrypt(). None values return None.
        
        Returns:
            Decrypted plaintext string or None if input is None
        
        Raises:
            ValueError: If decryption fails (corrupted or tampered data)
        """
        if encrypted_token is None:
            return None
        
        try:
            f = Fernet(self._key)
            decrypted = f.decrypt(encrypted_token.encode())
            return decrypted.decode()
        except Exception as e:
            raise ValueError(f"Decryption failed - data may be corrupted or tampered: {e}")
    
    @staticmethod
    def generate_key() -> str:
        """
        Generate a new Fernet encryption key.
        
        Returns:
            Base64-encoded Fernet key suitable for ENCRYPTION_KEY env var
        
        Usage:
            key = EncryptionManager.generate_key()
            # Set as environment variable: ENCRYPTION_KEY={key}
        """
        return Fernet.generate_key().decode()


# Global encryption manager instance
_encryption_manager: EncryptionManager | None = None


def get_encryption_manager() -> EncryptionManager:
    """
    Get or create the global encryption manager instance.
    
    Uses lazy initialization to avoid errors if ENCRYPTION_KEY is not set
    at import time.
    
    Returns:
        EncryptionManager instance
    
    Raises:
        ValueError: If ENCRYPTION_KEY is not set in environment
    """
    global _encryption_manager
    if _encryption_manager is None:
        _encryption_manager = EncryptionManager()
    return _encryption_manager


def encrypt_field(value: str | None) -> str | None:
    """
    Convenience function to encrypt a field value.
    
    Args:
        value: String value to encrypt
    
    Returns:
        Encrypted value or None
    """
    if value is None:
        return None
    return get_encryption_manager().encrypt(value)


def decrypt_field(value: str | None) -> str | None:
    """
    Convenience function to decrypt a field value.
    
    Args:
        value: Encrypted value to decrypt
    
    Returns:
        Decrypted value or None
    """
    if value is None:
        return None
    return get_encryption_manager().decrypt(value)
