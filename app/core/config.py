# app/core/config.py
import os
from datetime import timedelta

# In production, read these from environment variables (e.g., os.getenv)
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-insecure-change-me") # Change this in production!
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")  # HS256 is symmetric, simple to start
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")) # 1 hour default, will change as env is set

ACCESS_TOKEN_EXPIRE_DELTA = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

