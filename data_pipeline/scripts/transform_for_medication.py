from __future__ import annotations

import numpy as np
import pandas as pd


def _normalize_text(value) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text if text else None


def _normalize_list(value) -> list[str]:
    if value is None:
        return []
    if isinstance(value, (list, tuple, np.ndarray, pd.Series)):
        items = value
    else:
        items = [value]

    out: list[str] = []
    for item in items:
        if item is None:
            continue
        s = str(item).strip()
        if s:
            out.append(s)
    return out


def _pick_name(row: pd.Series) -> str | None:
    brands = row.get("brand_names") or []
    generics = row.get("generic_names") or []
    if brands:
        return str(brands[0]).strip() or None
    if generics:
        return str(generics[0]).strip() or None
    return None


def filter_diversify_and_map(
    df: pd.DataFrame,
    n_per_type: int,
    exclude_types: set[str],
) -> pd.DataFrame:
    """Filter/diversify source labels and map to medication-native columns."""
    if df.empty:
        return pd.DataFrame(
            columns=[
                "name",
                "dosage",
                "substances",
                "warnings",
                "contradictions",
                "drug_interactions",
            ]
        )

    out = df.copy()

    for col in ["brand_names", "generic_names", "substances"]:
        if col in out.columns:
            out[col] = out[col].apply(_normalize_list)

    text_cols = [
        "manufacturer",
        "product_type",
        "indications",
        "dosage",
        "warnings",
        "drug_interactions",
        "contraindications",
    ]
    for col in text_cols:
        if col in out.columns:
            out[col] = out[col].apply(_normalize_text)

    out["name"] = out.apply(_pick_name, axis=1)
    out = out[out["name"].notna()]
    out = out[out["indications"].notna()]

    out["product_type_norm"] = out["product_type"].fillna("UNKNOWN").str.upper().str.strip()
    out = out[~out["product_type_norm"].isin({x.upper() for x in exclude_types})]

    # Vectorized quality score, then cap rows per product type for diversity.
    out["ind_len"] = out["indications"].str.len().fillna(0).astype(int)
    out["warn_len"] = out["warnings"].fillna("").str.len().astype(int)
    out["quality_score"] = np.clip(out["ind_len"], 0, 2000) + np.clip(out["warn_len"], 0, 1000)

    out = out.sort_values(["product_type_norm", "quality_score"], ascending=[True, False])
    out["within_type_rank"] = out.groupby("product_type_norm").cumcount()
    out = out[out["within_type_rank"] < int(n_per_type)]

    out["substances"] = out["substances"].apply(_normalize_list)
    out["warnings"] = out["warnings"].fillna("")
    out["contradictions"] = out["contraindications"].fillna("")
    out["drug_interactions"] = out["drug_interactions"].fillna("")

    medication_df = out[
        [
            "name",
            "dosage",
            "substances",
            "warnings",
            "contradictions",
            "drug_interactions",
        ]
    ].copy()
    medication_df = medication_df.drop_duplicates(subset=["name", "dosage"], keep="first")
    medication_df = medication_df.reset_index(drop=True)
    return medication_df
