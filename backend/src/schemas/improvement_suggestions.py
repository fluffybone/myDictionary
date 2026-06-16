from pydantic import BaseModel, Field


class ImprovementSuggestionCreate(BaseModel):
    message: str = Field(min_length=10, max_length=2000)


class ImprovementSuggestionPublic(BaseModel):
    id: int
    user_id: int
    message: str
    status: str
    created_at: str


class ImprovementSuggestionListResponse(BaseModel):
    suggestions: list[ImprovementSuggestionPublic]
