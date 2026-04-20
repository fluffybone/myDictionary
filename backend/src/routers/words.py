from datetime import date, datetime, time, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from fastapi import HTTPException, status
from typing import Annotated
from src import auth
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_db

from src.models.users import User as UserDb
from src.models.words import Word as WordDb
from src.schemas.words import (
    Word,
    WordCreate,
    DeleteWordsRequest,
    WordUpdate,
    BulkUpdateLearningStatusRequest,
)
from sqlalchemy import select, func, delete

router = APIRouter(prefix="/api/words", tags=["words"])

MAX_WORDS_PER_USER = 10


# Для слов Изучаю сейчас
@router.post("", response_model=Word)
async def create_word(
    word: WordCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: UserDb = Depends(auth.get_current_user),
):

    existing_word_query = select(WordDb).where(
        WordDb.owner_id == current_user.id, WordDb.orig_word.ilike(word.orig_word)
    )

    existing_word_result = await db.execute(existing_word_query)
    existing_word = existing_word_result.scalar_one_or_none()

    if existing_word:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Слово '{word.orig_word}' уже существует в вашем словаре",
        )

    learning_words_count_query = select(func.count()).where(
        WordDb.owner_id == current_user.id,
        WordDb.is_learning == True,
    )
    learning_words_count_result = await db.execute(learning_words_count_query)
    learning_words_count = learning_words_count_result.scalar()

    if learning_words_count >= MAX_WORDS_PER_USER:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Достигнут предел на запись слов для текущего изучения (максимум {MAX_WORDS_PER_USER} слов)",
        )

    word_data = word.model_dump()
    db_word = WordDb(**word_data, owner_id=current_user.id)
    db.add(db_word)
    await db.commit()
    await db.refresh(db_word)
    return db_word


@router.get("/learning", response_model=List[Word])
async def read_my_words(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[UserDb, Depends(auth.get_current_user)],
    is_learning: Optional[bool] = Query(
        None,
        description="Фильтр по статусу изучения (true - изучаемые, false - изученные, null - все слова)",
    ),
    skip: int = Query(0, ge=0, description="Количество пропускаемых записей"),
    limit: int = Query(
        100, ge=1, le=1000, description="Максимальное количество записей"
    ),
    date_from: Optional[date] = Query(
        None, description="Начальная дата создания слова в формате YYYY-MM-DD"
    ),
    date_to: Optional[date] = Query(
        None, description="Конечная дата создания слова в формате YYYY-MM-DD"
    ),
):
    query = select(WordDb).where(WordDb.owner_id == current_user.id)

    if is_learning is not None:
        query = query.where(WordDb.is_learning == is_learning)

    if date_from is not None:
        query = query.where(
            WordDb.created_at >= datetime.combine(date_from, time.min)
        )

    if date_to is not None:
        next_day = date_to + timedelta(days=1)
        query = query.where(WordDb.created_at < datetime.combine(next_day, time.min))

    query = query.offset(skip).limit(limit)
    query = query.order_by(WordDb.created_at.desc())

    result = await db.execute(query)
    words = result.scalars().all()

    return words


@router.delete("/delete", status_code=status.HTTP_204_NO_CONTENT)
async def delete_words(
    request: DeleteWordsRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: UserDb = Depends(auth.get_current_user),
):

    print(f"Получен запрос на удаление слов: {request.word_ids}")
    if not request.word_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Список не может быть пустым",
        )
    query = delete(WordDb).where(
        WordDb.owner_id == current_user.id, WordDb.id.in_(request.word_ids)
    )
    result = await db.execute(query)
    await db.commit()

    if result.rowcount == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Слова для удаления не найдены",
        )

    return {"message": f"Удалено {result.rowcount} cлов(а)"}


@router.put("/{word_id}", response_model=Word)
async def update_word(
    word_id: int,
    word_update: WordUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: UserDb = Depends(auth.get_current_user),
):
    word_query = select(WordDb).where(
        WordDb.id == word_id, WordDb.owner_id == current_user.id
    )
    word_result = await db.execute(word_query)
    db_word = word_result.scalar_one_or_none()

    if not db_word:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Слово не найдено"
        )

    if word_update.orig_word is not None:
        existing_word_query = select(WordDb).where(
            WordDb.owner_id == current_user.id,
            WordDb.orig_word.ilike(word_update.orig_word),
            WordDb.id != word_id,
        )

        existing_word_result = await db.execute(existing_word_query)
        existing_word = existing_word_result.scalar_one_or_none()

        if existing_word:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Слово '{word_update.orig_word}' уже существует в вашем словаре",
            )
    update_data = word_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_word, field, value)

    db.add(db_word)
    await db.commit()
    await db.refresh(db_word)

    return db_word


# Эндпоинт для массового обновления статуса изучения
@router.patch("/learning-status", response_model=dict)
async def bulk_update_learning_status(
    request: BulkUpdateLearningStatusRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: UserDb = Depends(auth.get_current_user),
):
    """Массовое обновление статуса изучения для нескольких слов"""

    if not request.word_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Список ID слов не может быть пустым",
        )

    # Выполняем массовое обновление
    query = select(WordDb).where(
        WordDb.owner_id == current_user.id, WordDb.id.in_(request.word_ids)
    )
    result = await db.execute(query)
    words = result.scalars().all()

    if not words:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Слова не найдены",
        )

    for word in words:
        word.is_learning = request.is_learning

    await db.commit()

    return {"message": f"Обновлено {len(words)} слов"}
