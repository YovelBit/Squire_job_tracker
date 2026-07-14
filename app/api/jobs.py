from fastapi import APIRouter, HTTPException, Depends
from app.crude import add_job, list_jobs, update_job, delete_job
from app.schemas import JobCreate, JobResponse, JobUpdate, JobFilter, JobUpdateResult
import uuid
from app.core.dependencies import get_current_user, CurrentUser

router = APIRouter(prefix="/jobs", tags=["jobs"])

# --- Routes ---

@router.get("/", response_model=list[JobResponse])
def get_jobs(current_user: CurrentUser = Depends(get_current_user)):
    jobs = list_jobs(user_id=current_user.user_id)
    return jobs


@router.post("/", response_model=JobResponse)
def create_job(job: JobCreate, current_user: CurrentUser = Depends(get_current_user)):
    job_data = job.model_dump()
    job_data["user_id"] = current_user.user_id  # Inject ownership
    new_job = add_job(job_data)
    if not new_job:
        raise HTTPException(status_code=400, detail="Invalid job data")
    return new_job


@router.patch("/{public_id}", response_model=JobUpdateResult)
def update_job_endpoint(public_id: uuid.UUID,
                        job: JobUpdate,
                        current_user: CurrentUser = Depends(get_current_user)):
    result = update_job(public_id, job.model_dump(exclude_unset=True), user_id=current_user.user_id)
    if not result:
        raise HTTPException(status_code=400, detail="Update failed — invalid data or job not found")
    return result



@router.delete("/{public_id}", response_model=dict)
def delete_job_endpoint(
    public_id: uuid.UUID,
    current_user: CurrentUser = Depends(get_current_user),
):
    deleted_entry = delete_job(public_id, current_user.user_id)
    if not deleted_entry:
        raise HTTPException(status_code=400, detail="Deletion failed — invalid public_id or user mismatch")
    return deleted_entry


@router.post("/filter", response_model=list[JobResponse])
def filter_jobs(
    filters: JobFilter,
    order_by: str = "public_id",
    descending: bool = False,
    current_user: CurrentUser = Depends(get_current_user),
):
    filter_dict = filters.model_dump(exclude_unset=True, exclude_none=True)
    jobs = list_jobs(
        user_id=current_user.user_id,
        filters=filter_dict,
        order_by=order_by,
        descending=descending,
    )
    return jobs
# Note: In a production app, replace the temporary current_user dependency
# with real authentication and user management.