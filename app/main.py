from database import get_db_connection
from crude import create_table, list_jobs, insert_job, normalize, checklist,add_job, update_job
from util import print_jobs_system

# Example job with messy formatting & missing some fields
test_job = {
    "company_display": "   goOgle   ",
    "title_display": "  backend engineer ",
    "status": " offer ",
    "referred": "yes",
    "location_display": "  new   york ",
    "source_display": "  linkedin  ",
    # date_applied optional; checklist will set today if missing
}

update_info = {
    "company_display": "      GOOGLE   ",
    "status": "interview",
    "next_action": "2023-10-15",
}

conn = get_db_connection()
conn.execute("DROP TABLE IF EXISTS jobs;")
conn.commit()
create_table(conn)  # Make sure table exists

# # 1️⃣ Normalize data
# normalize(test_job)
# print("After normalize:", test_job)

# # 2️⃣ Check required fields
# if checklist(test_job):
#     print("Checklist passed ✅")
# else:
#     print("Checklist failed ❌")
#     conn.close()
#     exit()

# 3️⃣ Insert job
new_id = add_job(conn, test_job)
print(f"Inserted job with ID: {new_id}")

# 4️⃣ Verify insertion
jobs = list_jobs(conn, "company", "asc")
print("All jobs after insertion:")
print_jobs_system(jobs)

# 5️⃣ Update job
upd_id = update_job(conn, 1, update_info)
print(f"Updated job with ID: {upd_id}")

# 6️⃣ Verify update
jobs = list_jobs(conn, "company", "asc")
print("All jobs after update:")
print_jobs_system(jobs)

conn.execute("DROP TABLE IF EXISTS jobs;")
conn.commit()
conn.close()
