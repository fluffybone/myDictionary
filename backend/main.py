from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import SessionLocal, engine, get_db

# 1. Создаем таблицы при запуске (для Dev режима это ОК)
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- РУЧКИ (ENDPOINTS) ---
# 2. Получить список слов
@app.get("/words", response_model=List[schemas.Word])
def read_words(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    words = db.query(models.Word).offset(skip).limit(limit).all()
    return words

# 3. Добавить слово
@app.post("/words", response_model=schemas.Word)
def create_word(word: schemas.WordCreate, db: Session = Depends(get_db)):
    db_word = models.Word(english_word=word.english_word, russian_word=word.russian_word)
    db.add(db_word)
    db.commit()
    db.refresh(db_word)
    return db_word
