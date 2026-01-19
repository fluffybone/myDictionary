from sqlalchemy import Column, Integer, String
from database import Base

class Word(Base):
    __tablename__ = "words"  # Имя таблицы в БД

    id = Column(Integer, primary_key=True, index=True)
    english_word = Column(String, index=True)
    russian_word = Column(String)
