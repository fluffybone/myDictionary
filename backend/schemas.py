from pydantic import BaseModel
from typing import List, Optional

# --- Схемы для слов ---
# Базовая схема (общие поля)
class WordBase(BaseModel):
    english_word: str
    russian_word: str

# Схема для создания (то, что шлет фронтенд)
class WordCreate(WordBase):
    pass

# Схема для чтения (то, что возвращает бэкенд, включая ID)
class Word(WordBase):
    id: int
    owner_id:int

    class Config:
        from_attributes = True # Важно для работы с ORM

# --- Схемы для пользователей ---

class UserBase(BaseModel):
    email:str

class UserCreate(UserBase):
    password:str

class User(UserBase):
    id:int
    is_active:bool
    words:List[Word]=[]

    class Config:
        from_attributes = True       
        
# --- Схемы для токена ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None