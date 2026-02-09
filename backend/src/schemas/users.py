from pydantic import BaseModel, EmailStr, field_validator, ValidationError
from typing import List, Annotated
from pydantic_core import PydanticCustomError


from pydantic import BaseModel, ValidationError, WrapValidator


def validate_email(v, handler):
    try:
        return handler(v)
    except ValueError:
        raise PydanticCustomError("value_error", "Неккоректный email")


MyEmailStr = Annotated[EmailStr, WrapValidator(validate_email)]


class UserBase(BaseModel):
    email: MyEmailStr


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    is_active: bool
    is_verified: bool = False

    class Config:
        from_attributes = True


class ResendCodeRequest(BaseModel):
    email: MyEmailStr


class VerifyRequest(BaseModel):
    email: MyEmailStr
    code: str


class ForgotPasswordRequest(BaseModel):
    email: MyEmailStr


class ResetPasswordRequest(BaseModel):
    email: MyEmailStr
    code: str
    new_password: str
