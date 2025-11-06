from fastapi import APIRouter, HTTPException
from app.crude import add_job, list_jobs, update_job, delete_job
from app.schemas import JobCreate, JobResponse, JobUpdate, JobFilter
from app.models import Job
from app.db import SessionLocal

router = APIRouter(prefix="/jobs", tags=["jobs"])

@router.get("/", response_model=list[JobResponse])
def get_jobs():
    return list_jobs()

@router.post("/", response_model=JobResponse)
def create_job(job: JobCreate):
    job_id = add_job(job.model_dump())
    if not job_id:
        raise HTTPException(status_code=400, detail="Invalid job data")
    return {"job_id": job_id, **job.model_dump()}

@router.patch("/{job_id}",response_model=JobResponse)
def put_job(job_id: int, job: JobUpdate):
    result = update_job(job_id, job.model_dump(exclude_unset=True))
    if not result:
        raise HTTPException(status_code=400, detail="Update failed — invalid data or ID not found")
    with SessionLocal() as session:
        updated_job = session.get(Job, job_id)
        return updated_job

@router.delete("/{job_id}")
def delete_job_endpoint(job_id: int):
    deleted_id = delete_job(job_id)
    if not deleted_id:
        raise HTTPException(status_code=400, detail="Deletion Failed! Invalid job id or Server error")
    return {"job_id": job_id, "deleted": True}

@router.post("/filter", response_model=list[JobResponse])
def filter_jobs(filters: JobFilter, order_by: str = "job_id", descending: bool = False ):
    filter_dict = filters.model_dump(exclude_unset=True, exclude_none=True)
    jobs = list_jobs(filters=filter_dict, order_by=order_by, descending=descending)
    return jobs

