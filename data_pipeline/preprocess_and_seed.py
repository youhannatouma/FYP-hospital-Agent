#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path

from scripts.config import EXCLUDE_TYPES, N_PER_TYPE, SOURCE_SQL, db_config
from scripts.parse_source import build_source_dataframe
from scripts.seed_medication import insert_medication_rows
from scripts.transform_for_medication import filter_diversify_and_map


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Preprocess OpenFDA labels and seed existing medication table"
    )
    parser.add_argument("--dry-run", action="store_true", help="Preview selected rows without DB insert")
    parser.add_argument("--n-per-type", type=int, default=N_PER_TYPE, help="Rows kept per product_type")
    parser.add_argument(
        "--exclude-type",
        action="append",
        default=list(EXCLUDE_TYPES),
        help="product_type to exclude (repeatable)",
    )
    parser.add_argument("--source-sql", type=Path, default=SOURCE_SQL, help="Path to drug_labels.sql")
    args = parser.parse_args()

    source_sql = args.source_sql.resolve()
    if not source_sql.exists():
        raise FileNotFoundError(f"Source SQL not found: {source_sql}")

    source_df = build_source_dataframe(source_sql)
    medication_df = filter_diversify_and_map(
        source_df,
        n_per_type=args.n_per_type,
        exclude_types={x.upper().strip() for x in args.exclude_type if x and x.strip()},
    )

    print(f"Source rows parsed: {len(source_df)}")
    print(f"Rows selected for medication table: {len(medication_df)}")

    if medication_df.empty:
        print("No rows selected. Nothing to insert.")
        return

    print("Preview (first 10 rows):")
    print(medication_df.head(10).to_string(index=False))

    if args.dry_run:
        print("Dry run enabled. No DB writes performed.")
        return

    inserted = insert_medication_rows(medication_df, db_config())
    print(f"Inserted into medication: {inserted}")


if __name__ == "__main__":
    main()
