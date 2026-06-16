from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.rules import LanguageRule
from src.models.users import User
from src.models.words import Word
from src.maintenance.user_cleanup import delete_inactive_empty_users


async def test_cleanup_deletes_old_user_without_words_and_related_rules(
    db_session: AsyncSession,
):
    stale_user = User(
        access_code_seed="stale-seed",
        is_verified=True,
        is_active=True,
        created_at=datetime.now(timezone.utc) - timedelta(days=45),
    )
    db_session.add(stale_user)
    await db_session.commit()
    await db_session.refresh(stale_user)

    db_session.add(
        LanguageRule(
            title="rule",
            description="desc",
            category="grammar",
            language="en",
            owner_id=stale_user.id,
        )
    )
    await db_session.commit()

    result = await delete_inactive_empty_users(
        db_session,
        now=datetime.now(timezone.utc),
    )

    assert result.deleted_user_ids == [stale_user.id]
    assert result.deleted_rules_count == 1

    deleted_user = await db_session.get(User, stale_user.id)
    assert deleted_user is None

    remaining_rules = await db_session.execute(
        select(LanguageRule).where(LanguageRule.owner_id == stale_user.id)
    )
    assert remaining_rules.scalars().all() == []


async def test_cleanup_keeps_old_user_with_words(
    db_session: AsyncSession,
):
    user_with_words = User(
        access_code_seed="word-seed",
        is_verified=True,
        is_active=True,
        created_at=datetime.now(timezone.utc) - timedelta(days=45),
    )
    db_session.add(user_with_words)
    await db_session.commit()
    await db_session.refresh(user_with_words)

    db_session.add(
        Word(
            orig_word="hello",
            translate_word="privet",
            language="en",
            owner_id=user_with_words.id,
        )
    )
    await db_session.commit()

    result = await delete_inactive_empty_users(
        db_session,
        now=datetime.now(timezone.utc),
    )

    assert result.deleted_user_ids == []
    assert await db_session.get(User, user_with_words.id) is not None


async def test_cleanup_keeps_recently_seen_user_without_words(
    db_session: AsyncSession,
):
    recent_user = User(
        access_code_seed="recent-seed",
        is_verified=True,
        is_active=True,
        created_at=datetime.now(timezone.utc) - timedelta(days=45),
        last_seen_at=datetime.now(timezone.utc) - timedelta(days=10),
    )
    db_session.add(recent_user)
    await db_session.commit()
    await db_session.refresh(recent_user)

    result = await delete_inactive_empty_users(
        db_session,
        now=datetime.now(timezone.utc),
    )

    assert result.deleted_user_ids == []
    assert await db_session.get(User, recent_user.id) is not None
