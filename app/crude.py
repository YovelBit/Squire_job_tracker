import sqlite3
import datetime
from datetime import date
from pathlib import Path
from types import MappingProxyType


schema_db_path = Path(__file__).resolve().parent.parent / "db/schema.sql"
string_to_value_map = { 
    # Whitelist mapping of allowed sort field names to actual DB columns.
    # Used only for ORDER BY in list_jobs() to prevent SQL injection,
    # since SQL parameters cannot be used for column names.
    "job_id": "job_id",
    "company": "company_display",
    "company_key": "company_key",
    "title": "title_display",
    "title_key": "title_key",
    "date_applied": "date_applied",
    "status": "status",
    "referred": "referred",
    "last_updated": "last_updated",
    "location": "location_display",
    "location_key": "location_key",
    "next_action": "next_action",
    "source": "source_display",
    "source_key": "source_key",
}

template = MappingProxyType({
    # display fields (user input)
    "company_display": None,
    "title_display": None,
    "location_display": None,
    "source_display": None,

    # keys (system-managed)
    "company_key": None,
    "title_key": None,
    "location_key": None,
    "source_key": None,

    # other fields
    "date_applied": None,
    "status": None,
    "referred": 0,
    "next_action": None,
    "cv": None,
    "cover_letter": None,
    "notes": None,
    "application_url": None,
})
STATUS_MAP = {
    # Normalizes different variations the user might type in to the allowed forms
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

def _norm_key(s: str) -> str:
    if s is None:
        return None
    s = _collapse_spaces(str(s).strip())
    return s.lower() if s else None

def checklist(job_data):
    required = ["company_display", "title_display", "status"]
    for field in required:
        if not job_data.get(field):
            return False
    if not job_data.get("date_applied"):
        job_data["date_applied"] = date.today()
    return True


def normalize(job_data):
    # DISPLAY
    for disp in ("company_display", "title_display", "location_display", "source_display"):
        if disp in job_data and job_data.get(disp) is not None:
            job_data[disp] = _collapse_spaces(str(job_data[disp]).strip()) or None

    # KEYS
    job_data["company_key"]  = _norm_key(job_data.get("company_display"))
    job_data["title_key"]    = _norm_key(job_data.get("title_display"))
    job_data["location_key"] = _norm_key(job_data.get("location_display"))
    job_data["source_key"]   = _norm_key(job_data.get("source_display"))

    # STATUS
    raw_status = job_data.get("status")
    if raw_status:
        key = _collapse_spaces(str(raw_status).strip().lower()).replace("-", "_")
        job_data["status"] = STATUS_MAP.get(key, "Applied")

    # REFERRED TO 0/1
    if job_data.get("referred") is not None:
        job_data["referred"] = int(bool(job_data["referred"]))

    # Never allow manual last_updated
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
        col = string_to_value_map.get(col)
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
    
    nullable_fields = f"({col} IS NULL) ASC, " if col in {"location_display", "next_action", "source_display"} else "" # Location,next_action and source can have null values, therefore require unique ordering
    command = f"SELECT * FROM jobs ORDER BY {nullable_fields}{col} {sort_ord}, job_id ASC" # If field is a mandatory field, nullable_fields will be empty and have no effect
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
        "company_display", "title_display", "location_display", "source_display",
        "company_key", "title_key", "location_key", "source_key",
        "date_applied", "status", "referred",
        "cv", "cover_letter", "application_url",
        "next_action", "notes",
    )
    values = [job_data.get(col) for col in JOB_COLUMNS] #Chaining the fields in order of JOB_COLUMN
    placeholders = ", ".join("?" for _ in JOB_COLUMNS) #Chaining ?, sqlite way of passing parameters
    sql = f"INSERT INTO jobs ({', '.join(JOB_COLUMNS)}) VALUES ({placeholders})"
    cursor = connection.cursor()
    try:
        cursor.execute(sql, values)
        connection.commit()
        return cursor.lastrowid
    except sqlite3.Error as e:
        print(f"Error inserting job: {e}")
        return None
    finally:
        cursor.close()




def add_job(connection, job_data):
    job_entry = dict(template)
    job_entry.update(dict(job_data))
    normalize(job_entry) #normalizing before checklist, can make valid inputs that would be rejected pass, and also for the other way around.
    if(checklist(job_entry)):
        return insert_job(connection, job_entry)
    else:
        print("Invalid job data. Please check the required fields.")
        return None

# def update_job(connection,id_job,new_data):
#     for
