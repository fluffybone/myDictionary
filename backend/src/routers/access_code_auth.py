from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src import auth, models
from src.crud import users as crud_users
from src.database import get_db
from src.security.account_creation_rate_limit import (
    check_account_creation_allowed,
)
from src.schemas.access_code_auth import (
    AccessCodeResponse,
    LoginByCodeRequest,
    Token,
    TokenWithAccessCode,
    UserPublic,
)

router = APIRouter(prefix="/api", tags=["Users"])


def _get_client_ip(request: Request) -> str:
    for header_name in ("cf-connecting-ip", "x-forwarded-for", "x-real-ip"):
        header_value = request.headers.get(header_name)
        if header_value:
            return header_value.split(",")[0].strip()

    if request.client and request.client.host:
        return request.client.host

    return "unknown"


def _raise_legacy_auth_disabled() -> None:
    raise HTTPException(
        status_code=status.HTTP_410_GONE,
        detail="Старый способ входа отключен. Используйте персональный код входа.",
    )


@router.post("/accounts/create", response_model=TokenWithAccessCode)
async def create_account(
    request: Request,
    session: Annotated[AsyncSession, Depends(get_db)],
):
    client_ip = _get_client_ip(request)
    rate_limit_decision = check_account_creation_allowed(client_ip)

    if not rate_limit_decision.allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                "Слишком много попыток создания аккаунта. "
                "Попробуйте чуть позже."
            ),
            headers={"Retry-After": str(rate_limit_decision.retry_after_seconds)},
        )

    access_code_seed = auth.generate_access_code_seed()
    user = await crud_users.create_auto_user(session, access_code_seed=access_code_seed)
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    access_code = auth.build_access_code(user.id, access_code_seed)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "access_code": access_code,
    }


@router.post("/login-by-code", response_model=Token)
async def login_by_access_code(
    request: LoginByCodeRequest,
    session: Annotated[AsyncSession, Depends(get_db)],
):
    try:
        user_id = auth.get_user_id_from_access_code(request.access_code)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный код входа",
        )

    user = await crud_users.get_user(session, user_id=user_id)

    if not user or not auth.verify_access_code(
        request.access_code, user.id, user.access_code_seed
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный код входа",
        )

    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/users/me", response_model=UserPublic)
async def read_users_me(
    current_user: Annotated[models.User, Depends(auth.get_current_user)],
):
    return current_user


@router.get("/users/access-code", response_model=AccessCodeResponse)
async def get_access_code(
    current_user: Annotated[models.User, Depends(auth.get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    if not current_user.access_code_seed:
        current_user.access_code_seed = auth.generate_access_code_seed()
        await session.commit()
        await session.refresh(current_user)

    return {
        "access_code": auth.build_access_code(
            current_user.id, current_user.access_code_seed
        )
    }


@router.post("/users/access-code/rotate", response_model=AccessCodeResponse)
async def rotate_access_code(
    current_user: Annotated[models.User, Depends(auth.get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    current_user.access_code_seed = auth.generate_access_code_seed()
    await session.commit()
    await session.refresh(current_user)

    return {
        "access_code": auth.build_access_code(
            current_user.id, current_user.access_code_seed
        )
    }


@router.post("/login")
async def reject_legacy_login():
    _raise_legacy_auth_disabled()


@router.post("/register")
async def reject_legacy_register():
    _raise_legacy_auth_disabled()


@router.post("/verify-email")
async def reject_legacy_verify_email():
    _raise_legacy_auth_disabled()


@router.post("/resend-code")
async def reject_legacy_resend_code():
    _raise_legacy_auth_disabled()


@router.post("/forgot-password")
async def reject_legacy_forgot_password():
    _raise_legacy_auth_disabled()


@router.post("/reset-password")
async def reject_legacy_reset_password():
    _raise_legacy_auth_disabled()
