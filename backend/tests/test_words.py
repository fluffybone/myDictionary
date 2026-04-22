from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.helpers import auth_headers


async def test_words_create_list_and_learning_status(
    client: AsyncClient,
    db_session: AsyncSession,
):
    headers = await auth_headers(client, db_session)

    create_response = await client.post(
        "/api/words",
        headers=headers,
        json={
            "orig_word": "apple",
            "translate_word": "яблоко",
            "description": "fruit",
        },
    )

    assert create_response.status_code == 200
    created_word = create_response.json()
    assert created_word["orig_word"] == "apple"
    assert created_word["language"] == "en"
    assert created_word["is_learning"] is True

    duplicate_response = await client.post(
        "/api/words",
        headers=headers,
        json={
            "orig_word": "Apple",
            "translate_word": "яблоко",
            "description": "duplicate",
        },
    )

    assert duplicate_response.status_code == 400

    french_create_response = await client.post(
        "/api/words",
        headers=headers,
        json={
            "orig_word": "apple",
            "translate_word": "pomme",
            "description": "same spelling in another dictionary",
            "language": "fr",
        },
    )

    assert french_create_response.status_code == 200

    learning_response = await client.get(
        "/api/words/learning",
        headers=headers,
        params={"is_learning": True, "language": "en"},
    )

    assert learning_response.status_code == 200
    learning_data = learning_response.json()
    assert learning_data["total"] == 1
    assert learning_data["items"][0]["id"] == created_word["id"]

    french_learning_response = await client.get(
        "/api/words/learning",
        headers=headers,
        params={"is_learning": True, "language": "fr"},
    )

    assert french_learning_response.status_code == 200
    french_learning_data = french_learning_response.json()
    assert french_learning_data["total"] == 1
    assert french_learning_data["items"][0]["language"] == "fr"

    status_response = await client.patch(
        "/api/words/learning-status",
        headers=headers,
        json={"word_ids": [created_word["id"]], "is_learning": False},
    )

    assert status_response.status_code == 200

    learned_response = await client.get(
        "/api/words/learning",
        headers=headers,
        params={"is_learning": False, "language": "en"},
    )

    assert learned_response.status_code == 200
    learned_data = learned_response.json()
    assert learned_data["total"] == 1
    assert learned_data["items"][0]["is_learning"] is False
