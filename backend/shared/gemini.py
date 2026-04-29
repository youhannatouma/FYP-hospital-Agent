from __future__ import annotations

import logging
import os
from threading import Lock

from langchain_google_genai import ChatGoogleGenerativeAI

log = logging.getLogger(__name__)


class AssistantConfigError(RuntimeError):
    """Raised when assistant provider config is missing or invalid."""

    code = "assistant_config_error"


class AssistantRuntimeError(RuntimeError):
    """Raised when assistant provider call fails at runtime."""

    code = "assistant_runtime_error"


_LLM_CACHE: dict[tuple[str, float], ChatGoogleGenerativeAI] = {}
_LLM_LOCK = Lock()
_STATUS_LOGGED = False


def _resolve_api_key() -> str | None:
    key = (os.getenv("GOOGLE_API_KEY") or "").strip()
    if key:
        return key
    alias = (os.getenv("GEMINI_API_KEY") or "").strip()
    return alias or None


def assistant_llm_is_configured() -> bool:
    return _resolve_api_key() is not None


def log_assistant_llm_status_once() -> None:
    global _STATUS_LOGGED
    with _LLM_LOCK:
        if _STATUS_LOGGED:
            return
        _STATUS_LOGGED = True
    log.info("Assistant LLM config status: configured=%s", assistant_llm_is_configured())


def get_gemini_llm(*, temperature: float, model: str = "gemini-2.5-flash") -> ChatGoogleGenerativeAI:
    key = _resolve_api_key()
    if not key:
        raise AssistantConfigError(
            "Assistant AI provider is not configured. Set GOOGLE_API_KEY (or GEMINI_API_KEY)."
        )

    cache_key = (model, temperature)
    with _LLM_LOCK:
        cached = _LLM_CACHE.get(cache_key)
        if cached is not None:
            return cached

        try:
            timeout = float(os.getenv("GEMINI_REQUEST_TIMEOUT_SECONDS", "20"))
            retries = int(os.getenv("GEMINI_RETRIES", "1"))
            client = ChatGoogleGenerativeAI(
                model=model,
                temperature=temperature,
                google_api_key=key,
                request_timeout=timeout,
                retries=retries,
            )
        except Exception as exc:
            raise AssistantConfigError("Assistant AI client failed to initialize.") from exc

        _LLM_CACHE[cache_key] = client
        return client


def classify_llm_error(exc: Exception) -> AssistantConfigError | AssistantRuntimeError:
    message = str(exc).lower()
    config_signals = (
        "api key",
        "api_key",
        "permission denied",
        "unauthorized",
        "invalid argument",
        "authentication",
        "credential",
        "forbidden",
        "quota project",
    )
    if any(signal in message for signal in config_signals):
        return AssistantConfigError("Assistant AI configuration is invalid or unauthorized.")
    return AssistantRuntimeError("Assistant AI generation failed at runtime.")
