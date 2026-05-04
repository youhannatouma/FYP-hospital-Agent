import hashlib
import re


def normalize_message(text: str) -> str:
    return " ".join((text or "").strip().split())


def compute_content_hash(text: str) -> str:
    normalized = normalize_message(text).encode("utf-8")
    return hashlib.sha256(normalized).hexdigest()


def generate_title_from_text(text: str, max_len: int = 60) -> str:
    normalized = normalize_message(text)
    if not normalized:
        return "New Chat"

    sentence = re.split(r"[.!?]", normalized, maxsplit=1)[0].strip()
    title = sentence or normalized
    if len(title) <= max_len:
        return title
    return title[: max_len - 3].rstrip() + "..."
