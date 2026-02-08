"""
OpenFDA Drug Label Database Setup
=================================
Downloads a subset of OpenFDA drug.label data and loads into PostgreSQL.

Usage:
    python scripts/setup_openfda_db.py

Prerequisites:
    1. PostgreSQL running locally
    2. Create database: createdb health_assistant
    3. pip install psycopg2-binary requests

Adjust PARTITIONS_TO_DOWNLOAD to control how much data (1-3 for dev, all for prod)
"""

import os
import json
import zipfile
import requests
from io import BytesIO
from typing import Generator

import psycopg2
from psycopg2.extras import execute_values

# ============================================================================
# CONFIGURATION
# ============================================================================

# PostgreSQL connection - Postgres.app defaults
DB_CONFIG = {
    "dbname": "health_assistant",
    "user": "guenayfer",       # Your macOS username
    "password": "",            # Postgres.app uses no password by default
    "host": "localhost",
    "port": 5432
}

# How many partitions to download (there are ~13 total, each ~100-150 MB)
# Start with 1 for development, use None for all partitions in production
PARTITIONS_TO_DOWNLOAD = 1

# Where to cache downloaded files (set to None to skip caching)
CACHE_DIR = "data/openfda_cache"

# OpenFDA manifest URL
MANIFEST_URL = "https://api.fda.gov/download.json"


# ============================================================================
# DATABASE SCHEMA
# ============================================================================

CREATE_TABLES_SQL = """
-- Main drug labels table
CREATE TABLE IF NOT EXISTS drug_labels (
    id SERIAL PRIMARY KEY,
    spl_id VARCHAR(255) UNIQUE,  -- SPL document ID
    
    -- Names (searchable)
    brand_names TEXT[],
    generic_names TEXT[],
    manufacturer TEXT,
    
    -- Classification
    product_type VARCHAR(100),   -- OTC, PRESCRIPTION, etc.
    route TEXT[],                -- ORAL, TOPICAL, etc.
    
    -- Active ingredients (for allergy checking)
    substances TEXT[],
    
    -- Medical information
    indications TEXT,            -- What it treats
    dosage TEXT,                 -- How to take it
    warnings TEXT,
    drug_interactions TEXT,
    contraindications TEXT,
    adverse_reactions TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast searching
CREATE INDEX IF NOT EXISTS idx_drug_brand_names ON drug_labels USING GIN(brand_names);
CREATE INDEX IF NOT EXISTS idx_drug_generic_names ON drug_labels USING GIN(generic_names);
CREATE INDEX IF NOT EXISTS idx_drug_substances ON drug_labels USING GIN(substances);
CREATE INDEX IF NOT EXISTS idx_drug_product_type ON drug_labels(product_type);
"""


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_partition_urls() -> list[dict]:
    """Fetch the manifest and return partition info for drug.label."""
    print("Fetching OpenFDA manifest...")
    response = requests.get(MANIFEST_URL)
    response.raise_for_status()
    manifest = response.json()
    
    partitions = manifest["results"]["drug"]["label"]["partitions"]
    print(f"Found {len(partitions)} partitions")
    
    return partitions


def download_partition(url: str, partition_num: int) -> bytes:
    """Download a single partition ZIP file."""
    
    # Check cache first
    if CACHE_DIR:
        os.makedirs(CACHE_DIR, exist_ok=True)
        cache_path = os.path.join(CACHE_DIR, f"partition_{partition_num}.zip")
        if os.path.exists(cache_path):
            print(f"  Using cached file: {cache_path}")
            with open(cache_path, "rb") as f:
                return f.read()
    
    # Download
    print(f"  Downloading from {url}...")
    response = requests.get(url, stream=True)
    response.raise_for_status()
    
    content = response.content
    
    # Cache for next time
    if CACHE_DIR:
        with open(cache_path, "wb") as f:
            f.write(content)
        print(f"  Cached to {cache_path}")
    
    return content


def extract_drug_records(zip_content: bytes) -> Generator[dict, None, None]:
    """Extract and parse drug records from a ZIP file, yielding only needed fields."""
    
    with zipfile.ZipFile(BytesIO(zip_content)) as zf:
        for filename in zf.namelist():
            if filename.endswith('.json'):
                with zf.open(filename) as f:
                    data = json.load(f)
                    
                    for record in data.get("results", []):
                        yield parse_drug_record(record)


def parse_drug_record(record: dict) -> dict:
    """Extract only the fields we need from a raw OpenFDA record."""
    
    openfda = record.get("openfda", {})
    
    # Helper to join list fields into text
    def join_list(field_name: str) -> str:
        items = record.get(field_name, [])
        if isinstance(items, list):
            return " ".join(items)
        return str(items) if items else ""
    
    return {
        "spl_id": record.get("id") or record.get("set_id"),
        "brand_names": openfda.get("brand_name", []),
        "generic_names": openfda.get("generic_name", []),
        "manufacturer": ", ".join(openfda.get("manufacturer_name", [])),
        "product_type": ", ".join(openfda.get("product_type", [])),
        "route": openfda.get("route", []),
        "substances": openfda.get("substance_name", []),
        "indications": join_list("indications_and_usage"),
        "dosage": join_list("dosage_and_administration"),
        "warnings": join_list("warnings"),
        "drug_interactions": join_list("drug_interactions"),
        "contraindications": join_list("contraindications"),
        "adverse_reactions": join_list("adverse_reactions"),
    }


def insert_drugs(conn, drugs: list[dict]):
    """Bulk insert drug records into PostgreSQL."""
    
    if not drugs:
        return 0
    
    # Prepare data for bulk insert
    values = [
        (
            d["spl_id"],
            d["brand_names"],
            d["generic_names"],
            d["manufacturer"],
            d["product_type"],
            d["route"],
            d["substances"],
            d["indications"],
            d["dosage"],
            d["warnings"],
            d["drug_interactions"],
            d["contraindications"],
            d["adverse_reactions"],
        )
        for d in drugs
        if d["spl_id"]  # Skip records without ID
    ]
    
    sql = """
        INSERT INTO drug_labels (
            spl_id, brand_names, generic_names, manufacturer, product_type,
            route, substances, indications, dosage, warnings,
            drug_interactions, contraindications, adverse_reactions
        ) VALUES %s
        ON CONFLICT (spl_id) DO UPDATE SET
            brand_names = EXCLUDED.brand_names,
            generic_names = EXCLUDED.generic_names,
            manufacturer = EXCLUDED.manufacturer,
            product_type = EXCLUDED.product_type,
            route = EXCLUDED.route,
            substances = EXCLUDED.substances,
            indications = EXCLUDED.indications,
            dosage = EXCLUDED.dosage,
            warnings = EXCLUDED.warnings,
            drug_interactions = EXCLUDED.drug_interactions,
            contraindications = EXCLUDED.contraindications,
            adverse_reactions = EXCLUDED.adverse_reactions
    """
    
    with conn.cursor() as cur:
        execute_values(cur, sql, values)
    conn.commit()
    
    return len(values)


# ============================================================================
# MAIN
# ============================================================================

def main():
    print("=" * 60)
    print("OpenFDA Drug Label Database Setup")
    print("=" * 60)
    
    # Connect to PostgreSQL
    print("\n1. Connecting to PostgreSQL...")
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        print(f"   Connected to {DB_CONFIG['dbname']} on {DB_CONFIG['host']}")
    except Exception as e:
        print(f"   ERROR: Could not connect to PostgreSQL: {e}")
        print("\n   Make sure PostgreSQL is running and the database exists:")
        print("   $ createdb health_assistant")
        return
    
    # Create tables
    print("\n2. Creating tables...")
    with conn.cursor() as cur:
        cur.execute(CREATE_TABLES_SQL)
    conn.commit()
    print("   Tables created successfully")
    
    # Get partition URLs
    print("\n3. Fetching partition list...")
    partitions = get_partition_urls()
    
    # Limit partitions if configured
    if PARTITIONS_TO_DOWNLOAD:
        partitions = partitions[:PARTITIONS_TO_DOWNLOAD]
        print(f"   Downloading {len(partitions)} of {len(partitions)} partitions (dev mode)")
    
    # Download and process each partition
    print("\n4. Downloading and processing partitions...")
    total_drugs = 0
    
    for i, partition in enumerate(partitions):
        url = partition["file"]
        size_mb = partition.get("size_mb", "?")
        
        print(f"\n   Partition {i+1}/{len(partitions)} ({size_mb} MB):")
        
        # Download
        zip_content = download_partition(url, i+1)
        
        # Extract and insert in batches
        print("  Extracting and inserting...")
        batch = []
        batch_size = 1000
        partition_count = 0
        
        for drug in extract_drug_records(zip_content):
            batch.append(drug)
            
            if len(batch) >= batch_size:
                inserted = insert_drugs(conn, batch)
                partition_count += inserted
                batch = []
        
        # Insert remaining
        if batch:
            inserted = insert_drugs(conn, batch)
            partition_count += inserted
        
        total_drugs += partition_count
        print(f"  Inserted {partition_count} drugs from this partition")
    
    # Summary
    print("\n" + "=" * 60)
    print(f"DONE! Loaded {total_drugs} drug records into PostgreSQL")
    print("=" * 60)
    
    # Show sample query
    print("\nSample query to test:")
    print("-" * 40)
    with conn.cursor() as cur:
        cur.execute("""
            SELECT brand_names[1], generic_names[1], product_type 
            FROM drug_labels 
            WHERE 'ACETAMINOPHEN' = ANY(substances)
            LIMIT 5
        """)
        rows = cur.fetchall()
        for row in rows:
            print(f"  {row[0]} ({row[1]}) - {row[2]}")
    
    conn.close()


if __name__ == "__main__":
    main()
