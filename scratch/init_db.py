import psycopg2
import os
from dotenv import load_dotenv

def init_db():
    dotenv_path = os.path.join(os.path.dirname(__file__), "..", "backend", ".env")
    load_dotenv(dotenv_path=dotenv_path)
    db_url = os.getenv("DATABASE_URL")
    sql_path = r"c:\fyp\FYP-hospital-Agent\database\SQL queries.pgsql"
    
    print(f"Connecting to database with URL: {db_url}")
    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cur = conn.cursor()
        
        with open(sql_path, 'r', encoding='utf-8') as f:
            sql = f.read()
            
        print("Applying schema...")
        # Split by semicolon to execute one by one if needed, or just execute all
        # Note: Large SQL files are better executed as a whole or via a tool
        cur.execute(sql)
        print("Schema applied successfully!")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error initializing database: {e}")

if __name__ == "__main__":
    init_db()
