"""Security utilities for input sanitization and validation."""

from bleach import clean as bleach_clean
import re


def sanitize_text(text: str, max_length: int = 5000) -> str:
    """
    Sanitize text input to prevent HTML/script injection.
    
    Args:
        text: Input text to sanitize
        max_length: Maximum allowed length (default 5000 chars)
    
    Returns:
        Sanitized text with HTML tags removed
    
    Raises:
        ValueError: If text exceeds max_length
    """
    if not isinstance(text, str):
        return ""
    
    if len(text) > max_length:
        raise ValueError(f"Text exceeds maximum length of {max_length} characters")
    
    # Remove HTML tags and escape special characters
    sanitized = bleach_clean(text, tags=[], strip=True)
    
    return sanitized.strip()


def validate_email_format(email: str) -> bool:
    """
    Validate email format using regex.
    
    Args:
        email: Email address to validate
    
    Returns:
        True if valid, False otherwise
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def sanitize_medical_notes(notes: str, max_length: int = 10000) -> str:
    """
    Sanitize medical notes while preserving clinical formatting.
    
    Args:
        notes: Medical notes text
        max_length: Maximum allowed length (default 10000 chars)
    
    Returns:
        Sanitized medical notes
    
    Raises:
        ValueError: If notes exceed max_length
    """
    if not isinstance(notes, str):
        return ""
    
    if len(notes) > max_length:
        raise ValueError(f"Medical notes exceed maximum length of {max_length} characters")
    
    # Remove HTML tags but keep line breaks and basic formatting
    # Allow only safe formatting, no scripts or event handlers
    sanitized = bleach_clean(notes, tags=[], strip=True)
    
    # Preserve intentional line breaks from original
    # Replace double newlines with preserved formatting
    lines = [line.strip() for line in notes.split('\n')]
    cleaned_lines = [bleach_clean(line, tags=[], strip=True) for line in lines]
    
    return '\n'.join(cleaned_lines).strip()


def sanitize_filename(filename: str, max_length: int = 255) -> str:
    """
    Sanitize filename to prevent path traversal and injection attacks.
    
    Args:
        filename: Original filename
        max_length: Maximum filename length (default 255)
    
    Returns:
        Sanitized filename safe for file storage
    
    Raises:
        ValueError: If filename is invalid
    """
    if not filename or not isinstance(filename, str):
        raise ValueError("Filename cannot be empty")
    
    # Remove path traversal attempts
    filename = filename.replace('..', '').replace('/', '').replace('\\', '')
    
    # Remove special characters that could cause issues
    filename = re.sub(r'[^a-zA-Z0-9._-]', '', filename)
    
    if len(filename) > max_length:
        filename = filename[:max_length]
    
    if not filename:
        raise ValueError("Filename became empty after sanitization")
    
    return filename


__all__ = [
    'sanitize_text',
    'validate_email_format',
    'sanitize_medical_notes',
    'sanitize_filename',
]
