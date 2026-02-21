from typing import List
from fastapi import APIRouter, Depends
from fastapi import HTTPException, status
from typing import Annotated
from src import auth
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_db

from src.models.users import User as UserDb
from src.models.words import Word as WordDb
from src.schemas.words import Word, WordCreate
from sqlalchemy import select, func

router = APIRouter(prefix="/api/words", tags=["words"])

MAX_WORDS_PER_USER = 20


@router.post("", response_model=Word)
async def create_word(
    word: WordCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: UserDb = Depends(auth.get_current_user),
):

    existing_word_query = select(WordDb).where(
        WordDb.owner_id == current_user.id, WordDb.orig_word == word.orig_word
    )

    existing_word_result = await db.execute(existing_word_query)
    existing_word = existing_word_result.scalar_one_or_none()

    if existing_word:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Слово '{word.orig_word}' уже существует в вашем словаре ",
        )

    words_count_query = select(func.count()).where(WordDb.owner_id == current_user.id)
    words_count_result = await db.execute(words_count_query)
    words_count = words_count_result.scalar()

    if words_count >= MAX_WORDS_PER_USER:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Достигнут предел на запись слов для текущего изучения (максимум 20 слов)",
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
):
    query = select(WordDb).where(WordDb.owner_id == current_user.id)

    result = await db.execute(query)

    return result.scalars().all()
