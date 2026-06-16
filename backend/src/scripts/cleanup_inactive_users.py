import asyncio

from src.database import AsyncSessionLocal
from src.maintenance.user_cleanup import delete_inactive_empty_users


async def _run() -> None:
    async with AsyncSessionLocal() as db:
        result = await delete_inactive_empty_users(db, inactive_days=30)

    print(
        "Deleted "
        f"{result.deleted_users_count} inactive empty users and "
        f"{result.deleted_rules_count} related rules, "
        f"{result.deleted_suggestions_count} related suggestions."
    )


if __name__ == "__main__":
    asyncio.run(_run())
