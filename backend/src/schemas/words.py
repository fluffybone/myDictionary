from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from .validators import validate_not_empty
from typing import List, Optional


# --- Схемы для слов ---
# Базовая схема (общие поля)
class WordBase(BaseModel):
    orig_word: str = Field(..., min_length=1, description="Поле не может быть пустым")
    translate_word: str = Field(
        ..., min_length=1, description="Поле не может быть пустым"
    )
    description: str

    @field_validator("orig_word")
    @classmethod
    def validate_orig_word(cls, v: str) -> str:
        return validate_not_empty(v, "Слово", min_length=2)

    @field_validator("translate_word")
    @classmethod
    def validate_translate_word(cls, v: str) -> str:
        return validate_not_empty(v, "Перевод слова", min_length=2)


# Схема для создания (то, что шлет фронтенд)
class WordCreate(WordBase):
    pass


# Схема для чтения (то, что возвращает бэкенд, включая ID)
class Word(WordBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True  # Важно для работы с ORM


class DeleteWordsRequest(BaseModel):
    word_ids: List[int]


class WordUpdate(BaseModel):
    orig_word: Optional[str] = None
    translate_word: Optional[str] = None
    description: Optional[str] = None
