import os
import base64
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
from typing import Annotated
import jwt
import src.crud.users as crud_users
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash
from src.database import get_db
from src.models.users import User
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_db

SECRET_KEY = os.getenv("SECRET_KEY")

if not SECRET_KEY:
    raise ValueError("No SECRET_KEY")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 30  # 30 дней

password_hash = PasswordHash.recommended()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

ACCESS_CODE_PREFIX = "WordEater"
ACCESS_CODE_BYTES = 16


def generate_access_code_seed() -> str:
    return secrets.token_urlsafe(ACCESS_CODE_BYTES)


def _to_base36(value: int) -> str:
    alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    if value < 1:
        raise ValueError("User id must be positive")

    result = []
    while value:
        value, remainder = divmod(value, 36)
        result.append(alphabet[remainder])
    return "".join(reversed(result))


def _from_base36(value: str) -> int:
    return int(value, 36)


def _build_access_code_signature(user_id: int, seed: str) -> str:
    payload = f"access-code:{user_id}:{seed}".encode()
    digest = hmac.new(SECRET_KEY.encode(), payload, hashlib.sha256).digest()
    signature = base64.b32encode(digest).decode().rstrip("=")[:16]
    return "-".join(signature[index:index + 4] for index in range(0, len(signature), 4))


def build_access_code(user_id: int, seed: str) -> str:
    public_id = _to_base36(user_id)
    signature = _build_access_code_signature(user_id, seed)
    return f"{ACCESS_CODE_PREFIX}-{public_id}-{signature}"


def get_user_id_from_access_code(access_code: str) -> int:
    normalized_code = access_code.strip().upper()
    parts = normalized_code.split("-")
    if len(parts) < 3 or parts[0] != ACCESS_CODE_PREFIX.upper():
        raise ValueError("Invalid access code format")

    return _from_base36(parts[1])


def verify_access_code(access_code: str, user_id: int, seed: str | None) -> bool:
    if not seed:
        return False

    expected_code = build_access_code(user_id, seed)
    return secrets.compare_digest(access_code.strip().upper(), expected_code.upper())


def verify_password(plain_password, hashed_password):
    return password_hash.verify(plain_password, hashed_password)


def get_password_hash(password):
    return password_hash.hash(password)


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)], db: AsyncSession = Depends(get_db)
) -> User:

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        user_id = int(user_id_str)
    except (InvalidTokenError, ValueError):
        raise credentials_exception

    user = await crud_users.get_user(db, user_id=user_id)

    if user is None:
        raise credentials_exception

    return user
