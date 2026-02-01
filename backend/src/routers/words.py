from typing import List
from fastapi import APIRouter, Depends

from typing import Annotated
from src import auth
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_db

from src.models.users import User as UserDb
from src.models.words import Word as WordDb
from src.schemas.words import Word, WordCreate
from sqlalchemy import select

router = APIRouter(prefix="/api/words", tags=["words"])


@router.post("", response_model=Word)
async def create_word(
    word: WordCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: UserDb = Depends(auth.get_current_user),
):
    # Используем current_user.id чтобы привязать слово
    db_word = WordDb(**word.model_dump(), owner_id=current_user.id)
    db.add(db_word)
    await db.commit()
    await db.refresh(db_word)
    return db_word


@router.get("", response_model=List[Word])
async def read_my_words(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[UserDb, Depends(auth.get_current_user)],
):
    query = select(WordDb).where(WordDb.owner_id == current_user.id)

    result = await db.execute(query)

    return result.scalars().all()
