from types import SimpleNamespace

from backend.shared import gemini


def test_invoke_with_model_fallback_cached_reuses_response(monkeypatch):
    calls = []
    gemini._RESPONSE_CACHE.clear()

    def fake_invoke(prompt, *, temperature, preferred_model="gemini-2.5-flash"):
        calls.append((prompt, temperature, preferred_model))
        return SimpleNamespace(content=f"response-{len(calls)}")

    monkeypatch.setattr(gemini, "invoke_with_model_fallback", fake_invoke)

    first = gemini.invoke_with_model_fallback_cached("same prompt", temperature=0.2, cache_ttl_seconds=60)
    second = gemini.invoke_with_model_fallback_cached("same   prompt", temperature=0.2, cache_ttl_seconds=60)

    assert first is second
    assert first.content == "response-1"
    assert len(calls) == 1


def test_invoke_with_model_fallback_cached_can_be_disabled(monkeypatch):
    calls = []
    gemini._RESPONSE_CACHE.clear()

    def fake_invoke(prompt, *, temperature, preferred_model="gemini-2.5-flash"):
        calls.append(prompt)
        return SimpleNamespace(content=f"response-{len(calls)}")

    monkeypatch.setattr(gemini, "invoke_with_model_fallback", fake_invoke)

    first = gemini.invoke_with_model_fallback_cached("same prompt", temperature=0.2, cache_ttl_seconds=0)
    second = gemini.invoke_with_model_fallback_cached("same prompt", temperature=0.2, cache_ttl_seconds=0)

    assert first.content == "response-1"
    assert second.content == "response-2"
    assert len(calls) == 2
