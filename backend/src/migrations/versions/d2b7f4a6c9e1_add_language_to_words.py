"""add language to words

Revision ID: d2b7f4a6c9e1
Revises: 84c9d1e9b0a2
Create Date: 2026-04-23 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d2b7f4a6c9e1"
down_revision: Union[str, Sequence[str], None] = "84c9d1e9b0a2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "words",
        sa.Column("language", sa.String(length=10), nullable=False, server_default="en"),
    )
    op.create_index(op.f("ix_words_language"), "words", ["language"], unique=False)
    op.create_index(
        "ix_words_owner_language",
        "words",
        ["owner_id", "language"],
        unique=False,
    )
    op.create_index(
        "ix_words_owner_language_learning",
        "words",
        ["owner_id", "language", "is_learning"],
        unique=False,
    )
    op.create_index(
        "ix_words_owner_language_created_at",
        "words",
        ["owner_id", "language", sa.text("created_at DESC")],
        unique=False,
    )
    op.alter_column("words", "language", server_default=None)


def downgrade() -> None:
    op.drop_index("ix_words_owner_language_created_at", table_name="words")
    op.drop_index("ix_words_owner_language_learning", table_name="words")
    op.drop_index("ix_words_owner_language", table_name="words")
    op.drop_index(op.f("ix_words_language"), table_name="words")
    op.drop_column("words", "language")
