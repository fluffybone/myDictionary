"""add language to rules

Revision ID: f4a9c8d2e7b3
Revises: d2b7f4a6c9e1
Create Date: 2026-04-23 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f4a9c8d2e7b3"
down_revision: Union[str, Sequence[str], None] = "d2b7f4a6c9e1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "english_rules",
        sa.Column("language", sa.String(length=10), nullable=False, server_default="en"),
    )
    op.create_index(
        op.f("ix_english_rules_language"),
        "english_rules",
        ["language"],
        unique=False,
    )
    op.create_index(
        "ix_english_rules_owner_language",
        "english_rules",
        ["owner_id", "language"],
        unique=False,
    )
    op.alter_column("english_rules", "language", server_default=None)


def downgrade() -> None:
    op.drop_index("ix_english_rules_owner_language", table_name="english_rules")
    op.drop_index(op.f("ix_english_rules_language"), table_name="english_rules")
    op.drop_column("english_rules", "language")
