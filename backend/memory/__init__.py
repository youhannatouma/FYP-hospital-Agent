"""Memory Management Package.

This package contains the dual memory system for user context management:

- memory_tools.py: Long-term semantic memory using FAISS vector search + FastEmbed
- memory_window.py: Short-term conversation window with LLM summarization

Both systems are thread-safe and manage per-user sessions independently.
"""

from .memory_tools import (
    add_facts,
    recall_memory,
    clear_user,
)

from .memory_window import (
    memory_context,
)

__all__ = [
    # Semantic memory (long-term)
    "add_facts",
    "recall_memory",
    "clear_user",
    # Conversation window (short-term)
    "memory_context",
]
