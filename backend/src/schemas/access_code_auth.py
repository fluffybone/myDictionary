from pydantic import BaseModel, ConfigDict


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenWithAccessCode(Token):
    access_code: str


class LoginByCodeRequest(BaseModel):
    access_code: str


class AccessCodeResponse(BaseModel):
    access_code: str


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_active: bool
    is_verified: bool
