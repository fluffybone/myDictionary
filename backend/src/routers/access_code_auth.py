from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import case, func, select
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
from src.schemas.user_stats import (
    UserLastSeenRow,
    UsersLastSeenResponse,
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


@router.get("/users/last-seen", response_model=UsersLastSeenResponse)
async def get_users_last_seen(
    current_user: Annotated[models.User, Depends(auth.get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
    limit: int = Query(200, ge=1, le=1000),
):
    del current_user

    total_users_query = select(func.count(models.User.id))
    total_users_result = await session.execute(total_users_query)
    total_users = total_users_result.scalar() or 0

    words_by_user_subquery = (
        select(
            models.Word.owner_id.label("user_id"),
            func.count(models.Word.id).label("total_words"),
            func.sum(case((models.Word.language == "en", 1), else_=0)).label("en_words"),
            func.sum(case((models.Word.language == "de", 1), else_=0)).label("de_words"),
            func.sum(case((models.Word.language == "fr", 1), else_=0)).label("fr_words"),
            func.sum(case((models.Word.language == "es", 1), else_=0)).label("es_words"),
            func.sum(case((models.Word.language == "it", 1), else_=0)).label("it_words"),
        )
        .group_by(models.Word.owner_id)
        .subquery()
    )

    users_query = (
        select(
            models.User,
            words_by_user_subquery.c.total_words,
            words_by_user_subquery.c.en_words,
            words_by_user_subquery.c.de_words,
            words_by_user_subquery.c.fr_words,
            words_by_user_subquery.c.es_words,
            words_by_user_subquery.c.it_words,
        )
        .outerjoin(words_by_user_subquery, words_by_user_subquery.c.user_id == models.User.id)
        .order_by(
            models.User.last_seen_at.desc().nullslast(),
            models.User.id.asc(),
        )
        .limit(limit)
    )
    users_result = await session.execute(users_query)

    return UsersLastSeenResponse(
        total_users=total_users,
        users=[
            UserLastSeenRow(
                user_id=user.id,
                last_seen_at=user.last_seen_at.isoformat() if user.last_seen_at else None,
                total_words=total_words or 0,
                en_words=en_words or 0,
                de_words=de_words or 0,
                fr_words=fr_words or 0,
                es_words=es_words or 0,
                it_words=it_words or 0,
            )
            for user, total_words, en_words, de_words, fr_words, es_words, it_words in users_result.all()
        ],
    )


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
