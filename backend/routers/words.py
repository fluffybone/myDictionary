# backend/routers/words.py
from typing import Annotated, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models, schemas, auth, database 

router = APIRouter(prefix="/api/words", tags=["words"])
# POST /words
@router.post("", response_model=schemas.Word)
def create_word(
    word: schemas.WordCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Используем current_user.id чтобы привязать слово
    db_word = models.Word(**word.model_dump(), owner_id=current_user.id)
    db.add(db_word)
    db.commit()
    db.refresh(db_word)
    return db_word

# GET /words
@router.get("", response_model=List[schemas.Word])
def read_my_words(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.Word).filter(models.Word.owner_id == current_user.id).all()
