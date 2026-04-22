from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from src.database import Base


class LanguageRule(Base):
    __tablename__ = "language_rules"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    examples = Column(JSON, default=list)
    category = Column(String, nullable=False)
    language = Column(String(10), default="en", nullable=False, index=True)
    matcher_key = Column(String, nullable=True)
    is_default = Column(Boolean, default=False, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="language_rules")
