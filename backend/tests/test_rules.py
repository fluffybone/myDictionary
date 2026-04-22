from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.helpers import auth_headers


async def test_rules_defaults_hint_and_crud(
    client: AsyncClient,
    db_session: AsyncSession,
):
    headers = await auth_headers(client, db_session)

    rules_response = await client.get("/api/rules", headers=headers)

    assert rules_response.status_code == 200
    default_rules = rules_response.json()
    assert len(default_rules) > 0
    assert any(rule["is_default"] for rule in default_rules)
    assert all(rule["language"] == "en" for rule in default_rules)

    french_rules_response = await client.get(
        "/api/rules",
        headers=headers,
        params={"language": "fr"},
    )

    assert french_rules_response.status_code == 200
    assert french_rules_response.json() == []

    hint_response = await client.get(
        "/api/rules/hint",
        headers=headers,
        params={"word": "unhappy", "language": "en"},
    )

    assert hint_response.status_code == 200
    assert hint_response.json()["hint"].startswith("Подсказка:")

    french_hint_response = await client.get(
        "/api/rules/hint",
        headers=headers,
        params={"word": "unhappy", "language": "fr"},
    )

    assert french_hint_response.status_code == 200
    assert french_hint_response.json()["hint"] is None

    create_response = await client.post(
        "/api/rules",
        headers=headers,
        json={
            "category": "grammar",
            "description": "Use many with countable nouns.",
            "examples": ["many books", "many ideas"],
            "language": "fr",
            "title": "many + countable",
        },
    )

    assert create_response.status_code == 201
    created_rule = create_response.json()
    assert created_rule["is_default"] is False
    assert created_rule["language"] == "fr"
    assert created_rule["title"] == "many + countable"

    french_rules_after_create_response = await client.get(
        "/api/rules",
        headers=headers,
        params={"language": "fr"},
    )
    french_rules_after_create = french_rules_after_create_response.json()
    assert len(french_rules_after_create) == 1
    assert french_rules_after_create[0]["id"] == created_rule["id"]

    update_response = await client.put(
        f"/api/rules/{created_rule['id']}",
        headers=headers,
        json={"title": "much / many"},
    )

    assert update_response.status_code == 200
    assert update_response.json()["title"] == "much / many"

    delete_response = await client.delete(
        f"/api/rules/{created_rule['id']}",
        headers=headers,
    )

    assert delete_response.status_code == 204

    rules_after_delete_response = await client.get("/api/rules", headers=headers)
    rules_after_delete = rules_after_delete_response.json()
    assert all(rule["id"] != created_rule["id"] for rule in rules_after_delete)
