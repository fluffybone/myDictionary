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

ENGLISH_DEFAULT_RULES = [
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

SPANISH_DEFAULT_RULES = [
    {
        "category": "grammar",
        "description": "В испанском существительные обычно имеют род: мужской или женский. Часто слова на -o мужского рода, а слова на -a женского, но есть исключения.",
        "examples": ["el libro", "la casa", "el problema"],
        "title": "Род существительных",
    },
    {
        "category": "grammar",
        "description": "Определенные артикли el, la, los, las используются, когда речь идет о конкретном предмете или группе предметов.",
        "examples": ["el coche", "la mesa", "los amigos", "las palabras"],
        "title": "Определенные артикли",
    },
    {
        "category": "grammar",
        "description": "Глаголы ser и estar переводятся как 'быть', но ser чаще описывает постоянные свойства, а estar — состояние или местоположение.",
        "examples": ["Soy estudiante.", "Estoy cansado.", "Madrid está en España."],
        "title": "Ser и estar",
    },
    {
        "category": "word-building",
        "description": "Правильные глаголы делятся на группы -ar, -er и -ir. Окончание помогает понять, как спрягается глагол.",
        "examples": ["hablar", "comer", "vivir"],
        "title": "Группы глаголов -ar, -er, -ir",
    },
    {
        "category": "phrases",
        "description": "В испанском вопрос можно строить интонацией или вопросительными словами. На письме вопрос обрамляется знаками ¿ и ?.",
        "examples": ["¿Cómo estás?", "¿Dónde vives?", "¿Qué significa esta palabra?"],
        "title": "Вопросительные фразы",
    },
]

FRENCH_DEFAULT_RULES = [
    {
        "category": "grammar",
        "description": "Во французском существительные имеют род: мужской или женский. Род влияет на артикль и согласование прилагательных.",
        "examples": ["le livre", "la table", "une grande maison"],
        "title": "Род существительных",
    },
    {
        "category": "grammar",
        "description": "Определенные артикли le, la, l' и les используются с конкретными предметами, людьми или понятиями.",
        "examples": ["le café", "la ville", "l'école", "les amis"],
        "title": "Определенные артикли",
    },
    {
        "category": "grammar",
        "description": "Глаголы être и avoir очень частотные: они используются как самостоятельные глаголы и помогают образовывать сложные времена.",
        "examples": ["Je suis ici.", "J'ai un livre.", "Nous avons parlé."],
        "title": "Être и avoir",
    },
    {
        "category": "word-building",
        "description": "Многие французские наречия образуются с помощью суффикса -ment. Часто он похож на русское '-но' или '-о' в наречиях.",
        "examples": ["lent -> lentement", "rapide -> rapidement", "vrai -> vraiment"],
        "title": "Суффикс -ment",
    },
    {
        "category": "phrases",
        "description": "Вежливые просьбы во французском часто строятся с s'il vous plaît и условными формами вроде je voudrais.",
        "examples": ["S'il vous plaît.", "Je voudrais un café.", "Pouvez-vous répéter ?"],
        "title": "Вежливые просьбы",
    },
]

GERMAN_DEFAULT_RULES = [
    {
        "category": "grammar",
        "description": "В немецком у существительных три рода: мужской, женский и средний. Артикль часто нужно запоминать вместе со словом.",
        "examples": ["der Tisch", "die Lampe", "das Buch"],
        "title": "Артикли der, die, das",
    },
    {
        "category": "grammar",
        "description": "Все немецкие существительные пишутся с большой буквы, даже если стоят в середине предложения.",
        "examples": ["Ich lese ein Buch.", "Das ist meine Freundin.", "Wir lernen Deutsch."],
        "title": "Существительные с большой буквы",
    },
    {
        "category": "grammar",
        "description": "В простом утвердительном предложении спрягаемый глагол обычно стоит на втором месте.",
        "examples": ["Ich lerne Deutsch.", "Heute lerne ich Deutsch.", "Morgen gehen wir."],
        "title": "Глагол на втором месте",
    },
    {
        "category": "word-building",
        "description": "Немецкий часто образует новые слова соединением нескольких основ. Главное слово обычно стоит в конце и задает род.",
        "examples": ["Haus + Tür -> Haustür", "Wasser + Flasche -> Wasserflasche", "Deutsch + Kurs -> Deutschkurs"],
        "title": "Сложные слова",
    },
    {
        "category": "phrases",
        "description": "Отделяемые приставки могут уходить в конец предложения, поэтому важно узнавать такие глаголы целиком.",
        "examples": ["Ich stehe früh auf.", "Mach bitte die Tür zu.", "Wir fangen jetzt an."],
        "title": "Отделяемые приставки",
    },
]

ITALIAN_DEFAULT_RULES = [
    {
        "category": "grammar",
        "description": "В итальянском существительные обычно имеют мужской или женский род. Часто слова на -o мужского рода, а на -a женского.",
        "examples": ["il libro", "la casa", "la mano"],
        "title": "Род существительных",
    },
    {
        "category": "grammar",
        "description": "Определенные артикли il, lo, la, l', i, gli, le выбираются по роду, числу и началу следующего слова.",
        "examples": ["il ragazzo", "lo studente", "l'amica", "gli amici"],
        "title": "Определенные артикли",
    },
    {
        "category": "grammar",
        "description": "Глаголы essere и avere часто используются сами по себе и как вспомогательные глаголы в прошедших временах.",
        "examples": ["Sono qui.", "Ho una domanda.", "Abbiamo mangiato."],
        "title": "Essere и avere",
    },
    {
        "category": "word-building",
        "description": "Правильные глаголы часто делятся на группы -are, -ere и -ire. Инфинитив помогает понять модель спряжения.",
        "examples": ["parlare", "vedere", "dormire"],
        "title": "Группы глаголов -are, -ere, -ire",
    },
    {
        "category": "phrases",
        "description": "Вежливые просьбы часто строятся через per favore, vorrei и posso. Эти формы помогают звучать мягче.",
        "examples": ["Per favore.", "Vorrei un tè.", "Posso chiedere?"],
        "title": "Вежливые просьбы",
    },
]

DEFAULT_RULES_BY_LANGUAGE = {
    "en": ENGLISH_DEFAULT_RULES,
    "de": GERMAN_DEFAULT_RULES,
    "es": SPANISH_DEFAULT_RULES,
    "fr": FRENCH_DEFAULT_RULES,
    "it": ITALIAN_DEFAULT_RULES,
}

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
    default_rules = DEFAULT_RULES_BY_LANGUAGE.get(language, [])

    if not default_rules:
        return

    count_query = (
        select(LanguageRuleDb.id)
        .where(LanguageRuleDb.owner_id == current_user.id, LanguageRuleDb.language == language)
        .limit(1)
    )
    result = await db.execute(count_query)

    if result.scalar_one_or_none() is not None:
        return

    for rule in default_rules:
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
