from app.db import SessionLocal
from app.models import Job

db = SessionLocal()
count = db.query(Job).count()
print(f"Jobs in table: {count}")
db.close()
