"""Semantic memory — extract, store, and recall user preference facts."""
from __future__ import annotations

import base64
import importlib
import json
import logging
import os
from dataclasses import dataclass, field
from threading import RLock
from typing import Any

log = logging.getLogger(__name__)

# ── Lazy-loaded deps (graceful when missing) ────────────────────────────
_faiss: Any = None
_encoder: Any = None
_DIM = 384  # BAAI/bge-small-en-v1.5 output dimension


def _load_deps() -> bool:
    """Load FAISS + Embedder on first use. Supports FastEmbed or sentence-transformers."""
    global _faiss, _encoder, _DIM
    if _encoder is not None:
        return True
    try:
        import faiss
        _faiss = faiss
        
        # Try FastEmbed first (lighter, faster, no PyTorch)
        try:
            from fastembed import TextEmbedding
            _encoder = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
            _DIM = 384
            log.info("Memory deps loaded (FAISS + FastEmbed)")
            return True
        except Exception as fe_err:
            log.warning("FastEmbed unavailable: %s. Trying sentence-transformers...", fe_err)
            
            # Fallback to sentence-transformers (more robust, requires PyTorch)
            try:
                sentence_transformers = importlib.import_module("sentence_transformers")
                SentenceTransformer = sentence_transformers.SentenceTransformer
                _encoder = SentenceTransformer("all-MiniLM-L6-v2")  # 22MB, 384 dim
                _DIM = 384
                log.info("Memory deps loaded (FAISS + SentenceTransformer)")
                return True
            except Exception as st_err:
                log.error("Both embedding libraries failed. Install one: pip install fastembed OR pip install sentence-transformers")
                return False
                
    except ImportError as e:
        log.error("Memory disabled — pip install faiss-cpu (fastembed OR sentence-transformers): %s", e)
        return False


# ── Allowed predicates (medication domain only) ─────────────────────────
_PREDICATES = frozenset({
    "prefers_form",        # tablet, liquid, capsule …
    "avoids_ingredient",   # specific substances to avoid
    "brand_preference",    # prefers / dislikes a brand
    "dosage_sensitivity",  # sensitive to high / low doses
    "prefers_route",       # oral, topical, injection …
    "side_effect_history", # had side-effect X with drug Y
})

_EXTRACT_PROMPT = (
    "Extract health preference facts from this conversation.\n"
    "Return a JSON array: [{{\"predicate\":\"...\",\"value\":\"...\"}}]\n"
    "Allowed predicates: {predicates}\n"
    "Return [] if none found. ONLY output the JSON array.\n"
    "Conversation:\n{conversation}"
)

_SIM_THRESHOLD = 0.3  # min cosine similarity for recall
_MAX_FACTS_PER_USER = int(os.getenv("MEMORY_MAX_FACTS", "1000"))


# ── Per-user store ──────────────────────────────────────────────────────
@dataclass
class _UserMem:
    facts: list[dict] = field(default_factory=list)
    index: Any = None
    max_facts: int = _MAX_FACTS_PER_USER


_users: dict[str, _UserMem] = {}
_users_lock = RLock()  # Thread-safe access to shared state


def _get_user(uid: str) -> _UserMem:
    """Get or create user memory. Validates user_id format."""
    # Sanitize user ID (alphanumeric, dash, underscore only)
    if not uid or not uid.replace("-", "").replace("_", "").isalnum():
        log.error("Invalid user_id format: %s", uid)
        raise ValueError(f"Invalid user_id: must be alphanumeric with - or _")
    
    with _users_lock:
        if uid not in _users:
            _users[uid] = _UserMem()
        return _users[uid]


def _embed(texts: list[str]):
    """Encode + L2-normalize → float32 matrix for IndexFlatIP (cosine)."""
    import numpy as np
    
    # Guard: empty input returns zero-row matrix
    if not texts:
        return np.empty((0, _DIM), dtype="float32")
    
    # Support both FastEmbed and SentenceTransformer APIs
    if hasattr(_encoder, "embed"):  # FastEmbed
        vecs = np.vstack(list(_encoder.embed(texts))).astype("float32")
    elif hasattr(_encoder, "encode"):  # SentenceTransformer
        vecs = _encoder.encode(texts, convert_to_numpy=True, normalize_embeddings=False).astype("float32")
    else:
        raise ValueError("Unknown encoder type")
    
    # L2-normalize so IndexFlatIP scores == cosine similarity
    norms = np.linalg.norm(vecs, axis=1, keepdims=True)
    norms[norms == 0] = 1.0  # avoid division by zero
    return vecs / norms


def _parse_json_array(text: str) -> list:
    """Extract a JSON array from LLM output (handles fences). Never raises."""
    try:
        text = text.strip()
        if not text:
            return []
        
        # Handle markdown code fences
        if "```" in text:
            try:
                s = text.index("```")
                e = text.rindex("```")
                if s < e:  # Valid pair
                    inner = text[s + 3 : e]
                    text = (inner.split("\n", 1)[1] if "\n" in inner else inner).strip()
            except (ValueError, IndexError):
                pass  # Use original text
        
        # Extract JSON array
        i = text.find("[")
        j = text.rfind("]")
        if i == -1 or j == -1 or i >= j:
            return []
        
        return json.loads(text[i : j + 1])
        
    except (json.JSONDecodeError, ValueError, TypeError, AttributeError) as e:
        log.warning("Failed to parse JSON array from LLM output: %s", e)
        return []


# ── Public API ──────────────────────────────────────────────────────────

def extract_facts(messages: list[dict[str, str]], llm: Any) -> list[dict]:
    """LLM-extract preference facts from messages. Never raises."""
    if not messages:
        return []

    conv = "\n".join(
        f"{m.get('role', '?')}: {m.get('content', '')}"
        for m in messages
        if m.get("content")
    )
    if not conv.strip():
        return []

    # Smart truncation at sentence boundary
    MAX_LEN = 3000
    if len(conv) > MAX_LEN:
        truncated = conv[:MAX_LEN]
        for sep in [". ", "! ", "? ", "\n"]:
            idx = truncated.rfind(sep)
            if idx > MAX_LEN * 0.8:  # Keep 80%+
                conv = truncated[: idx + len(sep)]
                break
        else:
            conv = truncated  # No good boundary

    try:
        resp = llm.invoke(
            _EXTRACT_PROMPT.format(
                predicates=", ".join(sorted(_PREDICATES)),
                conversation=conv,
            )
        )
        facts = _parse_json_array(resp.content)
    except Exception as e:
        log.error("Fact extraction failed: %s", e)
        return []

    return [
        f
        for f in facts
        if isinstance(f, dict)
        and f.get("predicate") in _PREDICATES
        and f.get("value")
    ]


def add_facts(user_id: str, facts: list[dict]) -> int:
    """Store new facts for user. Returns count added (0 on failure)."""
    if not facts or not user_id:
        return 0
    if not _load_deps():
        return 0

    try:
        mem = _get_user(user_id)
    except ValueError:
        return 0

    with _users_lock:
        # Deduplicate against stored facts
        existing = {(f["predicate"], f["value"]) for f in mem.facts}
        new = [
            f
            for f in facts
            if isinstance(f, dict)
            and f.get("predicate") in _PREDICATES
            and f.get("value")
            and (f["predicate"], f["value"]) not in existing
        ]
        if not new:
            return 0

        # Enforce memory limit (FIFO eviction)
        total_after = len(mem.facts) + len(new)
        if total_after > mem.max_facts:
            excess = total_after - mem.max_facts
            log.info("Evicting %d old facts for user %s", excess, user_id)
            mem.facts = mem.facts[excess:]  # Drop oldest
            
            # Rebuild index from remaining facts
            if mem.facts:
                mem.index = _faiss.IndexFlatIP(_DIM)
                existing_vecs = _embed(
                    [f"{f['predicate']}: {f['value']}" for f in mem.facts]
                )
                mem.index.add(existing_vecs)
            else:
                mem.index = None

        try:
            vecs = _embed([f"{f['predicate']}: {f['value']}" for f in new])
            if mem.index is None:
                mem.index = _faiss.IndexFlatIP(_DIM)
            
            # Atomic: add to index FIRST, then facts (rollback-safe)
            mem.index.add(vecs)
            mem.facts.extend(new)
        except Exception as e:
            log.error("Failed to embed/index facts: %s", e)
            return 0

        log.info("Added %d facts for user %s (total: %d)",
                 len(new), user_id, len(mem.facts))
        return len(new)


def recall(user_id: str, query: str, k: int = 5) -> list[dict]:
    """Top-k relevant facts for user. Empty list if none or unavailable."""
    if not query or not user_id or k < 1:
        return []
    if not _load_deps():
        return []

    try:
        mem = _get_user(user_id)
    except ValueError:
        return []

    import numpy as np
    
    # Keep lock during search - FAISS is not thread-safe for concurrent read/write
    with _users_lock:
        if not mem.facts or mem.index is None:
            return []
        
        try:
            k = min(k, len(mem.facts))
            scores, indices = mem.index.search(_embed([query]), k)
            # Snapshot results while under lock
            facts_snapshot = list(mem.facts)
        except Exception as e:
            log.error("Recall search failed: %s", e)
            return []

    return [
        {**facts_snapshot[idx], "relevance": round(float(sc), 3)}
        for sc, idx in zip(scores[0], indices[0])
        if 0 <= idx < len(facts_snapshot)
        and sc >= _SIM_THRESHOLD
        and not np.isnan(sc)
        and not np.isinf(sc)
    ]


def memory_context(user_id: str, query: str, k: int = 5) -> str:
    """Recalled facts formatted for prompt injection. Empty if none."""
    if k < 1:
        k = 5  # Auto-correct to default
    facts = recall(user_id, query, k)
    if not facts:
        return ""
    lines = [f"- {f['predicate']}: {f['value']}" for f in facts]
    return "Known user preferences:\n" + "\n".join(lines)


def clear_user(user_id: str) -> None:
    """Drop all stored facts for a user."""
    with _users_lock:
        _users.pop(user_id, None)


def user_fact_count(user_id: str) -> int:
    """Number of stored facts for a user."""
    with _users_lock:
        mem = _users.get(user_id)
        return len(mem.facts) if mem else 0


# ── Optional file persistence ──────────────────────────────────────────

def save_snapshot(path: str) -> bool:
    """Persist all user memories to JSON file. Returns True on success."""
    with _users_lock:
        if not _users:
            return True
        try:
            data = {}
            for uid, mem in _users.items():
                # Encode FAISS index as base64 for JSON compatibility
                idx_bytes = None
                if mem.index and mem.facts and _faiss is not None:
                    raw_bytes = _faiss.serialize_index(mem.index)
                    idx_bytes = base64.b64encode(raw_bytes).decode("ascii")
                
                data[uid] = {"facts": mem.facts, "index_bytes": idx_bytes}
            
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            
            log.info("Memory saved: %s (%d users)", path, len(data))
            return True
        except Exception as e:
            log.error("Snapshot save failed: %s", e)
            return False


def load_snapshot(path: str) -> int:
    """Restore from JSON file. Returns user count loaded (0 on failure)."""
    if not os.path.exists(path):
        return 0
    if not _load_deps():
        return 0
    
    try:
        # Security: warn if file has weak permissions
        stat = os.stat(path)
        if stat.st_mode & 0o077:
            log.warning("Snapshot file has weak permissions: %s", path)
        
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)  # Safe deserialization (no pickle)
        
        # Schema validation
        if not isinstance(data, dict):
            log.error("Invalid snapshot format: expected dict")
            return 0
        
        loaded = 0
        with _users_lock:
            for uid, entry in data.items():
                if not isinstance(entry, dict):
                    continue
                
                # Validate and filter facts
                raw_facts = entry.get("facts", [])
                valid_facts = [
                    f for f in raw_facts
                    if isinstance(f, dict)
                    and "predicate" in f
                    and "value" in f
                    and f["predicate"] in _PREDICATES
                ]
                
                if len(valid_facts) != len(raw_facts):
                    log.warning("Filtered %d invalid facts for user %s",
                               len(raw_facts) - len(valid_facts), uid)
                
                try:
                    mem = _get_user(uid)
                except ValueError:
                    log.warning("Skipping user with invalid ID: %s", uid)
                    continue
                
                mem.facts = valid_facts
                idx_b64 = entry.get("index_bytes")
                
                if idx_b64 is not None:
                    try:
                        idx_bytes = base64.b64decode(idx_b64)
                        mem.index = _faiss.deserialize_index(idx_bytes)
                    except Exception as e:
                        log.warning("Failed to decode index for %s: %s", uid, e)
                        mem.index = None
                
                # Rebuild index if needed
                if mem.index is None and mem.facts:
                    mem.index = _faiss.IndexFlatIP(_DIM)
                    mem.index.add(_embed(
                        [f"{f['predicate']}: {f['value']}" for f in mem.facts]
                    ))
                
                loaded += 1
        
        log.info("Memory loaded: %d users from %s", loaded, path)
        return loaded
    except Exception as e:
        log.error("Snapshot load failed: %s", e)
        return 0


__all__ = [
    "extract_facts", "add_facts", "recall", "memory_context",
    "clear_user", "user_fact_count", "save_snapshot", "load_snapshot",
]
