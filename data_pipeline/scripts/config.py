from __future__ import annotations

import os
from pathlib import Path


SOURCE_SQL = Path(__file__).resolve().parents[2] / "data" / "drug_labels.sql"
N_PER_TYPE = 5
EXCLUDE_TYPES = {"ANIMAL DRUG"}

MEDICATION_COLUMNS = [
    "name",
    "dosage",
    "substances",
    "warnings",
    "contradictions",
    "drug_interactions",
]


def db_config() -> dict:
    """Single DB config for the project (FYP)."""
    return {
        "dbname": os.getenv("DB_NAME", "FYP"),
        "user": os.getenv("DB_USER", "postgres"),
        "password": os.getenv("DB_PASSWORD", "1234567890"),
        "host": os.getenv("DB_HOST", "localhost"),
        "port": int(os.getenv("DB_PORT", "5432")),
    }
