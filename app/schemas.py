from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field, EmailStr
import uuid
from typing import List, Dict, Any

# --------------------------------------------------
# Base schema: shared editable fields for jobs
# --------------------------------------------------
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
    application_url: Optional[str] = None
    cv: Optional[str] = None
    cover_letter: Optional[str] = None

# --------------------------------------------------
# Schema for creating a new job (client input)
# --------------------------------------------------
class JobCreate(JobBase):
    company_display: str
    title_display: str
    status: str


# --------------------------------------------------
# Schema for updating an existing job (client input)
# --------------------------------------------------
class JobUpdate(JobBase):
    """All fields optional for partial updates"""
    pass


# --------------------------------------------------
# Schema for returning job data (server → client)
# --------------------------------------------------
class JobResponse(JobBase):
    job_id: int
    public_id: uuid.UUID
    created_at: datetime = Field(..., description="Timestamp when the job was created", readOnly=True)
    last_updated: datetime = Field(..., description="Timestamp of the last update", readOnly=True)

    class Config:
        from_attributes = True  # replaces orm_mode in Pydantic v2

# --------------------------------------------------
# Schema for update job result (server → client)
# --------------------------------------------------

class JobUpdateResult(BaseModel):
    public_id: uuid.UUID
    updated_fields: List[str]
    new_values: Dict[str, Any]
    ignored_fields: List[str]

# --------------------------------------------------
# Schema for filtering jobs (client input)
# --------------------------------------------------
class JobFilter(JobBase):
    """Used to filter job listings."""
    pass

# --------------------------------------------------
# Schema for user creation
# --------------------------------------------------

class UserCreate(BaseModel):
    email: EmailStr
    password: str

# --------------------------------------------------
# Schema for user login
# --------------------------------------------------
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# --------------------------------------------------
# Schema for token response
# --------------------------------------------------
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"