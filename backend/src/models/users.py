from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import relationship
from src.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

    # Связь с таблицей слов
    # back_populates создает виртуальное поле "owner" в модели Word
    words = relationship("Word", back_populates="owner")
