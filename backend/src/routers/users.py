from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta, timezone
from src import auth
from sqlalchemy import select
from src import models
from src.crud import users as crud_users
from src.schemas.users import (
    UserCreate,
    UserBase,
    User,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from src.models.users import User as UserDB
from src.schemas.token import Token
from src.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from src.utils.email import send_verification_code
from src.schemas.users import ResendCodeRequest, VerifyRequest

import random
import string

router = APIRouter(prefix="/api", tags=["Users"])


def generate_verification_code():
    return "".join(random.choices(string.digits, k=6))


@router.post("/register", response_model=UserBase)
async def register(
    user: UserCreate,
    session: Annotated[AsyncSession, Depends(get_db)],
    background_tasks: BackgroundTasks,
):
    db_user = await crud_users.get_user_by_email(session, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Такой пользователь уже существует")

    code = generate_verification_code()
    expiries_at = datetime.now(timezone.utc) + timedelta(minutes=15)

    hashed_password = auth.get_password_hash(user.password)
    new_user = await crud_users.create_user(
        db=session,
        user=user,
        hashed_password=hashed_password,
        verification_code=code,
        verification_code_expires_at=expiries_at,
    )

    background_tasks.add_task(send_verification_code, user.email, code)
    return new_user


@router.post("/login", response_model=Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    user = await crud_users.get_user_by_email(session, email=form_data.username)

    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_verified:
        raise HTTPException(status_code=400, detail="Почта не подтверждена!")

    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)

    access_token = auth.create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/users/me", response_model=User)
async def read_users_me(
    current_user: Annotated[models.User, Depends(auth.get_current_user)],
):
    return current_user


@router.post("/verify-email")
async def verify_email(data: VerifyRequest, db: AsyncSession = Depends(get_db)):
    query = select(UserDB).where(UserDB.email == data.email)
    result = await db.execute(query)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.verification_code != data.code:
        raise HTTPException(status_code=400, detail="Invalid code")

    # Проверка времени (учитываем timezone)
    if user.verification_code_expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Code expired")

    user.is_verified = True
    user.verification_code = None

    await db.commit()

    return {"message": "Почта подтверждена!"}


@router.post("/resend-code")
async def resend_verification_code(
    request: ResendCodeRequest,
    session: Annotated[AsyncSession, Depends(get_db)],
    background_tasks: BackgroundTasks,
):
    # 1. Ищем пользователя
    db_user = await crud_users.get_user_by_email(session, email=request.email)

    # 2. Если юзера нет или он уже подтвержден —
    # ради безопасности можно вернуть "ОК", чтобы не выдавать наличие email в базе.
    # Но для учебного проекта можно сказать прямо:
    if not db_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    if db_user.is_verified:
        raise HTTPException(status_code=400, detail="Почта подтверждена!")

    # 3. Проверяем частоту (Rate Limit) — опционально, но полезно
    # Если код был создан менее 1 минуты назад, не шлем новый.
    if db_user.verification_code_expires_at:
        created_at = db_user.verification_code_expires_at - timedelta(minutes=15)
        if datetime.now(timezone.utc) - created_at < timedelta(minutes=1):
            raise HTTPException(status_code=429, detail="Wait a minute")

    # 4. Генерируем НОВЫЙ код
    new_code = generate_verification_code()
    new_expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)

    # 5. Обновляем в БД
    db_user.verification_code = new_code
    db_user.verification_code_expires_at = new_expires_at
    await session.commit()

    # 6. Шлем письмо
    background_tasks.add_task(send_verification_code, db_user.email, new_code)

    return {"message": "Письмо отправлено"}


# 1. Запрос на сброс пароля
@router.post("/forgot-password")
async def forgot_password(
    request: ForgotPasswordRequest,
    session: Annotated[AsyncSession, Depends(get_db)],
    background_tasks: BackgroundTasks,
):
    # Ищем пользователя
    user = await crud_users.get_user_by_email(session, email=request.email)

    # Если пользователя нет, по стандартам безопасности мы должны промолчать
    # и вернуть 200 OK, чтобы хакеры не перебирали базу email-ов.
    if not user:
        # Можно вернуть OK, но ничего не делать.
        # Либо для отладки пока оставить 404.
        return {"message": "If email exists, code sent"}

    # Генерируем код
    code = generate_verification_code()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)

    # Сохраняем код в то же поле verification_code (или создать отдельное reset_code)
    # Обычно используют то же поле, так как нельзя одновременно регистрироваться и восстанавливать пароль.
    user.verification_code = code
    user.verification_code_expires_at = expires_at
    await session.commit()

    # Отправляем письмо (нужно будет немного доработать функцию отправки или сделать новую)
    background_tasks.add_task(send_verification_code, user.email, code)

    return {"message": "Verification code sent"}


# 2. Установка нового пароля
@router.post("/reset-password")
async def reset_password(
    request: ResetPasswordRequest, session: Annotated[AsyncSession, Depends(get_db)]
):
    user = await crud_users.get_user_by_email(session, email=request.email)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Проверка кода
    if user.verification_code != request.code:
        raise HTTPException(status_code=400, detail="Invalid code")

    if user.verification_code_expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Code expired")

    # Хешируем новый пароль
    new_hashed_password = auth.get_password_hash(request.new_password)

    # Обновляем пароль и очищаем код
    user.hashed_password = new_hashed_password
    user.verification_code = None
    user.is_verified = (
        True  # Если он восстановил доступ через почту, значит почта валидна
    )

    await session.commit()

    return {"message": "Password updated successfully"}
