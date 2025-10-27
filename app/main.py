from app.db import SessionLocal
from app.models import Job

def main():
    db = SessionLocal()
    try:
        # ✅ Confirm connection
        print("Connected to:", db.bind.url)

        # ✅ Insert a test job
        new_job = Job(
            company_display="NVIDIA",
            title_display="Firmware Engineer Intern",
            location_display="Yokneam",
            source_display="LinkedIn",
            company_key="nvidia",
            title_key="firmware engineer intern",
            location_key="yokneam",
            source_key="linkedin",
            status="Applied",
            date_applied="2025-10-27",
            referred=False
        )
        db.add(new_job)
        db.commit()
        print(f"✅ Inserted job id = {new_job.job_id}")

        # ✅ Fetch all jobs
        jobs = db.query(Job).all()
        print(f"📋 Found {len(jobs)} job(s):")
        for job in jobs:
            print(f" - {job.job_id}: {job.company_display} | {job.title_display} | {job.status}")

    finally:
        db.close()

if __name__ == "__main__":
    main()
