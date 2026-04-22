from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, Field, field_validator

from .validators import validate_not_empty

EnglishRuleCategory = Literal["grammar", "word-building", "phrases"]


class EnglishRuleBase(BaseModel):
    title: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    examples: List[str] = Field(default_factory=list)
    category: EnglishRuleCategory

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str) -> str:
        return validate_not_empty(value, "Название", min_length=2)

    @field_validator("description")
    @classmethod
    def validate_description(cls, value: str) -> str:
        return validate_not_empty(value, "Описание", min_length=2)

    @field_validator("examples")
    @classmethod
    def validate_examples(cls, value: List[str]) -> List[str]:
        return [example.strip() for example in value if example.strip()]


class EnglishRuleCreate(EnglishRuleBase):
    pass


class EnglishRuleUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    examples: Optional[List[str]] = None
    category: Optional[EnglishRuleCategory] = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        return validate_not_empty(value, "Название", min_length=2)

    @field_validator("description")
    @classmethod
    def validate_description(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        return validate_not_empty(value, "Описание", min_length=2)

    @field_validator("examples")
    @classmethod
    def validate_examples(cls, value: Optional[List[str]]) -> Optional[List[str]]:
        if value is None:
            return value
        return [example.strip() for example in value if example.strip()]


class EnglishRule(EnglishRuleBase):
    id: int
    is_default: bool
    matcher_key: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class EnglishRuleHint(BaseModel):
    hint: Optional[str] = None
