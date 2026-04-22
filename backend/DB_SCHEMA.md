# Схема базы данных

Документ фиксирует текущую схему БД и целевое направление для мультиязычных словарей.

## Текущая схема

```mermaid
erDiagram
    users ||--o{ words : owns
    users ||--o{ language_rules : owns

    users {
        int id PK
        string email
        string hashed_password
        boolean is_active
        boolean is_verified
        string verification_code
        datetime verification_code_expires_at
    }

    words {
        int id PK
        string language
        string orig_word
        string translate_word
        datetime created_at
        string description
        int owner_id FK
        boolean is_learning
    }

    language_rules {
        int id PK
        string title
        string description
        json examples
        string category
        string language
        string matcher_key
        boolean is_default
        int owner_id FK
        datetime created_at
        datetime updated_at
    }
```

Сейчас все слова лежат в одной таблице `words` и принадлежат пользователю через `owner_id`.
Поле `language` в `words` и `language_rules` хранит код языка: `en`, `de`, `fr`, `es` или `it`.

## Принцип нескольких языков

Чтобы пользователь мог учить английский, французский, немецкий и другие языки одновременно, мы не создаем отдельную таблицу для каждого языка. Для этого используется поле `language` в таблице `words`.

```mermaid
erDiagram
    users ||--o{ words : owns
    users ||--o{ language_rules : owns

    users {
        int id PK
        string email
        string hashed_password
        boolean is_active
        boolean is_verified
    }

    words {
        int id PK
        string language
        string orig_word
        string translate_word
        string description
        boolean is_learning
        datetime created_at
        int owner_id FK
    }

    language_rules {
        int id PK
        string title
        string description
        json examples
        string category
        string language
        string matcher_key
        boolean is_default
        int owner_id FK
    }
```

Пример данных в будущей схеме:

```text
id | owner_id | language | orig_word | translate_word | is_learning
1  | 1        | en       | hello     | привет         | true
2  | 1        | en       | table     | стол           | false
3  | 1        | fr       | bonjour   | привет         | true
4  | 1        | fr       | maison    | дом            | true
5  | 1        | de       | haus      | дом            | false
```

## Почему одна таблица words лучше отдельных таблиц

Не рекомендуется делать таблицы `english_words`, `french_words`, `german_words` и так далее.

Причины:

- одинаковая структура слов будет дублироваться в нескольких таблицах;
- придется дублировать API-ручки;
- сложнее делать общую статистику;
- сложнее добавлять новые языки;
- сложнее поддерживать пагинацию и проверку слов.

Одна таблица `words` с полем `language` проще и масштабируется нормально.

## Индексы для мультиязычности

Для слов полезны индексы под основные запросы:

```sql
CREATE INDEX ix_words_owner_language
ON words (owner_id, language);

CREATE INDEX ix_words_owner_language_learning
ON words (owner_id, language, is_learning);

CREATE INDEX ix_words_owner_language_created_at
ON words (owner_id, language, created_at DESC);
```

Эти индексы помогают быстро получать словарь конкретного пользователя по выбранному языку.

Для правил полезны индексы:

```sql
CREATE INDEX ix_language_rules_owner_language
ON language_rules (owner_id, language);
```

## Следующий возможный этап

Таблица правил называется `language_rules` и хранит правила для разных языков через поле `language`.
