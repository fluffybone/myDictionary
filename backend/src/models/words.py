from sqlalchemy import Column, ForeignKey, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from src.database import Base
from sqlalchemy.sql import func


class Word(Base):
    __tablename__ = "words"  # Имя таблицы в БД

    id = Column(Integer, primary_key=True, index=True)
    orig_word = Column(String, index=True)
    translate_word = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    description = Column(String)
    # Добавляем внешний ключ на таблицу пользователей
    owner_id = Column(Integer, ForeignKey("users.id"))

    # Связь с таблицей пользователей
    # back_populates создает виртуальное поле "words" в модели User
    owner = relationship("User", back_populates="words")
