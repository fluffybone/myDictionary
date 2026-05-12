from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from src import auth
from src.models.users import User


async def create_code_user(db_session: AsyncSession) -> tuple[User, str]:
    user = User(
        access_code_seed=auth.generate_access_code_seed(),
        is_verified=True,
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    access_code = auth.build_access_code(user.id, user.access_code_seed)
    return user, access_code


async def auth_headers(
    client: AsyncClient,
    db_session: AsyncSession,
) -> dict[str, str]:
    _, access_code = await create_code_user(db_session)

    response = await client.post(
        "/api/login-by-code",
        json={"access_code": access_code},
    )
    assert response.status_code == 200

    token = response.json()["access_token"]

    return {"Authorization": f"Bearer {token}"}
