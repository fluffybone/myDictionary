from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from sqlalchemy import delete, exists, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.rules import LanguageRule
from src.models.users import User
from src.models.words import Word


@dataclass(slots=True)
class UserCleanupResult:
    deleted_user_ids: list[int]
    deleted_rules_count: int

    @property
    def deleted_users_count(self) -> int:
        return len(self.deleted_user_ids)


async def delete_inactive_empty_users(
    db: AsyncSession,
    *,
    inactive_days: int = 30,
    now: datetime | None = None,
) -> UserCleanupResult:
    current_time = now or datetime.now(timezone.utc)
    cutoff = current_time - timedelta(days=inactive_days)
    last_activity_at = func.coalesce(User.last_seen_at, User.created_at)

    candidate_ids_result = await db.execute(
        select(User.id)
        .where(last_activity_at < cutoff)
        .where(~exists(select(1).where(Word.owner_id == User.id)))
    )
    candidate_ids = list(candidate_ids_result.scalars().all())

    if not candidate_ids:
        return UserCleanupResult(deleted_user_ids=[], deleted_rules_count=0)

    deleted_rules_result = await db.execute(
        delete(LanguageRule).where(LanguageRule.owner_id.in_(candidate_ids))
    )
    await db.execute(delete(User).where(User.id.in_(candidate_ids)))
    await db.commit()

    return UserCleanupResult(
        deleted_user_ids=candidate_ids,
        deleted_rules_count=deleted_rules_result.rowcount or 0,
    )
