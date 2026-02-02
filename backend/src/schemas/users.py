from pydantic import BaseModel, EmailStr
from typing import List

from src.schemas.words import Word


class UserBase(BaseModel):
    email: str


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    is_active: bool
    words: List[Word] = []

    class Config:
        from_attributes = True
