from sqlalchemy import Boolean, Column, Integer, String, DateTime
from sqlalchemy.orm import relationship, Mapped, mapped_column
from src.database import Base
from sqlalchemy.sql import func


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    access_code_seed = Column(String, unique=True, nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    verification_code = Column(String)
    verification_code_expires_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    last_seen_at = Column(DateTime(timezone=True), nullable=True)

    # Связь с таблицей слов
    # back_populates создает виртуальное поле "owner" в модели Word
    words = relationship("Word", back_populates="owner")
    language_rules = relationship("LanguageRule", back_populates="owner")
    improvement_suggestions = relationship(
        "ImprovementSuggestion",
        back_populates="user",
    )
