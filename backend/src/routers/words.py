from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src import auth

from src.database import get_db
from src.routers.dependencies import SessionDep
from src.models.users import User as UserDb
from src.models.words import Word as WordDb
from src.schemas.words import Word, WordCreate

router = APIRouter(prefix="/api/words", tags=["words"])


@router.post("", response_model=Word)
def create_word(
    word: WordCreate,
    db: SessionDep,
    current_user: UserDb = Depends(auth.get_current_user),
):
    # Используем current_user.id чтобы привязать слово
    db_word = WordDb(**word.model_dump(), owner_id=current_user.id)
    db.add(db_word)
    db.commit()
    db.refresh(db_word)
    return db_word


@router.get("", response_model=List[Word])
def read_my_words(
    db: SessionDep,
    current_user: UserDb = Depends(auth.get_current_user),
):
    return db.query(WordDb).filter(WordDb.owner_id == current_user.id).all()
