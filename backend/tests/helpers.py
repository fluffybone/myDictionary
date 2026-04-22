from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from src import auth
from src.models.users import User


async def create_verified_user(
    db_session: AsyncSession,
    email: str = "user@example.com",
    password: str = "password123",
) -> User:
    user = User(
        email=email,
        hashed_password=auth.get_password_hash(password),
        is_verified=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    return user


async def auth_headers(
    client: AsyncClient,
    db_session: AsyncSession,
    email: str = "user@example.com",
    password: str = "password123",
) -> dict[str, str]:
    await create_verified_user(db_session, email=email, password=password)

    response = await client.post(
        "/api/login",
        data={"username": email, "password": password},
    )
    assert response.status_code == 200

    token = response.json()["access_token"]

    return {"Authorization": f"Bearer {token}"}
