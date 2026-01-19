from pydantic import BaseModel

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

    class Config:
        from_attributes = True # Важно для работы с ORM
