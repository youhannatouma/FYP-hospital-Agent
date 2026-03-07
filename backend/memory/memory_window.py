"""Short-term conversation window — sliding buffer with LLM summarization."""
from __future__ import annotations

import logging
import importlib
from threading import RLock
from typing import Any

log = logging.getLogger(__name__)

# ── Configuration ───────────────────────────────────────────────────────
_MAX_MESSAGES = 6
_MAX_TOKENS = 1500
_MAX_MSG_TOKENS = 800  # Hard cap per individual message
_MAX_SUMMARY_CHARS = 2000  # When to re-summarize the summary
_CHAR_PER_TOKEN = 4  # Fallback heuristic if tiktoken unavailable

# Try to use accurate tokenizer (tiktoken for GPT-style models)
# tiktoken uses BPE (Byte Pair Encoding) — same algorithm as GPT/Gemini
# If unavailable, falls back to conservative character-based heuristic
try:
    tiktoken = importlib.import_module("tiktoken")
    _encoder = tiktoken.get_encoding("cl100k_base")  # GPT-4/Gemini compatible
    _USE_TIKTOKEN = True
    log.info("Using tiktoken for accurate token counting")
except ImportError:
    _encoder = None
    _USE_TIKTOKEN = False
    log.warning("tiktoken not available, using character heuristic. Install: pip install tiktoken")

_SUMMARIZE_PROMPT = (
    "Summarize this conversation in 2-3 sentences. Preserve critical medical "
    "details, symptoms, medications, dosages, and safety warnings.\n{messages}"
)

_RESUM_PROMPT = (
    "Condense this summary into 2-3 concise sentences. Keep only critical "
    "medical facts, recent decisions, and current symptoms.\n{summary}"
)


# ── Per-session state ───────────────────────────────────────────────────
_sessions: dict[str, dict[str, Any]] = {}
_sessions_lock = RLock()


def _get(sid: str) -> dict[str, Any]:
    with _sessions_lock:
        if sid not in _sessions:
            _sessions[sid] = {"messages": [], "summary": ""}
        return _sessions[sid]


def _tok(text: str) -> int:
    """Count tokens using tiktoken if available, else character heuristic."""
    if _USE_TIKTOKEN and _encoder:
        try:
            return len(_encoder.encode(text))
        except Exception:
            # Fallback if encoding fails (rare edge cases)
            return len(text) // _CHAR_PER_TOKEN
    return len(text) // _CHAR_PER_TOKEN


# ── Public API ──────────────────────────────────────────────────────────

def add_message(session_id: str, role: str, content: str) -> None:
    """Append a message to the session window.
    
    **EDGE CASE 1 FIX**: Hard cap individual messages at _MAX_MSG_TOKENS.
    Prevents single gigantic message from breaking the window.
    """
    if not session_id or not content:
        return
    if not role:
        role = "unknown"
    
    # Hard cap: truncate messages exceeding per-message token limit
    msg_tokens = _tok(content)
    if msg_tokens > _MAX_MSG_TOKENS:
        original_content = content  # Preserve original
        truncation_suffix = "...[truncated]"
        
        # Truncate to fit
        if _USE_TIKTOKEN and _encoder:
            # Accurate tokenization - can be precise
            suffix_tokens = len(_encoder.encode(truncation_suffix))
            target_tokens = _MAX_MSG_TOKENS - suffix_tokens
            tokens = _encoder.encode(original_content)[:target_tokens]
            content = _encoder.decode(tokens) + truncation_suffix
        else:
            # Fallback heuristic: Conservative loop
            # Start slightly below limit
            estimated_chars = (_MAX_MSG_TOKENS - 25) * _CHAR_PER_TOKEN
            
            # Construct content
            content = original_content[:estimated_chars] + truncation_suffix
            
            # Reduce iteratively until valid
            while len(content) // _CHAR_PER_TOKEN > _MAX_MSG_TOKENS:
                estimated_chars -= 100
                if estimated_chars < 0: estimated_chars = 0
                content = original_content[:estimated_chars] + truncation_suffix
        
        final_tokens = _tok(content)
        log.warning(
            "Message truncated: %d -> %d tokens (session %s)",
            msg_tokens, final_tokens, session_id
        )
    
    with _sessions_lock:
        _get(session_id)["messages"].append({"role": role, "content": content})


def get_messages(session_id: str) -> list[dict[str, str]]:
    """Current window messages (shallow copy)."""
    with _sessions_lock:
        return list(_get(session_id)["messages"])


def get_summary(session_id: str) -> str:
    """Rolling summary of older trimmed messages."""
    with _sessions_lock:
        return _get(session_id).get("summary", "")


def trim(session_id: str, llm: Any = None) -> bool:
    """
    Strategy:
    - Trigger at 80% of limits (not 100%) — trim BEFORE we waste tokens
    - Trim down to 50% capacity — leave headroom for new messages
    - Summarize archived messages if LLM provided
    
    Example 
    - Trigger when: msgs >= 5 OR tokens >= 1200
    - Trim to: ~3 msgs AND ~750 tokens
    """
    with _sessions_lock:
        sess = _get(session_id)
        msgs = list(sess["messages"])
    
    if not msgs:
        return False

    current_tokens = sum(_tok(m["content"]) for m in msgs)
    
    # ═══════════════════════════════════════════════════════════════════
    # PROACTIVE THRESHOLDS — trigger BEFORE hitting hard limits
    # ═══════════════════════════════════════════════════════════════════
    TRIGGER_MSG = round(_MAX_MESSAGES * 0.8)   # 80% → triggers at 5 msgs
    TRIGGER_TOK = int(_MAX_TOKENS * 0.8)       # 80% → triggers at 1200 toks
    
    # Don't trim if we're under BOTH thresholds
    if len(msgs) < TRIGGER_MSG and current_tokens < TRIGGER_TOK:
        return False

    # ═══════════════════════════════════════════════════════════════════
    # TARGET CAPACITY — what we trim DOWN to (50% = generous headroom)
    # ═══════════════════════════════════════════════════════════════════
    TARGET_MSG = max(int(_MAX_MESSAGES * 0.5), 2)  # 50% → keep ~3 msgs
    TARGET_TOK = int(_MAX_TOKENS * 0.5)            # 50% → keep ~750 toks
    
    # Walk backwards from newest to oldest, accumulating until we hit targets
    keep_count = 0
    running_toks = 0
    cut_idx = len(msgs)  # Start assuming we keep nothing
    
    for i in range(len(msgs) - 1, -1, -1):
        msg_toks = _tok(msgs[i]["content"])
        
        # Stop adding if we'd exceed targets
        if keep_count >= TARGET_MSG or (running_toks + msg_toks) > TARGET_TOK:
            cut_idx = i + 1
            break
        
        running_toks += msg_toks
        keep_count += 1
        cut_idx = i
    
    # Split: archive older, keep recent
    to_archive = msgs[:cut_idx]
    to_keep = msgs[cut_idx:]

    # ═══════════════════════════════════════════════════════════════════
    # SAFETY NET: Keep minimum recent messages for context
    # BUT: If this violates hard token limits, force aggressive trim
    # ═══════════════════════════════════════════════════════════════════
    MIN_KEEP = min(3, len(msgs))
    if len(to_keep) < MIN_KEEP:
        to_keep = msgs[-MIN_KEEP:]
        to_archive = msgs[:-MIN_KEEP]
    
    # **EDGE CASE 1 FIX**: Prevent MIN_KEEP override when exceeding hard limits
    # If keeping MIN_KEEP messages still exceeds _MAX_TOKENS, force trim
    kept_tokens = sum(_tok(m["content"]) for m in to_keep)
    if kept_tokens > _MAX_TOKENS:
        # Aggressive trim: keep dropping oldest until under limit
        while len(to_keep) > 1 and kept_tokens > _MAX_TOKENS:
            dropped = to_keep.pop(0)  # Remove oldest from keep list
            to_archive.append(dropped)  # Add to archive
            kept_tokens = sum(_tok(m["content"]) for m in to_keep)
        
        log.warning(
            "MIN_KEEP override: forced trim to %d msgs due to token limit (session %s)",
            len(to_keep), session_id
        )

    if not to_archive:
        return False

    # SUMMARIZATION — compress archived messages into rolling summary
    if llm and to_archive:
        text_chunk = "\n".join(f"{m['role']}: {m['content']}" for m in to_archive)
        if len(text_chunk) > 50:
            try:
                prompt = _SUMMARIZE_PROMPT.format(messages=text_chunk)
                resp = llm.invoke(prompt)
                
                new_summary = resp.content if hasattr(resp, "content") else str(resp)
                new_summary = new_summary.strip()
                
                with _sessions_lock:
                    prev = _get(session_id).get("summary", "")
                combined = f"{prev}\n{new_summary}" if prev else new_summary
                
                # ═══════════════════════════════════════════════════════════
                # EDGE CASE 2 FIX: Re-summarize summary when it grows too large
                # Instead of truncating (loses info), compress with LLM
                # ═══════════════════════════════════════════════════════════
                if len(combined) > _MAX_SUMMARY_CHARS:
                    try:
                        # Re-summarize the summary itself
                        resum_prompt = _RESUM_PROMPT.format(summary=combined)
                        resum_resp = llm.invoke(resum_prompt)
                        compressed = resum_resp.content if hasattr(resum_resp, "content") else str(resum_resp)
                        with _sessions_lock:
                            _get(session_id)["summary"] = compressed.strip()
                        log.info("Re-summarized growing summary: %d -> %d chars (session %s)",
                                len(combined), len(compressed.strip()), session_id)
                    except Exception as e2:
                        # Fallback: truncate intelligently (keep recent half)
                        log.error("Re-summarization failed, truncating: %s", e2)
                        with _sessions_lock:
                            _get(session_id)["summary"] = combined[-_MAX_SUMMARY_CHARS:]
                else:
                    with _sessions_lock:
                        _get(session_id)["summary"] = combined.strip()
                    
            except Exception as e:
                log.error("Summarization failed for session %s: %s", session_id, e)

    # Apply trim
    old_tokens = current_tokens
    new_tokens = sum(_tok(m["content"]) for m in to_keep)
    with _sessions_lock:
        _get(session_id)["messages"] = to_keep
    
    log.info(
        "PROACTIVE TRIM session %s: %d->%d msgs, %d->%d toks (archived %d)",
        session_id, len(msgs), len(to_keep), old_tokens, new_tokens, len(to_archive)
    )
    return True

def get_context_string(session_id: str) -> str:
    """Return formatted context string for LLM inference."""
    with _sessions_lock:
        sess = _sessions.get(session_id)
        if not sess:
            return ""
        summary = sess.get("summary", "")
        messages = list(sess["messages"])
        
    parts = []
    if summary:
        parts.append(f"SYSTEM SUMMARY:\n{summary}\n")
    
    parts.append("CURRENT CONVERSATION:")
    for m in messages:
        parts.append(f"{m['role'].upper()}: {m['content']}")
        
    return "\n".join(parts)


def message_count(session_id: str) -> int:
    """Number of messages in the current window."""
    return len(_get(session_id)["messages"])


def clear(session_id: str) -> None:
    """Remove all data for a session."""
    with _sessions_lock:
        _sessions.pop(session_id, None)


__all__ = [
    "add_message", "get_messages", "get_summary",
    "trim", "get_context_string", "message_count", "clear",
]
