"""Medication tools — query, rank, safety-check, recommend."""
from __future__ import annotations
import json, os, logging
from threading import RLock
from typing import Any
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.pool import QueuePool

load_dotenv()
log = logging.getLogger(__name__)

<<<<<<< HEAD
# ── DB config (single FYP database) ─────────────────────────────────────
_DB = dict(
    dbname=os.getenv("DB_NAME", "FYP"),
    user=os.getenv("DB_USER", "postgres"),
    password=os.getenv("DB_PASSWORD", "1234567890"),
    host=os.getenv("DB_HOST", "localhost"),
    port=int(os.getenv("DB_PORT", "5432")),
=======
# ── DB configs ──────────────────────────────────────────────────────────
_MED_DB = dict(
    dbname=os.getenv("MED_DB_NAME", "health_assistant"),
    user=os.getenv("MED_DB_USER", "guenayfer"),
    password=os.getenv("MED_DB_PASSWORD"),
    host=os.getenv("MED_DB_HOST", "localhost"),
    port=int(os.getenv("MED_DB_PORT", "5432")),
)
_FYP_DB = dict(
    dbname=os.getenv("FYP_DB_NAME", "FYP"),
    user=os.getenv("FYP_DB_USER", "postgres"),
    password=os.getenv("FYP_DB_PASSWORD"),
    host=os.getenv("FYP_DB_HOST", "localhost"),
    port=int(os.getenv("FYP_DB_PORT", "5432")),
>>>>>>> 21193b7391a3600f8ee6577ed93090a0327c2dbe
)
_llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)
_EMPTY_PROFILE: dict[str, Any] = {
    "name": "Unknown", "allergies": [], "current_medications": [],
    "conditions": [], "age": None, "pregnant": False,
}
_ENGINE_CACHE: dict[tuple[str, str, int, str, str], Any] = {}
_ENGINE_CACHE_LOCK = RLock()


# ── DB helpers (all catch psycopg2 errors) ──────────────────────────────
def _engine_for(cfg: dict):
    if not cfg.get("password"):
        raise RuntimeError("Missing database password configuration for medication tools.")
    key = (
        cfg.get("host", "localhost"),
        cfg.get("dbname", ""),
        int(cfg.get("port", 5432)),
        cfg.get("user", ""),
        cfg.get("password", ""),
    )
    with _ENGINE_CACHE_LOCK:
        engine = _ENGINE_CACHE.get(key)
        if engine is None:
            url = (
                f"postgresql+psycopg2://{key[3]}:{key[4]}@{key[0]}:{key[2]}/{key[1]}"
            )
            engine = create_engine(
                url,
                poolclass=QueuePool,
                load_dotenv()
                log = logging.getLogger(__name__)

                # ── DB config (single FYP database) ─────────────────────────────────────
                _DB = dict(
                    dbname=os.getenv("DB_NAME", "FYP"),
                    user=os.getenv("DB_USER", "postgres"),
                    password=os.getenv("DB_PASSWORD", "1234567890"),
                    host=os.getenv("DB_HOST", "localhost"),
                    port=int(os.getenv("DB_PORT", "5432")),
                )
    except SQLAlchemyError as e:
        log.error("DB exists-check failed: %s", e)
        return False


def _parse_json(text: str) -> dict:
    """Extract JSON from LLM output — handles fences, surrounding text."""
    text = text.strip()
    if "```" in text:
        start, end = text.index("```"), text.rindex("```")
        if start != end:
            inner = text[start:end]
            text = (inner.split("\n", 1)[1] if "\n" in inner else inner[3:]).strip()
    i, j = text.find("{"), text.rfind("}")
    if i != -1 and j != -1:
        text = text[i:j + 1]
    return json.loads(text)


def _t(val: str | None, n: int = 400) -> str:
    return (val or "")[:n]


# ── 1. query + rank ────────────────────────────────────────────────────
def query_and_rank_drugs(symptom: str, limit: int = 7) -> list[dict[str, Any]]:
    """Query medication-native fields and map rows into pipeline format."""
    if not symptom or not symptom.strip():
        log.warning("Empty symptom")
        return []

    rows = _query(
        _DB,
        """SELECT name, dosage, substances, warnings, contradictions, drug_interactions
           FROM medication
           WHERE name ILIKE %(p)s
              OR dosage ILIKE %(p)s
              OR warnings ILIKE %(p)s
              OR contradictions ILIKE %(p)s
              OR drug_interactions ILIKE %(p)s
           LIMIT %(l)s""",
        {"p": f"%{symptom.strip()[:200]}%", "l": limit},
    )

    if not rows:
        log.info("No drugs found for: %s", symptom)
        return []

    mapped = [
        {
            "brand_names": [r.get("name")] if r.get("name") else [],
            "generic_names": [],
            "manufacturer": None,
            "product_type": "GENERAL",
            "substances": r.get("substances") or [],
            "indications": r.get("warnings") or r.get("contradictions") or "",
            "dosage": r.get("dosage") or "",
            "warnings": r.get("warnings") or "",
            "drug_interactions": r.get("drug_interactions") or "",
            "contradictions": r.get("contradictions") or "",
        }
        for r in rows
    ]

    def _k(d: dict) -> tuple:
        b = d.get("brand_names") or []
        return (str(b[0]).upper() if b else "ZZZ",)

    return sorted(mapped, key=_k)


# ── 2. user profile ───────────────────────────────────────────────────
def get_user_profile(user_id: str) -> dict[str, Any]:
    """Fetch patient from FYP DB. Returns safe defaults on any failure."""
    if not user_id or not str(user_id).strip():
        log.warning("Empty user_id")
        return dict(_EMPTY_PROFILE)

    row = _query_one(_DB,
        """SELECT first_name, last_name, date_of_birth,
                  allergies, chronic_conditions
           FROM usr WHERE user_id = %s AND deleted_at IS NULL""", (user_id,))

    if not row:
        log.warning("User not found: %s", user_id)
        return dict(_EMPTY_PROFILE)

    meds = _query(
        _DB,
        """SELECT medications FROM prescription
           WHERE patient_id = %s AND deleted_at IS NULL
             AND (expiry_date IS NULL OR expiry_date >= CURRENT_DATE)""",
        (user_id,),
    )
    current_meds = [m for r in meds for m in (r.get("medications") or [])]

    age = None
    dob = row.get("date_of_birth")
    if dob:
        from datetime import date
        today = date.today()
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))

    name = f"{row.get('first_name', '')} {row.get('last_name', '')}".strip()
    return {
        "name": name or "Unknown",
        "allergies": row.get("allergies") or [],
        "current_medications": current_meds,
        "conditions": row.get("chronic_conditions") or [],
        "age": age,
        "pregnant": False,
    }


# ── 3. allergy pre-filter ─────────────────────────────────────────────
def filter_allergic_drugs(
    drugs: list[dict[str, Any]], user_profile: dict[str, Any],
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Split into (allowed, allergic). Substring match on substances."""
    if not drugs:
        return [], []
    if not isinstance(user_profile, dict):
        log.warning("Malformed user_profile — skipping allergy filter")
        return drugs, []

    allergies = [a.lower().strip()
                 for a in user_profile.get("allergies", [])
                 if isinstance(a, str) and a.strip()]
    if not allergies:
        return drugs, []

    allowed, allergic = [], []
    for d in drugs:
        subs = [s.lower() for s in (d.get("substances") or [])
                if isinstance(s, str) and s]
        hits = [a for a in allergies if any(a in s for s in subs)]
        if hits:
            allergic.append({**d, "matched_allergies": hits})
        else:
            allowed.append(d)
    return allowed, allergic


# ── 4. LLM safety check ───────────────────────────────────────────────
_SAFETY_PROMPT = (
    "Check these drugs for interactions with the patient's current medications "
    "and contradictions given their conditions/age/pregnancy. "
    "Allergies are already handled. Return ONLY valid JSON:\n"
    '{{"safe":[{{"brand_names":[...],"substances":[...],"reason":"..."}}],'
    '"flagged":[{{"brand_names":[...],"substances":[...],'
    '"risk_level":"high|medium|low","flags":["..."]}}]}}\n'
    "Patient:{user_profile}\nDrugs:{drugs}"
)


def _flag_all(drugs: list[dict], reason: str) -> dict[str, Any]:
    """Fail-safe: flag every drug as medium risk with given reason."""
    return {
        "safe": [],
        "flagged": [{"brand_names": d.get("brand_names", []),
                      "substances": d.get("substances", []),
                      "risk_level": "medium", "flags": [reason]}
                     for d in drugs],
    }


def llm_safety_check(
    drugs: list[dict[str, Any]],
    user_profile: dict[str, Any] | None = None,
    user_id: str | None = None,
) -> dict[str, Any]:
    """Phase 1: allergy filter. Phase 2: LLM interactions check."""
    if not drugs:
        return {"safe": [], "flagged": []}

    # Resolve profile
    if user_profile is None:
        if not user_id:
            log.error("No user_profile or user_id — flagging all drugs")
            return _flag_all(drugs, "No user profile — cannot verify safety.")
        user_profile = get_user_profile(user_id)

    # Phase 1: deterministic allergy filter
    allowed, allergic = filter_allergic_drugs(drugs, user_profile)
    allergy_flagged = [
        {"brand_names": d.get("brand_names", []),
         "substances": d.get("substances", []),
         "risk_level": "high",
         "flags": [f"ALLERGY: contains {a}" for a in d.get("matched_allergies", [])]}
        for d in allergic
    ]

    if not allowed:
        return {"safe": [], "flagged": allergy_flagged}

    # Skip LLM if nothing to check against
    if not (user_profile.get("current_medications")
            or user_profile.get("conditions")
            or user_profile.get("pregnant")):
        return {
            "safe": [{"brand_names": d.get("brand_names", []),
                       "substances": d.get("substances", []),
                       "reason": "No interactions to check."} for d in allowed],
            "flagged": allergy_flagged,
        }

    # Phase 2: LLM
    compact = [
        {"brand_names": d.get("brand_names", []),
         "substances": d.get("substances", []),
         "drug_interactions": _t(d.get("drug_interactions")),
         "contradictions": _t(d.get("contradictions"))}
        for d in allowed
    ]
    sep = (",", ":")
    try:
        resp = _llm.invoke(_SAFETY_PROMPT.format(
            user_profile=json.dumps(user_profile, separators=sep),
            drugs=json.dumps(compact, separators=sep)))
        try:
            result = json.loads(resp.content)
        except json.JSONDecodeError:
            result = _parse_json(resp.content)
    except Exception as e:
        log.error("LLM safety check failed: %s", e)
        result = _flag_all(compact, "Safety check unavailable — review manually.")

    # Validate: remove hallucinated drugs, catch missing drugs
    input_keys = {tuple(d["brand_names"]) for d in compact}
    result["safe"] = [d for d in result.get("safe", [])
                      if tuple(d.get("brand_names", [])) in input_keys]
    result["flagged"] = [d for d in result.get("flagged", [])
                         if tuple(d.get("brand_names", [])) in input_keys]

    accounted = ({tuple(d.get("brand_names", [])) for d in result["safe"]}
                 | {tuple(d.get("brand_names", [])) for d in result["flagged"]})
    for d in compact:
        if tuple(d["brand_names"]) not in accounted:
            result["flagged"].append({
                "brand_names": d["brand_names"], "substances": d["substances"],
                "risk_level": "medium",
                "flags": ["LLM omitted this drug — flagged for review."],
            })

    result["flagged"] = allergy_flagged + result["flagged"]
    return result


# ── 5. stock check + pick candidates ──────────────────────────────────
def _get_stocks(brand_names: list[str]) -> set[str]:
    """Batch check stock availability for multiple brands."""
    if not brand_names:
        return set()
    rows = _query(_DB,
        """SELECT m.name FROM pharmacy_inventory pi
           JOIN medication m ON m.medication_id = pi.medication_id
           WHERE pi.quantity_available > 0 AND m.name ILIKE ANY(%s)""",
        ([f"%{b}%" for b in brand_names],))
    # Return normalized lower-case set of available brand names
    return {r["name"].lower() for r in rows}


def pick_top_candidates(
    safety_result: dict[str, Any], max_candidates: int = 2,
) -> list[dict[str, Any]]:
    """Top safe in-stock candidates; fill with low-risk if needed.
    Optimized to use a single DB query for stock checking.
    """
    if not safety_result:
        return []

    safe = safety_result.get("safe", [])
    low_risk = [f for f in safety_result.get("flagged", [])
                if f.get("risk_level") == "low"]

    # Collect all relevant brands to query at once
    all_brands = []
    for d in safe + low_risk:
        all_brands.extend(d.get("brand_names", []))

    if not all_brands:
        return []

    # One query to rule them all
    available_stock = _get_stocks(all_brands)

    def is_in_stock(d: dict) -> bool:
        """Check stock via exact match or prefix (avoids substring false positives)."""
        for brand in d.get("brand_names", []):
            bl = brand.lower()
            # Exact match OR stock is prefix of brand (e.g. 'advil' matches 'advil pm')
            if bl in available_stock or any(bl.startswith(s) for s in available_stock):
                return True
        return False

    candidates = [d for d in safe if is_in_stock(d)]
    
    if len(candidates) < max_candidates:
        candidates.extend(f for f in low_risk if is_in_stock(f))
        
    return candidates[:max_candidates]

# Legacy single check (kept for compatibility or individual checks)
def check_stock(drug: dict[str, Any]) -> bool:
    brands = drug.get("brand_names", [])
    return bool(_get_stocks(brands))


# ── 6. final answer ───────────────────────────────────────────────────
_ANSWER_PROMPT = (
    "Health assistant: recommend 1-2 medications from candidates for the "
    "symptom. Include dosage & warnings. End with \"Please consult a doctor "
    "or pharmacist before starting any new medication.\" Under 150 words.\n"
    "Symptom:{symptom}\nCandidates:{candidates}"
)


def generate_medication_response(
    symptom: str,
    candidates: list[dict[str, Any]],
    original_drugs: list[dict[str, Any]] | None = None,
) -> str:
    """LLM-generated recommendation. Returns hardcoded fallback on failure."""
    if not candidates:
        return (f"No safe medications available for '{symptom}'. "
                "Please consult a healthcare provider.")

    display = candidates
    if original_drugs:
        brand_set = {tuple(c.get("brand_names", [])) for c in candidates}
        enriched = [
            {"brand_names": d.get("brand_names", []),
             "substances": d.get("substances", []),
             "dosage": _t(d.get("dosage"), 300),
             "warnings": _t(d.get("warnings"), 200)}
            for d in original_drugs
            if tuple(d.get("brand_names", [])) in brand_set
        ]
        display = enriched or candidates

    try:
        return _llm.invoke(_ANSWER_PROMPT.format(
            symptom=symptom,
            candidates=json.dumps(display, separators=(",", ":")))).content
    except Exception as e:
        log.error("LLM answer generation failed: %s", e)
        names = ", ".join(
            (c.get("brand_names") or ["Unknown"])[0] for c in candidates)
        return (f"Based on your profile, these may help with '{symptom}': "
                f"{names}. Please consult a doctor or pharmacist "
                f"before starting any new medication.")


# ── full pipeline ──────────────────────────────────────────────────────
def medication_pipeline(
    symptom: str, user_id: str,
    user_profile: dict[str, Any] | None = None, limit: int = 7,
) -> dict[str, Any]:
    """Query → rank → safety → pick → answer. Never raises."""
    _err = {"drugs_found": 0, "safe": [], "flagged": [], "top_candidates": []}

    if not symptom or not symptom.strip():
        return {**_err, "response": "Please describe your symptoms so I can help."}

    # Allow proceeding if user_profile is explicitly provided (no user_id needed)
    if not user_profile and (not user_id or not str(user_id).strip()):
        return {**_err, "response":
                "Unable to verify your profile. Please log in and try again."}

    raw = query_and_rank_drugs(symptom, limit=limit)
    if not raw:
        return {**_err, "response":
                f"No medications found for '{symptom}'. "
                "Consult a healthcare provider."}

    safety = llm_safety_check(raw, user_profile=user_profile, user_id=user_id)
    top = pick_top_candidates(safety)

    if top:
        answer = generate_medication_response(symptom, top, original_drugs=raw)
    else:
        answer = (f"Medications were found for '{symptom}' but none are currently "
                  "available or safe for your profile. "
                  "Please consult a healthcare provider.")
    return {"drugs_found": len(raw), "safe": safety.get("safe", []),
            "flagged": safety.get("flagged", []),
            "top_candidates": top, "response": answer}


__all__ = [
    "query_and_rank_drugs", "get_user_profile",
    "filter_allergic_drugs", "llm_safety_check", "check_stock",
    "pick_top_candidates", "generate_medication_response", "medication_pipeline",
]
