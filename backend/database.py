from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# Получаем URL из переменных окружения (которые мы задали в docker-compose)
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://dictionary:pass@localhost:5432/dictionary" # Значение по умолчанию для локального запуска без докера
)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Функция для получения сессии БД (dependency)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
