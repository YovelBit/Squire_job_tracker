import sqlite3
import datetime
from pathlib import Path
from util import *

schema_db_path = Path(__file__).resolve().parent.parent / "db/schema.sql"

def checklist(job_data):
    required = ["company_display", "title_display", "status"]
    for field in required:
        if not job_data.get(field):
            return False
    if not job_data.get("date_applied"):
        job_data["date_applied"] = date.today()
    return True

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
        return jobs
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

def update_job(connection,id_job,new_data):
    job_update = dict(new_data)
    normalize(job_update)  # Normalize the input data
    REQUIRED = {"company_display", "title_display", "referred", "date_applied", "status"}
    for field in REQUIRED:
        if field in job_update and not job_update[field]:
            print(f"Required field '{field}' is missing or empty.")
    
    cur = connection.cursor()
    try:
        set_clause = ", ".join(f"{col} = ?" for col in job_update if col in template)
        sql = f"UPDATE jobs SET {set_clause} WHERE job_id = ? RETURNING *;"
        values = [job_update[col] for col in job_update if col in template]
        values.append(id_job)  # Append the job_id to the values for the WHERE clause
        cur.execute(sql, values)
        cur.fetchone()  # Fetch the updated row
        connection.commit()
        return cur.lastrowid  # Return the ID of the updated job
    except sqlite3.Error as e:
        print(f"Error updating job: {e}")
        return None
    finally:
        cur.close()

    