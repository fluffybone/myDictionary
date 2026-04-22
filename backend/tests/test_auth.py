from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.helpers import create_verified_user


async def test_login_returns_token_and_users_me(
    client: AsyncClient,
    db_session: AsyncSession,
):
    email = "login@example.com"
    password = "password123"
    await create_verified_user(db_session, email=email, password=password)

    login_response = await client.post(
        "/api/login",
        data={"username": email, "password": password},
    )

    assert login_response.status_code == 200
    token_data = login_response.json()
    assert token_data["access_token"]
    assert token_data["token_type"] == "bearer"

    me_response = await client.get(
        "/api/users/me",
        headers={"Authorization": f"Bearer {token_data['access_token']}"},
    )

    assert me_response.status_code == 200
    assert me_response.json()["email"] == email


async def test_login_rejects_wrong_password(
    client: AsyncClient,
    db_session: AsyncSession,
):
    await create_verified_user(
        db_session,
        email="wrong-password@example.com",
        password="password123",
    )

    response = await client.post(
        "/api/login",
        data={"username": "wrong-password@example.com", "password": "bad-password"},
    )

    assert response.status_code == 401
