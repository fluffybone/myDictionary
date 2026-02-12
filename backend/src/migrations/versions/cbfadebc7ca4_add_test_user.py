"""Add test user

Revision ID: cbfadebc7ca4
Revises: 152cc6cd4c19
Create Date: 2026-02-12 17:55:36.700284

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "cbfadebc7ca4"
down_revision: Union[str, Sequence[str], None] = "152cc6cd4c19"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("""
        INSERT INTO users (email, hashed_password,
            is_active, is_verified,
            verification_code, verification_code_expires_at)
        VALUES ('test@wizard.hog', '$argon2id$v=19$m=65536,t=3,p=4$uvfJI0NA0CwatPDr3lZkjA$8YcFQq6jWk4s1mF969+QBcZZFqkCY48S24R4Wqvm2JE', true, true, NULL, NULL)
        """)
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("DELETE FROM users WHERE email = 'test@example.com'")
