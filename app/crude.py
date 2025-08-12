import sqlite3
from pathlib import Path

schema_db_path = Path(__file__).resolve().parent.parent / "db/schema.sql"

def create_table(connection):
    with open(schema_db_path, 'r') as file:  #using with to automatically close the file
        schema_sql = file.read()
    cursor = connection.cursor()
    try:  #using try and except to handle errors, and finally to close the cursor when ending.
        cursor.executescript(schema_sql)
        connection.commit()
    except sqlite3.Error as e:
        print(f"Error creating table: {e}")
    finally:
        cursor.close()

def list_all_jobs(connection):
    cursor = connection.cursor()
    try:
        cursor.execute("SELECT job_id, company, title, date_applied, status FROM jobs ORDER BY job_id") #using SELECT * to list all of the jobs listed
        jobs = cursor.fetchall() #retriving all of the records
        return jobs
    except sqlite3.Error as e:
        print(f"Error listing jobs: {e}")
    finally:
        cursor.close()
