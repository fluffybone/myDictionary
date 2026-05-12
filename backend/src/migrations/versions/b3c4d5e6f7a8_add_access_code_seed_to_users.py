"""add_access_code_seed_to_users

Revision ID: b3c4d5e6f7a8
Revises: f4a9c8d2e7b3
Create Date: 2026-05-12 16:10:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b3c4d5e6f7a8"
down_revision: Union[str, Sequence[str], None] = "a7c2d9e4f5b6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("access_code_seed", sa.String(), nullable=True))
    op.create_index(
        op.f("ix_users_access_code_seed"),
        "users",
        ["access_code_seed"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_users_access_code_seed"), table_name="users")
    op.drop_column("users", "access_code_seed")
