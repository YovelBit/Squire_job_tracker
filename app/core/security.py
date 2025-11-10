# app/core/security.py
from datetime import datetime, timezone
from typing import Optional, Dict, Any

from jose import jwt, JWTError
from passlib.hash import bcrypt

from app.core.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_DELTA

# ---- Passwords ----
def hash_password(plain: str) -> str:
    if not isinstance(plain, str):
        raise TypeError(f"Password must be a string, got {type(plain)}")
    return bcrypt.hash(plain)

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.verify(plain, hashed)  # for checking login attempts

# ---- JWT ----
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
