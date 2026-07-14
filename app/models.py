from sqlalchemy import (
    Column, Integer, String, Boolean, Date, Text, CheckConstraint,
    UniqueConstraint, Index, func, DateTime, ForeignKey
)
from sqlalchemy.orm import relationship
from .db import Base
import uuid
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

class Job(Base):
    __tablename__ = "jobs"
    # Internal primary key (DB-only)
    job_id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Public, safe external ID for APIs/extension/UI
    public_id = Column(PG_UUID(as_uuid=True), unique=True, nullable=False, default=uuid.uuid4, index=True)

    # Ownership
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    user = relationship("User", back_populates="jobs")

    # DISPLAY values
    company_display = Column(String, nullable=False)
    title_display = Column(String, nullable=False)
    location_display = Column(String)
    source_display = Column(String)

    # KEY values: normalized for filtering/sorting
    company_key = Column(String, nullable=False)
    title_key = Column(String, nullable=False)
    location_key = Column(String)
    source_key = Column(String)

    # Core metadata
    date_applied = Column(Date, nullable=False)
    status = Column(String, nullable=False)
    referred = Column(Boolean, nullable=False, default=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    last_updated = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    
    # Optional fields
    cv = Column(Text)
    cover_letter = Column(Text)
    application_url = Column(Text)
    next_action = Column(Date)
    notes = Column(Text)

    
    __table_args__ = (
        UniqueConstraint('user_id', 'company_key', 'title_key', 'date_applied', 'source_key', name='uq_jobs_user_key_date_source'),
        CheckConstraint("status IN ('Applied','Home_Assignment','Interview','Offer','Offer_Accepted','Rejected')", name='chk_status'),
        CheckConstraint("char_length(trim(company_display)) > 0", name="chk_company_not_empty"),
        CheckConstraint("char_length(trim(title_display)) > 0", name="chk_title_not_empty"),
    )

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    username = Column(String, unique=True, nullable=True)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    # bidirectional relationship
    jobs = relationship("Job", back_populates="user", cascade="all, delete")

# Performance indexes (common filters/sorts)
Index('idx_jobs_user_id', Job.user_id)
Index('idx_jobs_company_key', Job.company_key)
Index('idx_jobs_title_key',   Job.title_key)
Index('idx_jobs_location_key',Job.location_key)
Index('idx_jobs_source_key',  Job.source_key)
Index('idx_jobs_status',      Job.status)
Index('idx_jobs_date_applied',Job.date_applied)