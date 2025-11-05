from datetime import date
from typing import Optional
from pydantic import BaseModel, Field


# Shared base schema for all job models
class JobBase(BaseModel):
    company_display: Optional[str] = None
    title_display: Optional[str] = None
    status: Optional[str] = None
    location_display: Optional[str] = None
    source_display: Optional[str] = None
    referred: Optional[bool] = False
    date_applied: Optional[date] = None
    next_action: Optional[date] = None
    notes: Optional[str] = None


# Schema for creating a new job (required core fields)
class JobCreate(JobBase):
    company_display: str
    title_display: str
    status: str


# Schema for updating an existing job (all fields optional)
class JobUpdate(JobBase):
    pass  # all optional inherited from JobBase


# Schema for returning job data from the API
class JobResponse(JobBase):
    job_id: int

    class Config:
        from_attributes = True  # replaces orm_mode in Pydantic v2

# Schema for filtering jobs and returning them
class JobFilter(JobBase):
    pass  
