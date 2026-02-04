from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from src.models.users import User
from src.schemas.users import UserCreate
from datetime import datetime


async def get_user(db: AsyncSession, user_id: int):
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_user_by_email(db: AsyncSession, email: str):
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def create_user(
    db: AsyncSession,
    user: UserCreate,
    hashed_password: str,
    verification_code: str = None,
    verification_code_expires_at: datetime = None,
):
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        verification_code=verification_code,
        verification_code_expires_at=verification_code_expires_at,
        is_verified=False,
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user
