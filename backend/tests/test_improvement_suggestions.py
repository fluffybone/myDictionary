from datetime import datetime, timedelta, timezone

from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.improvement_suggestions import ImprovementSuggestion
from src.models.users import User
from src.maintenance.user_cleanup import delete_inactive_empty_users
from tests.helpers import auth_headers


async def test_create_and_list_improvement_suggestions(
    client: AsyncClient,
    db_session: AsyncSession,
):
    headers = await auth_headers(client, db_session)

    create_response = await client.post(
        "/api/improvement-suggestions",
        headers=headers,
        json={"message": "Добавьте возможность закреплять любимые слова вверху списка."},
    )

    assert create_response.status_code == 201
    created_payload = create_response.json()
    assert created_payload["message"].startswith("Добавьте")
    assert created_payload["status"] == "new"

    list_response = await client.get(
        "/api/improvement-suggestions",
        headers=headers,
    )

    assert list_response.status_code == 200
    payload = list_response.json()
    assert len(payload["suggestions"]) == 1
    assert payload["suggestions"][0]["id"] == created_payload["id"]


async def test_cleanup_removes_suggestions_for_deleted_inactive_user(
    db_session: AsyncSession,
):
    stale_user = User(
        access_code_seed="cleanup-suggestion-seed",
        is_verified=True,
        is_active=True,
        created_at=datetime.now(timezone.utc) - timedelta(days=45),
    )
    db_session.add(stale_user)
    await db_session.commit()
    await db_session.refresh(stale_user)

    db_session.add(
        ImprovementSuggestion(
            user_id=stale_user.id,
            message="Сделайте фильтр по любимым словам.",
        )
    )
    await db_session.commit()

    result = await delete_inactive_empty_users(db_session)

    assert result.deleted_user_ids == [stale_user.id]
    assert result.deleted_suggestions_count == 1
