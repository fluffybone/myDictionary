from pydantic import BaseModel
from datetime import datetime


# --- Схемы для слов ---
# Базовая схема (общие поля)
class WordBase(BaseModel):
    english_word: str
    russian_word: str
    learned: bool = False


# Схема для создания (то, что шлет фронтенд)
class WordCreate(WordBase):
    pass


# Схема для чтения (то, что возвращает бэкенд, включая ID)
class Word(WordBase):
    id: int
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True  # Важно для работы с ORM
