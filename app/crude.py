from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import asc, desc, func
from app.db import SessionLocal
from app.models import Job
import datetime
from pathlib import Path
from app.util import *




def list_jobs(user_id: int, filters: dict | None = None, order_by: str = "public_id", descending: bool = True)-> list[Job]:
    # --- Preprocessing: safe to do outside the DB session ---
    normalized_filters = []
    if filters:
        for raw_k, raw_v in filters.items():
            if raw_v in (None, "", " "):
                continue

            key, val = normalize_filter(raw_k, raw_v)
            if val in (None, "", " "):
                continue
            normalized_filters.append((key, val))

    # --- DB work: must happen inside the session ---
    with SessionLocal() as session:
        query = session.query(Job).filter(Job.user_id == user_id)

        # Apply filters
        for key, val in normalized_filters:
            if not hasattr(Job, key):
                print(f"Ignoring invalid filter field: {key}")
                continue

            col = getattr(Job, key)
            if isinstance(val, str): # Case-insensitive match for strings
                query = query.filter(func.lower(col) == val.lower())
            else:
                query = query.filter(col == val)

        # Apply ordering
        if not hasattr(Job, order_by):
            print(f"Invalid order_by '{order_by}', defaulting to public_id.")
            order_by = "public_id" # Default safe column

        col = getattr(Job, order_by)
        query = query.order_by(desc(col) if descending else asc(col))

        try:
            return query.all()
        except Exception as e:
            print(f"Error listing jobs: {e}")
        return []

        
def add_job(job_data: dict)-> Job | None:
    # Normalize the input data
    normalize(job_data)  
    
    # Check required fields
    if not checklist(job_data):  
        print("Invalid job data. Please check required fields.")
        return None
    # Insert the job into the database
    return insert_job(job_data)  

def insert_job(job_data: dict) -> Job | None:
    with SessionLocal() as session:
        # Unpack job_data dictionary into Job model
        job = Job(**job_data)  
        session.add(job)
        
        try:
            session.commit()
            session.refresh(job)
            return job
        
        except Exception as e:
            session.rollback()
            print(f"Error inserting job: {e}")
            return None


def update_job(job_id, new_data):
    with SessionLocal() as session:
        # Retrive the existing entry we wish to update
        to_update = session.get(Job, job_id) 
        if not to_update:
            print(f"Job entry with ID {job_id} not found")
            return None
        
        # Normalize the input data
        normalize(new_data)  
        
        # Updating the data in the object
        ignored_fields = []
        for key, value in new_data.items():
            if hasattr(to_update, key): # Incase the update request contains a typo, prevents failing and just ignores it
                setattr(to_update, key, value)
            else:
                print(f"No field of the name {key} found, Ignoring {key}") # Only needed now when working with bash commands, in the future, selecting fields to update from a list and not by user input
                ignored_fields.append(key)
        
        final_data = {c.name: getattr(to_update, c.name) for c in Job.__table__.columns}
        
        # Check required fields
        if not checklist(final_data):
            print("Invalid job data. Please check required fields.")
            session.rollback()
            return None
        
        try:
            session.commit()
            session.refresh(to_update)
            return {
                "job_id": to_update.job_id,
                "updated_fields": list(new_data.keys()),
                "ignored_fields": ignored_fields,
            }
        except Exception as e:
            session.rollback()
            print(f"Error updating job: {e}")
            return None

def delete_job(job_id): # Currently only deleted one entry each time, will consider adding an option for mass deletion
    with SessionLocal() as session:
        to_delete = session.get(Job, job_id)
        if not to_delete:
            print(f"No job with id {job_id} was found!")
            return None
        else:
            try:
                session.delete(to_delete)
                session.commit()
                return {"deleted_id": to_delete.job_id}
            except Exception as e:
                session.rollback()
                print(f"Error deleting job: {e}")
                return None

    