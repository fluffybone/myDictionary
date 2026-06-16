from pydantic import BaseModel


class UserLastSeenRow(BaseModel):
    user_id: int
    last_seen_at: str | None
    total_words: int
    en_words: int
    de_words: int
    fr_words: int
    es_words: int
    it_words: int


class UsersLastSeenResponse(BaseModel):
    total_users: int
    users: list[UserLastSeenRow]
