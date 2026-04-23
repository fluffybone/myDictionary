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

    expected_default_rule_titles = {
        "de": {
            "Артикли der, die, das",
            "Глагол на втором месте",
            "Отделяемые приставки",
            "Сложные слова",
            "Существительные с большой буквы",
        },
        "es": {
            "Вопросительные фразы",
            "Группы глаголов -ar, -er, -ir",
            "Определенные артикли",
            "Род существительных",
            "Ser и estar",
        },
        "fr": {
            "Вежливые просьбы",
            "Определенные артикли",
            "Род существительных",
            "Суффикс -ment",
            "Être и avoir",
        },
        "it": {
            "Essere и avere",
            "Вежливые просьбы",
            "Группы глаголов -are, -ere, -ire",
            "Определенные артикли",
            "Род существительных",
        },
    }

    for language, expected_titles in expected_default_rule_titles.items():
        language_rules_response = await client.get(
            "/api/rules",
            headers=headers,
            params={"language": language},
        )

        assert language_rules_response.status_code == 200
        language_rules = language_rules_response.json()
        assert len(language_rules) == 5
        assert all(rule["is_default"] for rule in language_rules)
        assert all(rule["language"] == language for rule in language_rules)
        assert {rule["title"] for rule in language_rules} == expected_titles

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
    assert len(french_rules_after_create) == 6
    assert any(rule["id"] == created_rule["id"] for rule in french_rules_after_create)

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
