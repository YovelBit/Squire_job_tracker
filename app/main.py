from app.crude import add_job, update_job, delete_job, list_jobs
from app.db import SessionLocal
from app.models import Job


def print_jobs(jobs):
    """Pretty print job entries."""
    if not jobs:
        print("No jobs found.\n")
        return
    print("\n📋 Current Jobs:")
    for job in jobs:
        print(f"[{job.job_id}] {job.company_display} | {job.title_display} | {job.status}")
    print("")


def run_cli():
    while True:
        print("\n=== Squire Job Tracker CLI ===")
        print("1. Add new job")
        print("2. List all jobs")
        print("3. Filter + order jobs")
        print("4. Update existing job")
        print("5. Delete a job")
        print("0. Exit")
        choice = input("Select an option: ").strip()

        if choice == "1":
            print("\n--- Add new job ---")
            company = input("Company: ").strip()
            title = input("Title: ").strip()
            status = input("Status (Applied/Interview/Offer/Rejected): ").strip() or "Applied"
            location = input("Location (optional): ").strip()
            source = input("Source (optional): ").strip()
            referred = input("Referred? (y/n): ").lower().startswith("y")

            job_data = {
                "company_display": company,
                "title_display": title,
                "status": status,
                "location_display": location or None,
                "source_display": source or None,
                "referred": referred,
                "date_applied": None,
            }

            job_id = add_job(job_data)
            if job_id:
                print(f"✅ Added job ID {job_id}")
            else:
                print("❌ Failed to add job.")

        elif choice == "2":
            print("\n--- List all jobs ---")
            jobs = list_jobs()
            print_jobs(jobs)

        elif choice == "3":
            print("\n--- Filter and Order Jobs ---")
            f = input("Filter field (e.g. status/company_display) or leave empty: ").strip()
            v = input("Filter value (optional): ").strip()
            field = input("Order by (default job_id): ").strip() or "job_id"
            order = input("Order direction (asc/desc): ").strip() or "asc"

            filters = {f: v} if f and v else None
            jobs = list_jobs(field=field, order=order, filters=filters)
            print_jobs(jobs)

        elif choice == "4":
            print("\n--- Update a job ---")
            job_id = input("Enter job ID to update: ").strip()
            field = input("Field to update: ").strip()
            value = input("New value: ").strip()
            result = update_job(int(job_id), {field: value})
            if result:
                print(f"✅ Updated job {result['job_id']}")
                if result["ignored_fields"]:
                    print(f"Ignored: {', '.join(result['ignored_fields'])}")
            else:
                print("❌ Update failed.")

        elif choice == "5":
            print("\n--- Delete a job ---")
            job_id = input("Enter job ID to delete: ").strip()
            result = delete_job(int(job_id))
            if result:
                print(f"🗑️ Deleted job {result['deleted_id']}")
            else:
                print("❌ No job deleted.")

        elif choice == "0":
            print("Goodbye!")
            break

        else:
            print("Invalid choice, try again.")


if __name__ == "__main__":
    try:
        db = SessionLocal()
        print(f"✅ Connected to database: {db.bind.url}")
        db.close()
        run_cli()
    except Exception as e:
        print(f"❌ Failed to start CLI: {e}")
