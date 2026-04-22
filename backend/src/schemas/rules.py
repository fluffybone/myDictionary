from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from .validators import validate_not_empty

LanguageRuleCategory = Literal["grammar", "word-building", "phrases"]
SupportedLanguage = Literal["en", "de", "fr", "es", "it"]


class LanguageRuleBase(BaseModel):
    title: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    examples: List[str] = Field(default_factory=list)
    category: LanguageRuleCategory
    language: SupportedLanguage = Field(default="en", description="Язык правила")

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


class LanguageRuleCreate(LanguageRuleBase):
    pass


class LanguageRuleUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    examples: Optional[List[str]] = None
    category: Optional[LanguageRuleCategory] = None
    language: Optional[SupportedLanguage] = None

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


class LanguageRule(LanguageRuleBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_default: bool
    matcher_key: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


class LanguageRuleHint(BaseModel):
    hint: Optional[str] = None
