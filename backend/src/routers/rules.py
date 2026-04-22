from typing import Annotated, Callable, Dict, List, Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from src import auth
from src.database import get_db
from src.models.rules import LanguageRule as LanguageRuleDb
from src.models.users import User as UserDb
from src.schemas.rules import (
    LanguageRule,
    LanguageRuleCreate,
    LanguageRuleHint,
    LanguageRuleUpdate,
)

router = APIRouter(prefix="/api/rules", tags=["rules"])
SupportedLanguage = Literal["en", "de", "fr", "es", "it"]

DEFAULT_RULES = [
    {
        "category": "word-building",
        "description": "Приставка un- часто добавляет значение отрицания: not, opposite of.",
        "examples": ["happy -> unhappy", "known -> unknown", "usual -> unusual"],
        "matcher_key": "prefix-un",
        "title": "Приставка un-",
    },
    {
        "category": "word-building",
        "description": "Приставка re- часто значит повтор действия: again, one more time.",
        "examples": ["write -> rewrite", "read -> reread", "build -> rebuild"],
        "matcher_key": "prefix-re",
        "title": "Приставка re-",
    },
    {
        "category": "word-building",
        "description": "Суффикс -less часто значит without, то есть 'без чего-то'.",
        "examples": ["care -> careless", "hope -> hopeless", "use -> useless"],
        "matcher_key": "suffix-less",
        "title": "Суффикс -less",
    },
    {
        "category": "word-building",
        "description": "Суффикс -ful часто значит full of, то есть 'полный чего-то'.",
        "examples": ["care -> careful", "hope -> hopeful", "beauty -> beautiful"],
        "matcher_key": "suffix-ful",
        "title": "Суффикс -ful",
    },
    {
        "category": "word-building",
        "description": "Суффикс -er часто обозначает человека или предмет, который выполняет действие.",
        "examples": ["teach -> teacher", "work -> worker", "open -> opener"],
        "matcher_key": "suffix-er",
        "title": "Суффикс -er",
    },
    {
        "category": "word-building",
        "description": "Слова на -tion часто являются существительными и обозначают процесс, результат или идею.",
        "examples": ["decide -> decision", "inform -> information", "educate -> education"],
        "matcher_key": "suffix-tion",
        "title": "Суффикс -tion",
    },
    {
        "category": "word-building",
        "description": "Суффикс -ment часто превращает глагол в существительное результата или процесса.",
        "examples": ["move -> movement", "develop -> development", "agree -> agreement"],
        "matcher_key": "suffix-ment",
        "title": "Суффикс -ment",
    },
    {
        "category": "word-building",
        "description": "Суффикс -ly часто превращает прилагательное в наречие: как именно происходит действие.",
        "examples": ["quick -> quickly", "slow -> slowly", "careful -> carefully"],
        "matcher_key": "suffix-ly",
        "title": "Суффикс -ly",
    },
    {
        "category": "grammar",
        "description": "Если слово заканчивается на согласную + y, перед -s или -ed часто y меняется на i.",
        "examples": ["study -> studies", "try -> tried", "city -> cities"],
        "matcher_key": "consonant-y",
        "title": "Согласная + y",
    },
    {
        "category": "grammar",
        "description": "В Past Simple правильные глаголы обычно получают -ed, но написание может немного меняться.",
        "examples": ["work -> worked", "like -> liked", "study -> studied"],
        "matcher_key": "past-simple-ed",
        "title": "Past Simple: -ed",
    },
    {
        "category": "grammar",
        "description": "Форма -ing используется в Continuous и после некоторых глаголов/предлогов.",
        "examples": ["I am learning.", "She likes reading.", "Thank you for helping."],
        "matcher_key": "ing-form",
        "title": "Форма -ing",
    },
    {
        "category": "phrases",
        "description": "Фразовые глаголы состоят из глагола и частицы. Их значение не всегда равно сумме слов.",
        "examples": ["look up", "give up", "turn on", "find out"],
        "matcher_key": "phrasal-verbs",
        "title": "Фразовые глаголы",
    },
]

VOWELS = {"a", "e", "i", "o", "u"}


def normalize_word(word: str) -> str:
    return word.strip().lower()


def is_consonant_before_y(word: str) -> bool:
    return len(word) > 1 and word.endswith("y") and word[-2] not in VOWELS


MATCHERS: Dict[str, Callable[[str], bool]] = {
    "prefix-un": lambda word: word.startswith("un") and len(word) > 4,
    "prefix-re": lambda word: word.startswith("re") and len(word) > 4,
    "suffix-less": lambda word: word.endswith("less"),
    "suffix-ful": lambda word: word.endswith("ful"),
    "suffix-er": lambda word: word.endswith("er") and len(word) > 4,
    "suffix-tion": lambda word: word.endswith("tion"),
    "suffix-ment": lambda word: word.endswith("ment"),
    "suffix-ly": lambda word: word.endswith("ly") and len(word) > 4,
    "consonant-y": is_consonant_before_y,
    "past-simple-ed": lambda word: word.endswith("ed") and len(word) > 4,
    "ing-form": lambda word: word.endswith("ing") and len(word) > 5,
    "phrasal-verbs": lambda word: " " in word,
}


async def ensure_default_rules(
    db: AsyncSession,
    current_user: UserDb,
    language: SupportedLanguage,
) -> None:
    if language != "en":
        return

    count_query = (
        select(LanguageRuleDb.id)
        .where(LanguageRuleDb.owner_id == current_user.id, LanguageRuleDb.language == language)
        .limit(1)
    )
    result = await db.execute(count_query)

    if result.scalar_one_or_none() is not None:
        return

    for rule in DEFAULT_RULES:
        db.add(
            LanguageRuleDb(
                **rule,
                is_default=True,
                language=language,
                owner_id=current_user.id,
            )
        )

    await db.commit()


@router.get("", response_model=List[LanguageRule])
async def read_rules(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[UserDb, Depends(auth.get_current_user)],
    language: SupportedLanguage = Query(
        "en", description="Язык правил: en, de, fr, es или it"
    ),
):
    await ensure_default_rules(db, current_user, language)

    query = (
        select(LanguageRuleDb)
        .where(LanguageRuleDb.owner_id == current_user.id, LanguageRuleDb.language == language)
        .order_by(LanguageRuleDb.is_default.asc(), LanguageRuleDb.created_at.desc(), LanguageRuleDb.id.asc())
    )
    result = await db.execute(query)

    return result.scalars().all()


@router.get("/hint", response_model=LanguageRuleHint)
async def get_rule_hint(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[UserDb, Depends(auth.get_current_user)],
    word: str = Query(..., min_length=1),
    language: SupportedLanguage = Query(
        "en", description="Язык правил: en, de, fr, es или it"
    ),
):
    await ensure_default_rules(db, current_user, language)

    normalized_word = normalize_word(word)
    query = select(LanguageRuleDb).where(
        LanguageRuleDb.owner_id == current_user.id,
        LanguageRuleDb.language == language,
        LanguageRuleDb.matcher_key.is_not(None),
    )
    result = await db.execute(query)
    rules = result.scalars().all()

    for rule in rules:
        matcher = MATCHERS.get(rule.matcher_key)
        if matcher and matcher(normalized_word):
            return {"hint": f"Подсказка: {rule.description}"}

    return {"hint": None}


@router.post("", response_model=LanguageRule, status_code=status.HTTP_201_CREATED)
async def create_rule(
    rule: LanguageRuleCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[UserDb, Depends(auth.get_current_user)],
):
    db_rule = LanguageRuleDb(
        **rule.model_dump(),
        is_default=False,
        owner_id=current_user.id,
    )
    db.add(db_rule)
    await db.commit()
    await db.refresh(db_rule)

    return db_rule


@router.put("/{rule_id}", response_model=LanguageRule)
async def update_rule(
    rule_id: int,
    rule_update: LanguageRuleUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[UserDb, Depends(auth.get_current_user)],
):
    query = select(LanguageRuleDb).where(
        LanguageRuleDb.id == rule_id,
        LanguageRuleDb.owner_id == current_user.id,
    )
    result = await db.execute(query)
    db_rule = result.scalar_one_or_none()

    if not db_rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Правило не найдено",
        )

    update_data = rule_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_rule, field, value)

    db.add(db_rule)
    await db.commit()
    await db.refresh(db_rule)

    return db_rule


@router.delete("/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_rule(
    rule_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[UserDb, Depends(auth.get_current_user)],
):
    query = delete(LanguageRuleDb).where(
        LanguageRuleDb.id == rule_id,
        LanguageRuleDb.owner_id == current_user.id,
    )
    result = await db.execute(query)
    await db.commit()

    if result.rowcount == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Правило не найдено",
        )
