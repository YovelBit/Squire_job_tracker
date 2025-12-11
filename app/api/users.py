# app/api/users.py
from fastapi import APIRouter, HTTPException, Depends, status
from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import get_db
from app.models import User
from app.schemas import UserCreate, UserLogin, TokenResponse

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(payload: UserCreate, db=Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(email=payload.email, hashed_password=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "User created"}

@router.post("/login", response_model=TokenResponse)
def login_user(payload: UserLogin, db=Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    print(
        "DEBUG login:",
        "email:", payload.email,
        "user_found:", bool(user),
    )
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"user_id": user.user_id})
    return {"access_token": token}
