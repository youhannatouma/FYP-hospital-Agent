# OpenFDA Preprocess and Seed

This pipeline reads `data/drug_labels.sql`, filters and diversifies rows by
`product_type`, then inserts selected data into the existing `medication` table in FYP.

No new medication fields are created. Only these existing columns are inserted:
- `name`
- `dosage`
- `substances`
- `warnings`
- `contradictions`
- `drug_interactions`

## Why these libraries

- `pandas`: best fit for table-shaped transformations (normalize columns, filter,
  group, rank, preview) with concise and reliable code.
- `numpy`: efficient vectorized scoring (`np.clip`) during quality ranking, avoiding
  Python loops for per-row numeric work.
- `psycopg2`: direct PostgreSQL insert support with fast `execute_values` batching.

This combination is optimal here because parsing/filtering happens once on a large dump,
and vectorized dataframe operations are significantly faster and easier to audit than
manual list/dict loops.

## Setup

Install dependencies in your active environment:

```bash
pip install pandas numpy psycopg2-binary
```

## DB configuration behavior

The script keeps your current single-DB setup intact.

Config uses one database only (`DB_*`):
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_PORT`

If these are already set in your `.env`, no env change is required.

## Script structure

- `data_pipeline/scripts/config.py`: pipeline constants and DB config
- `data_pipeline/scripts/parse_source.py`: parse SQL dump into dataframe
- `data_pipeline/scripts/transform_for_medication.py`: preprocess/filter/diversify and map to medication schema
- `data_pipeline/scripts/seed_medication.py`: batch insert into `medication`
- `data_pipeline/preprocess_and_seed.py`: orchestrator entrypoint

## Usage

From workspace root:

```bash
python data_pipeline/preprocess_and_seed.py --dry-run
python data_pipeline/preprocess_and_seed.py
```

Useful options:

```bash
python data_pipeline/preprocess_and_seed.py --n-per-type 5
python data_pipeline/preprocess_and_seed.py --exclude-type "ANIMAL DRUG"
python data_pipeline/preprocess_and_seed.py --source-sql data/drug_labels.sql
```

## What it does

1. Parses `INSERT INTO drug_labels VALUES ...` rows from source SQL.
2. Filters out low-quality rows (missing name candidates or indications).
3. Excludes configured product types.
4. Uses vectorized scoring and keeps top `N` rows per product type.
5. Maps to existing medication columns only: `name, dosage, substances, warnings, contradictions, drug_interactions`.
6. Batch inserts into `medication` table.
