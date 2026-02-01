from src.schemas.users import UserCreate

from sqlalchemy.orm import Session
from src.models.users import User
from src.schemas.users import UserCreate


def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


# Функция для поиска по email (нужна для логина, чтобы проверить пароль)
def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, user: UserCreate, hashed_password: str):
    # Мы передаем уже захешированный пароль, чтобы не импортировать auth здесь (избегаем циклического импорта)
    db_user = User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
