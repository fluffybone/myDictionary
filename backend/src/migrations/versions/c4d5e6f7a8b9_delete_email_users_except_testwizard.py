"""delete_email_users_except_testwizard

Revision ID: c4d5e6f7a8b9
Revises: b3c4d5e6f7a8
Create Date: 2026-05-12 18:15:00.000000

"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "c4d5e6f7a8b9"
down_revision: Union[str, Sequence[str], None] = "b3c4d5e6f7a8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

TEST_WIZARD_EMAIL = "test@wizard.hog"


def upgrade() -> None:
    op.execute(
        f"""
        DELETE FROM words
        WHERE owner_id IN (
            SELECT id
            FROM users
            WHERE email IS NOT NULL
              AND email <> '{TEST_WIZARD_EMAIL}'
        )
        """
    )
    op.execute(
        f"""
        DELETE FROM language_rules
        WHERE owner_id IN (
            SELECT id
            FROM users
            WHERE email IS NOT NULL
              AND email <> '{TEST_WIZARD_EMAIL}'
        )
        """
    )
    op.execute(
        f"""
        DELETE FROM users
        WHERE email IS NOT NULL
          AND email <> '{TEST_WIZARD_EMAIL}'
        """
    )


def downgrade() -> None:
    pass
