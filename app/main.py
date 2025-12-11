# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.jobs import router as jobs_router
from app.api.users import router as users_router

app = FastAPI(title="Squire Job Tracker")

# CORS config so the React app (Vite) can talk to the API
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # in dev you could also use ["*"]
    allow_credentials=True,
    allow_methods=["*"],        # GET, POST, PUT, DELETE, OPTIONS, ...
    allow_headers=["*"],        # Authorization, Content-Type, etc.
)

# Routers
app.include_router(users_router)  # /users/* (register, login)
app.include_router(jobs_router)   # /jobs/*
