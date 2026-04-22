"""rename english rules to language rules

Revision ID: a7c2d9e4f5b6
Revises: f4a9c8d2e7b3
Create Date: 2026-04-23 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


revision: str = "a7c2d9e4f5b6"
down_revision: Union[str, Sequence[str], None] = "f4a9c8d2e7b3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.rename_table("english_rules", "language_rules")
    op.execute("ALTER INDEX IF EXISTS ix_english_rules_id RENAME TO ix_language_rules_id")
    op.execute("ALTER INDEX IF EXISTS ix_english_rules_language RENAME TO ix_language_rules_language")
    op.execute("ALTER INDEX IF EXISTS ix_english_rules_owner_language RENAME TO ix_language_rules_owner_language")


def downgrade() -> None:
    op.execute("ALTER INDEX IF EXISTS ix_language_rules_owner_language RENAME TO ix_english_rules_owner_language")
    op.execute("ALTER INDEX IF EXISTS ix_language_rules_language RENAME TO ix_english_rules_language")
    op.execute("ALTER INDEX IF EXISTS ix_language_rules_id RENAME TO ix_english_rules_id")
    op.rename_table("language_rules", "english_rules")
