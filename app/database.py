import sqlite3
from pathlib import Path

DATABASE_PATH = Path(__file__).resolve().parent.parent / "squire.db"


def get_db_connection():
    con = sqlite3.connect(DATABASE_PATH)
    con.row_factory = sqlite3.Row 
    return con


