from fastapi import FastAPI
from app.api import jobs

app = FastAPI(title="Squire Job Tracker API")

app.include_router(jobs.router)

@app.get("/")
def root():
    return {"message": "Welcome to the Squire Job Tracker API. Visit /docs for the interactive UI."}
