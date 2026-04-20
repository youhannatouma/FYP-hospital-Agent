import os
import uuid
from types import SimpleNamespace

# Prevent import-time Gemini client validation errors from sibling tool modules.
os.environ.setdefault("GOOGLE_API_KEY", "test-key")

from backend.tools import doctor_matching_tools as dmt


def _candidate(doctor_id: str, name: str) -> dict:
    return {
        "doctor_id": doctor_id,
        "doctor_name": name,
        "specialty": "general medicine",
        "earliest_available_at": "2026-04-20T09:00:00",
        "avg_session_price": 50.0,
        "ranking_features": {
            "specialty_match_rank": 0,
            "earliest_available_at": "2026-04-20T09:00:00",
            "proximity_score": 0.5,
            "avg_fee": 50.0,
        },
    }


def _install_fake_llm(monkeypatch, content: str) -> None:
    class FakeLLM:
        def __init__(self, *args, **kwargs):
            pass

        def invoke(self, prompt):
            return SimpleNamespace(content=content)

    monkeypatch.setattr(dmt, "ChatGoogleGenerativeAI", FakeLLM)


def test_llm_refine_malformed_json_falls_back(monkeypatch):
    _install_fake_llm(monkeypatch, "not-json")

    cid1 = str(uuid.uuid4())
    cid2 = str(uuid.uuid4())
    candidates = [_candidate(cid1, "A"), _candidate(cid2, "B")]

    refined, meta = dmt._optional_llm_refine("need", candidates, True)

    assert refined == candidates
    assert meta["applied"] is False
    assert meta["reason"] == "json_parse_error"


def test_llm_refine_ignores_unknown_ids(monkeypatch):
    cid1 = str(uuid.uuid4())
    cid2 = str(uuid.uuid4())
    unknown = str(uuid.uuid4())
    payload = {
        "ordered_doctor_ids": [unknown, cid2],
    }
    _install_fake_llm(monkeypatch, str(payload).replace("'", '"'))

    candidates = [_candidate(cid1, "A"), _candidate(cid2, "B")]
    refined, meta = dmt._optional_llm_refine("need", candidates, True)

    assert [c["doctor_id"] for c in refined] == [cid2, cid1]
    assert meta["applied"] is True
    assert meta["unknown_id_count"] == 1


def test_llm_refine_deduplicates_ids(monkeypatch):
    cid1 = str(uuid.uuid4())
    cid2 = str(uuid.uuid4())
    payload = {
        "ordered_doctor_ids": [cid2, cid2, cid1],
    }
    _install_fake_llm(monkeypatch, str(payload).replace("'", '"'))

    candidates = [_candidate(cid1, "A"), _candidate(cid2, "B")]
    refined, meta = dmt._optional_llm_refine("need", candidates, True)

    assert [c["doctor_id"] for c in refined] == [cid2, cid1]
    assert meta["duplicate_id_count"] == 1
    assert len({c["doctor_id"] for c in refined}) == len(refined)


def test_llm_refine_partial_list_appends_deterministic_tail(monkeypatch):
    cid1 = str(uuid.uuid4())
    cid2 = str(uuid.uuid4())
    cid3 = str(uuid.uuid4())

    payload = {
        "ordered_doctor_ids": [cid2],
    }
    _install_fake_llm(monkeypatch, str(payload).replace("'", '"'))

    candidates = [
        _candidate(cid1, "A"),
        _candidate(cid2, "B"),
        _candidate(cid3, "C"),
    ]

    refined, meta = dmt._optional_llm_refine("need", candidates, True)

    assert [c["doctor_id"] for c in refined] == [cid2, cid1, cid3]
    assert meta["applied"] is True
    # Tail must preserve original deterministic order for missing IDs.
    assert [c["doctor_id"] for c in refined[1:]] == [cid1, cid3]
