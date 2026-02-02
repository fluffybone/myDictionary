import sys
import os

# Добавляем корневую папку проекта (/app) в sys.path
# Это позволяет видеть пакет 'src'
sys.path.append(os.getcwd())  # Если запускаем из корня
sys.path.append("/app")  # Жесткая привязка к Docker-пути

import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# 1. Импортируем модели и настройки
from src.database import Base, DATABASE_URL
from src.models import User, Word  # Импорт нужен, чтобы Base узнал о моделях

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# 2. Подставляем URL из переменных окружения/кода, переопределяя alembic.ini
config.set_main_option("sqlalchemy.url", DATABASE_URL)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    """Вспомогательная функция для запуска миграций в синхронном контексте"""
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Асинхронное создание движка и запуск миграций"""

    # Создаем асинхронный движок на основе конфига
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        # Запускаем синхронную функцию внутри асинхронного соединения
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""

    # Запускаем асинхронный цикл событий
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
