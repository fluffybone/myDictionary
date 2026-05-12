"""delete_remaining_email_users

Revision ID: d6e7f8a9b0c1
Revises: c4d5e6f7a8b9
Create Date: 2026-05-12 19:05:00.000000

"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "d6e7f8a9b0c1"
down_revision: Union[str, Sequence[str], None] = "c4d5e6f7a8b9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        DELETE FROM words
        WHERE owner_id IN (
            SELECT id
            FROM users
            WHERE email IS NOT NULL
        )
        """
    )
    op.execute(
        """
        DELETE FROM language_rules
        WHERE owner_id IN (
            SELECT id
            FROM users
            WHERE email IS NOT NULL
        )
        """
    )
    op.execute(
        """
        DELETE FROM users
        WHERE email IS NOT NULL
        """
    )


def downgrade() -> None:
    pass
