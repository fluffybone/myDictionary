"""add english rules

Revision ID: 84c9d1e9b0a2
Revises: 6b336725db3c
Create Date: 2026-04-22 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "84c9d1e9b0a2"
down_revision: Union[str, Sequence[str], None] = "6b336725db3c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "english_rules",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=False),
        sa.Column("examples", sa.JSON(), nullable=True),
        sa.Column("category", sa.String(), nullable=False),
        sa.Column("matcher_key", sa.String(), nullable=True),
        sa.Column("is_default", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("owner_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"], ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_english_rules_id"), "english_rules", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_english_rules_id"), table_name="english_rules")
    op.drop_table("english_rules")
