from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True,index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

    # Связь с таблицей слов
    # back_populates создает виртуальное поле "owner" в модели Word
    words = relationship("Word", back_populates="owner")

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
