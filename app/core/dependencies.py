# app/core/dependencies.py
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.db import SessionLocal
from app.models import User
from app.core.security import decode_access_token

# Swagger will show an "Authorize" button for this scheme:
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")

# Get a DB session for request
def get_db(): 
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Dependency to get current user from JWT token
class CurrentUser:
    def __init__(self, user_id: int):
        self.user_id = user_id

def get_current_user(token: str = Depends(oauth2_scheme), db=Depends(get_db)) -> CurrentUser:
    # Decode and verify JWT token
    payload = decode_access_token(token)
    if not payload or "user_id" not in payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    user_id = payload["user_id"]

    # Verify user still exists / active, to make sure token is still valid
    user: Optional[User] = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User no longer exists")

    return CurrentUser(user_id=user.user_id)
