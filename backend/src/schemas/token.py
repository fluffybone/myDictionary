from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenWithAccessCode(Token):
    access_code: str


class TokenData(BaseModel):
    username: str | None = None
