from pydantic import BaseModel, EmailStr
from typing import List

from src.schemas.words import Word


class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    is_active: bool
    is_verified: bool = False

    class Config:
        from_attributes = True


class ResendCodeRequest(BaseModel):
    email: EmailStr


class VerifyRequest(BaseModel):
    email: str
    code: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str
