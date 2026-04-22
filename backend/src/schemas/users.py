from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Annotated
from pydantic_core import PydanticCustomError


from pydantic import WrapValidator


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
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_active: bool
    is_verified: bool = False


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
