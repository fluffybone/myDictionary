from pydantic import BaseModel, EmailStr
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
    owner_id: int

    class Config:
        from_attributes = True  # Важно для работы с ORM
