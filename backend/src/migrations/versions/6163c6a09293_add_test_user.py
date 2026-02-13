"""add_test_user

Revision ID: 6163c6a09293
Revises: 170e4b49ef8d
Create Date: 2026-02-13 10:43:44.036793

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "6163c6a09293"
down_revision: Union[str, Sequence[str], None] = "170e4b49ef8d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        INSERT INTO users (email, hashed_password,
            is_active, is_verified,
            verification_code, verification_code_expires_at)
        VALUES ('test@wizard.hog', '$argon2id$v=19$m=65536,t=3,p=4$uvfJI0NA0CwatPDr3lZkjA$8YcFQq6jWk4s1mF969+QBcZZFqkCY48S24R4Wqvm2JE', true, true, NULL, NULL)
        """)


def downgrade() -> None:
    op.execute("DELETE FROM users WHERE email = 'test@wizard.hog'")
