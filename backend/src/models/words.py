from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from src.database import Base


class Word(Base):
    __tablename__ = "words"  # Имя таблицы в БД

    id = Column(Integer, primary_key=True, index=True)
    english_word = Column(String, index=True)
    russian_word = Column(String)

    # Добавляем внешний ключ на таблицу пользователей
    owner_id = Column(Integer, ForeignKey("users.id"))

    # Связь с таблицей пользователей
    # back_populates создает виртуальное поле "words" в модели User
    owner = relationship("User", back_populates="words")
