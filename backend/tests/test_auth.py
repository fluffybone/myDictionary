from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.helpers import create_code_user


async def test_create_account_returns_token_code_and_current_user(
    client: AsyncClient,
):
    response = await client.post("/api/accounts/create")

    assert response.status_code == 200
    payload = response.json()
    assert payload["access_token"]
    assert payload["token_type"] == "bearer"
    assert payload["access_code"].startswith("WordEater-")

    me_response = await client.get(
        "/api/users/me",
        headers={"Authorization": f"Bearer {payload['access_token']}"},
    )

    assert me_response.status_code == 200
    me_payload = me_response.json()
    assert "email" not in me_payload
    assert me_payload["is_verified"] is True


async def test_create_account_rate_limit_rejects_immediate_repeat(
    client: AsyncClient,
):
    first_response = await client.post("/api/accounts/create")
    second_response = await client.post("/api/accounts/create")

    assert first_response.status_code == 200
    assert second_response.status_code == 429


async def test_login_by_access_code_returns_token(
    client: AsyncClient,
    db_session: AsyncSession,
):
    _, access_code = await create_code_user(db_session)

    response = await client.post("/api/login-by-code", json={"access_code": access_code})

    assert response.status_code == 200
    payload = response.json()
    assert payload["access_token"]
    assert payload["token_type"] == "bearer"


async def test_rotate_access_code_invalidates_previous_code(
    client: AsyncClient,
    db_session: AsyncSession,
):
    _, access_code = await create_code_user(db_session)
    login_response = await client.post("/api/login-by-code", json={"access_code": access_code})
    token = login_response.json()["access_token"]

    rotate_response = await client.post(
        "/api/users/access-code/rotate",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert rotate_response.status_code == 200
    new_access_code = rotate_response.json()["access_code"]
    assert new_access_code != access_code

    old_login_response = await client.post(
        "/api/login-by-code",
        json={"access_code": access_code},
    )
    assert old_login_response.status_code == 401

    new_login_response = await client.post(
        "/api/login-by-code",
        json={"access_code": new_access_code},
    )
    assert new_login_response.status_code == 200


async def test_legacy_register_is_rejected(client: AsyncClient):
    response = await client.post(
        "/api/register",
        json={"email": "legacy@example.com", "password": "password123"},
    )

    assert response.status_code == 410
