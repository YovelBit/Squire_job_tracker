# app/core/security.py
from datetime import datetime, timezone
from typing import Optional, Dict, Any

from jose import jwt, JWTError
from passlib.context import CryptContext
from app.core.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_DELTA

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ---- Passwords ----
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(claims: Dict[str, Any]) -> str:
    # Create a JWT token with expiration
    to_encode = claims.copy() # avoid modifying input dict
    to_encode["exp"] = datetime.now(timezone.utc) + ACCESS_TOKEN_EXPIRE_DELTA 
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None
