from __future__ import annotations

import hashlib
import logging
import os
import time
from threading import Lock
from typing import Any

from langchain_google_genai import ChatGoogleGenerativeAI

log = logging.getLogger(__name__)


class AssistantConfigError(RuntimeError):
    """Raised when assistant provider config is missing or invalid."""

    code = "assistant_config_error"


class AssistantRuntimeError(RuntimeError):
    """Raised when assistant provider call fails at runtime."""

    code = "assistant_runtime_error"


_LLM_CACHE: dict[tuple[str, float], ChatGoogleGenerativeAI] = {}
_RESPONSE_CACHE: dict[str, tuple[float, Any]] = {}
_LLM_LOCK = Lock()
_STATUS_LOGGED = False
_DEFAULT_MODEL = "gemini-2.5-flash"
_DEFAULT_FALLBACK_MODELS = ("gemini-2.0-flash", "gemini-2.0-flash-lite")


def _resolve_api_key() -> str | None:
    key = (os.getenv("GOOGLE_API_KEY") or "").strip()
    if key:
        return key
    alias = (os.getenv("GEMINI_API_KEY") or "").strip()
    return alias or None


def assistant_llm_is_configured() -> bool:
    return _resolve_api_key() is not None


def _model_candidates(preferred_model: str = _DEFAULT_MODEL) -> list[str]:
    env_value = (os.getenv("GEMINI_FALLBACK_MODELS") or "").strip()
    configured = [item.strip() for item in env_value.split(",") if item.strip()]
    ordered = [preferred_model, *configured, *_DEFAULT_FALLBACK_MODELS]

    deduped: list[str] = []
    for model in ordered:
        if model not in deduped:
            deduped.append(model)
    return deduped


def _is_retryable_runtime_error(exc: Exception) -> bool:
    message = str(exc).lower()
    signals = (
        "503",
        "500",
        "429",
        "unavailable",
        "overloaded",
        "deadline",
        "timed out",
        "timeout",
        "rate limit",
        "high demand",
        "try again later",
    )
    return any(signal in message for signal in signals)


def log_assistant_llm_status_once() -> None:
    global _STATUS_LOGGED
    with _LLM_LOCK:
        if _STATUS_LOGGED:
            return
        _STATUS_LOGGED = True
    log.info("Assistant LLM config status: configured=%s", assistant_llm_is_configured())


def get_gemini_llm(*, temperature: float, model: str = _DEFAULT_MODEL) -> ChatGoogleGenerativeAI:
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


def invoke_with_model_fallback(
    prompt: str,
    *,
    temperature: float,
    preferred_model: str = _DEFAULT_MODEL,
):
    last_exc: Exception | None = None
    candidates = _model_candidates(preferred_model)

    for index, model in enumerate(candidates):
        llm = get_gemini_llm(temperature=temperature, model=model)
        try:
            return llm.invoke(prompt)
        except Exception as exc:
            classified = classify_llm_error(exc)
            if isinstance(classified, AssistantConfigError):
                raise classified from exc

            last_exc = exc
            if index == len(candidates) - 1 or not _is_retryable_runtime_error(exc):
                raise classified from exc

            log.warning(
                "Gemini model %s failed with retryable error; trying next model (%s/%s): %s",
                model,
                index + 2,
                len(candidates),
                exc,
            )

    if last_exc is not None:
        raise classify_llm_error(last_exc) from last_exc

    raise AssistantRuntimeError("Assistant AI generation failed at runtime.")


def invoke_with_model_fallback_cached(
    prompt: str,
    *,
    temperature: float,
    preferred_model: str = _DEFAULT_MODEL,
    cache_ttl_seconds: int | None = None,
):
    ttl = (
        int(cache_ttl_seconds)
        if cache_ttl_seconds is not None
        else int(os.getenv("GEMINI_RESPONSE_CACHE_TTL_SECONDS", "300"))
    )
    if ttl <= 0:
        return invoke_with_model_fallback(
            prompt,
            temperature=temperature,
            preferred_model=preferred_model,
        )

    normalized = " ".join(str(prompt or "").split())
    cache_key = hashlib.sha256(
        f"{preferred_model}|{temperature}|{normalized}".encode("utf-8")
    ).hexdigest()
    now = time.monotonic()
    with _LLM_LOCK:
        cached = _RESPONSE_CACHE.get(cache_key)
        if cached and now - cached[0] <= ttl:
            return cached[1]

    response = invoke_with_model_fallback(
        prompt,
        temperature=temperature,
        preferred_model=preferred_model,
    )
    with _LLM_LOCK:
        _RESPONSE_CACHE[cache_key] = (now, response)
    return response
