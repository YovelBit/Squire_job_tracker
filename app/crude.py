import sqlite3
import datetime
from datetime import date
from pathlib import Path
from types import MappingProxyType


schema_db_path = Path(__file__).resolve().parent.parent / "db/schema.sql"
string_to_value_map = {
        "job_id": "job_id",
        "company": "company",
        "date_applied": "date_applied",
        "status": "status",
        "referred": "referred",
        "last_updated": "last_updated",
        "location": "location",
        "next_action": "next_action",
}
template = MappingProxyType({
    "company": None,
    "title": None,
    "date_applied": None,
    "status": None,
    "referred": 0,
    "location": None,
    "next_action": None,
    "cv" : None,
    "cover_letter": None,
    "notes": None,
    "source": None,
    "application_url": None,
    "next_action_date": None,
})
STATUS_MAP = {
    "applied": "Applied",
    "home_assignment": "Home_Assignment",
    "home assignment": "Home_Assignment",
    "interview": "Interview",
    "offer": "Offer",
    "offer_accepted": "Offer_Accepted",
    "offer accepted": "Offer_Accepted",
    "rejected": "Rejected",
}

def _collapse_spaces(s: str) -> str:
    return " ".join(s.split())


def checklist(job_data):
    required = ["company","title","status"] #the mandatory fields that dont have a default value if not given
    for field in required:
        if not job_data.get(field): #if any of them is missing, the job entry is invalid
            return False
    if not job_data.get("date_applied"): #if not given a specific date, the default will be the date of insertion
        job_data["date_applied"] = date.today()  
    return True

def normalize(job_data):
    raw_company = job_data.get("company")
    if raw_company:
        s = _collapse_spaces(raw_company.strip())
        job_data["company"] = s.title()
   
    raw_status = job_data.get("status")
    if raw_status:
        key = _collapse_spaces(raw_status.strip().lower()).replace("-", "_")
        job_data["status"] = STATUS_MAP.get(key, "Applied")  # or raise on unknown

    for k in ("location", "source"):
        v = job_data.get(k)
        if v is not None:
            t = _collapse_spaces(v.strip())
            job_data[k] = t.title() if t else None  # empty -> None
    
    val = job_data.get("referred")
    if val is not None:
        job_data["referred"] = int(bool(val))
    
    if job_data.get("last_updated") is None:
        job_data.pop("last_updated", None)
    


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


def list_jobs(connection, field ="job_id", order="asc"):
    cursor = connection.cursor()
    col = str(field).lower().strip()
    if col in string_to_value_map:
        col = string_to_value_map[col]
    else:
        col = "job_id"  # Default to job_id if invalid input
        print(f"Invalid field '{field}'. Defaulting to job_id.")
    
    sort_ord =  str(order).lower().strip()
    if sort_ord in ("desc","d","descending"):
        sort_ord = "DESC"
    elif sort_ord in ("asc","a","ascending"):
        sort_ord = "ASC"
    else:
        sort_ord = "ASC"  # Default to ascending order if invalid input
        print(f"Invalid order '{order}'. Defaulting to ascending order.")
    
    nullable_fields = f"({col} IS NULL) ASC, " if col in ("location", "next_action",) else "" #location and next_action can have null values, therefore require unique ordering
    command = f"SELECT * FROM jobs ORDER BY {nullable_fields}{col} {sort_ord}, job_id ASC" #if field is a mandatory field, nullable_fields will be empty and have no effect
    try:
        cursor.execute(command)
        jobs = cursor.fetchall()
        return [dict(row) for row in jobs]
    except sqlite3.Error as e:
        print(f"Error listing jobs: {e}")
    finally:
        cursor.close()

def insert_job(connection, job_data):
    JOB_COLUMNS = (
        "company", "title", "date_applied", "status", "referred",
        "location", "next_action", "cv", "cover_letter",
        "notes", "source", "application_url",
    )

    values = [job_data.get(col) for col in JOB_COLUMNS]

    placeholders = ", ".join("?" for _ in JOB_COLUMNS)
    sql = f"INSERT INTO jobs ({', '.join(JOB_COLUMNS)}) VALUES ({placeholders})"

    cursor = connection.cursor()
    try:
        cursor.execute(sql, values)
        connection.commit()
        return cursor.lastrowid  # return the job_id that SQLite assigned
    except sqlite3.Error as e:
        print(f"Error inserting job: {e}")
        return None
    finally:
        cursor.close()



def add_job(connection, job_data):
    job_entry = template.copy()
    job_entry.update(job_data)
    normalize(job_entry)
    if(checklist(job_entry)):
        insert_job(connection, job_entry)
    else:
        print("Invalid job data. Please check the required fields.")
