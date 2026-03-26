from __future__ import annotations

import pandas as pd
import psycopg2
from psycopg2.extras import execute_values


def insert_medication_rows(df: pd.DataFrame, db_cfg: dict) -> int:
    """Insert rows into medication(name,dosage,substances,warnings,contradictions,drug_interactions)."""
    if df.empty:
        return 0

    cols = [
        "name",
        "dosage",
        "substances",
        "warnings",
        "contradictions",
        "drug_interactions",
    ]
    records = []
    for _, row in df.iterrows():
        records.append(
            (
                row.get("name"),
                row.get("dosage"),
                row.get("substances") or [],
                row.get("warnings") or "",
                row.get("contradictions") or "",
                row.get("drug_interactions") or "",
            )
        )

    sql = (
        "INSERT INTO medication (name, dosage, substances, warnings, contradictions, drug_interactions) "
        "VALUES %s"
    )

    conn = psycopg2.connect(**db_cfg)
    try:
        with conn.cursor() as cur:
            execute_values(cur, sql, records, page_size=200)
        conn.commit()
    finally:
        conn.close()

    return len(records)
