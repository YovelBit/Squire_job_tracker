# app/main.py
from fastapi import FastAPI
from app.api.jobs import router as jobs_router
from app.api.users import router as users_router

app = FastAPI(title="Squire Job Tracker")

app.include_router(users_router)  # /users/* (register, login)
app.include_router(jobs_router)   # /jobs/* (protected once you add Depends(get_current_user))
