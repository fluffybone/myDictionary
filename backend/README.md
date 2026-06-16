## Локальное окружение backend

### Важно: Python должен быть 3.11

В production backend запускается в Docker на Python 3.11:

```dockerfile
FROM python:3.11-slim
```

Поэтому локально для backend тоже нужно использовать Python 3.11.

Если создать окружение на системном `python3` macOS, часто получится Python 3.9. Тогда `pip` будет скачивать пакеты с пометкой `cp39`, например:

```text
greenlet-3.2.5-cp39-cp39-macosx_11_0_universal2.whl
```

`cp39` означает Python 3.9. В таком окружении свежие зависимости могут не установиться, например:

```text
ERROR: No matching distribution found for alembic==1.18.3
```

Это не значит, что Alembic сломан. Это значит, что активное виртуальное окружение создано на старой версии Python.

### Проверить текущую версию Python

```bash
python --version
```

После активации правильного окружения должно быть:

```text
Python 3.11.x
```

### Установить Python 3.11 на macOS

Если команды `python3.11` нет:

```bash
brew install python@3.11
```

Проверить:

```bash
python3.11 --version
```

### Если уже есть старый venv на Python 3.9

Если в терминале видно:

```bash
(venv)
```

и зависимости ставятся как `cp39`, значит активировано старое окружение на Python 3.9.

Выйти из него:

```bash
deactivate
```

Удалить старое окружение из папки `backend`:

```bash
rm -rf venv
```

### Создать новое окружение на Python 3.11

Из папки `backend`:

```bash
python3.11 -m venv .venv
```

### Активировать окружение

```bash
source .venv/bin/activate
```

Проверить, что окружение правильное:

```bash
python --version
```

### Установить зависимости

Сначала обновить `pip`:

```bash
python -m pip install --upgrade pip
```

Для обычного запуска backend:

```bash
pip install -r requirements.txt
```

Для разработки и тестов:

```bash
pip install -r requirements-dev.txt
```

### Частая ошибка: `requirements-dev.txt: command not found`

Если ввести:

```bash
requirements-dev.txt
```

терминал ответит:

```text
zsh: command not found: requirements-dev.txt
```

Это нормально: `requirements-dev.txt` — файл, а не команда.

Правильно устанавливать его через `pip`:

```bash
pip install -r requirements-dev.txt
```

### Полная команда с нуля

Из папки `backend`:

```bash
deactivate
rm -rf venv
python3.11 -m venv .venv
source .venv/bin/activate
python --version
python -m pip install --upgrade pip
pip install -r requirements-dev.txt
python -m pytest
```

Если `deactivate` пишет ошибку, значит окружение не было активировано. Можно просто идти дальше со следующей команды.

## Создать main.py

## Как сейчас работает вход

В приложении больше не используется регистрация по `email`.

Текущий поток такой:

1. Фронтенд вызывает `POST /api/accounts/create`.
2. Бэкенд создает нового пользователя в таблице `users`.
3. Для пользователя генерируется `access_code_seed`.
4. На основе `user.id`, `access_code_seed` и `SECRET_KEY` сервер собирает персональный `access_code`.
5. Одновременно сервер выдает `JWT access token`.
6. Фронтенд сохраняет `access_token`, а пользователю показывает `access_code`.

### Что хранится в базе

В базе не хранится готовый `access_code`.

Хранится только:
- `id` пользователя
- `access_code_seed`

Сам `access_code` сервер вычисляет каждый раз заново в [src/auth.py](./src/auth.py).

Формат кода сейчас такой:

```text
WordEater-<userIdBase36>-<signature>
```

### Как работает вход на другом устройстве

Когда пользователь вводит свой код входа:

1. Фронтенд вызывает `POST /api/login-by-code`.
2. Бэкенд извлекает `user_id` из кода.
3. Находит пользователя по `id`.
4. Пересчитывает ожидаемый `access_code` по `access_code_seed`.
5. Сравнивает пересчитанный код с тем, который прислал клиент.
6. Если код верный, выдает новый `JWT access token`.

### Как работает доступ к защищенным ручкам

После входа фронтенд хранит `access_token` в `localStorage` и отправляет его в заголовке:

```text
Authorization: Bearer <token>
```

На защищенных маршрутах используется `get_current_user(...)`:

1. JWT декодируется через `SECRET_KEY`
2. из поля `sub` берется `user.id`
3. пользователь загружается из базы
4. если токен битый, просрочен или пользователь не найден, сервер возвращает `401`

### Срок жизни сессии

JWT сейчас живет `90 дней` (примерно 3 месяца).

Это задается в `ACCESS_TOKEN_EXPIRE_MINUTES` в [src/auth.py](./src/auth.py).

### Управление кодом входа

Есть дополнительные ручки:

- `GET /api/users/access-code` — вернуть текущий код входа
- `POST /api/users/access-code/rotate` — перевыпустить код

После перевыпуска:
- старый `access_code` перестает работать

### Очистка пустых неактивных аккаунтов

Для удаления пользователей без слов, которые не заходили больше `30` дней, есть отдельная monthly-команда:

```bash
python -m src.scripts.cleanup_inactive_users
```

Логика удаления:
- у пользователя `0` слов
- последний визит `last_seen_at` или, если его еще нет, `created_at` старше `30` дней
- связанные `language_rules` удаляются вместе с пользователем
- новый начинает работать сразу
- уже выданные JWT не отзываются мгновенно и живут до истечения срока

### Ограничение на создание аккаунтов

На `POST /api/accounts/create` стоит rate limit по IP:

- не чаще `1` создания в `30` секунд
- не больше `3` созданий за `10` минут

Если лимит превышен, сервер возвращает:

```text
429 Too Many Requests
```

Старые маршруты `email`-авторизации отключены и больше не должны использоваться.

### Запустить dev backend

`fastapi dev main.py`

### Запустить prod backend

`python main.py`

> запуск на **http://localhost:8000/**
> docs **http://localhost:8000/docs**

>посмотреть логи контейнера docker logs -f dictionary_backend_prod

### Запуск docker

создаем образ - `docker build -t dictionary-backend-image .`
запуск `docker run -d -p 8000:8000 --name dictionary-backend-container dictionary-backend-image`

> -d (detach): Запустить в фоновом режиме (терминал останется свободным).
> -p 8000:8000: Пробросить порт. Левая цифра — порт на вашем компьютере, правая — порт внутри контейнера.
> --name dictionary-backend-container: Дать контейнеру удобное имя (иначе Docker придумает странное имя сам).

остановить - `docker stop dictionary-backend-container`

запустить - `docker start dictionary-backend-container`

удалить контейнер - `docker rm -f dictionary-backend-container`

Флаг -v удаляет тома (volumes) - `docker compose down -v`

посмотреть бд
"Подключиться к контейнеру с именем dictionary-postgres и запустить интерактивную сессию psql для пользователя dictionary в базе данных dictionary"

> docker exec -it dictionary-postgres psql -U dictionary -d dictionary

ввести - `\dt`
`SELECT * FROM words;`

выйти `\q`


> ALEMBIC

**создание миграции**
`docker compose exec backend alembic revision --autogenerate -m "Add created_at to words"`

**Применение миграции**
`docker compose exec backend alembic upgrade head`

```docker compose exec postgres psql -U dictionary -d dictionary -c "UPDATE words SET learned = false WHERE learned IS NULL;"
```

**Понижение на одну миграцию**

``docker compose exec backend alembic downgrade -1``

**Обновить базу до актуального состояния**

`docker compose exec backend alembic upgrade head`

**Сказать alembic что миграция уже применена **

`docker compose exec backend alembic stamp 8b18c9f67c3d`

> Для деплоя прода пример алембика (руками подправлять версию в алембике)

def upgrade() -> None:
    # 1. Сначала добавляем колонку как nullable (чтобы не упало сразу)
    op.add_column('words', sa.Column('learned', sa.Boolean(), nullable=True))
    
    # 2. ЗАПОЛНЯЕМ данные для старых строк (Вот этого шага не хватило!)
    op.execute("UPDATE words SET learned = false WHERE learned IS NULL")
    
    # 3. (Опционально) Теперь можно сделать колонку NOT NULL, если нужно
    op.alter_column('words', 'learned', nullable=False)


>Для prod alembic

1. **Как работать с миграциями (Workflow)**
Золотое правило: Миграции создаются (revision) ТОЛЬКО локально на компьютере разработчика. На прод они попадают через Git.

Локально (Dev):

Поменяли модель в коде.

docker compose exec backend alembic revision --autogenerate -m "..."

Проверили файл миграции (если надо, дописали туда op.execute("UPDATE...")).

git add . -> git commit -> git push.

На сервере (Prod):

git pull (скачали код с новой папкой versions).

docker compose -f docker-compose.prod.yml up -d --build (пересобрали контейнеры).

Миграции должны примениться сами при старте контейнера (об этом ниже).

2. **Автоматический запуск миграций на Проде**
Чтобы не заходить каждый раз руками на сервер и не писать alembic upgrade head, добавьте эту команду в скрипт запуска контейнера.

> Запуск тестов

Тесты используют зависимости из `requirements-dev.txt`, поэтому перед первым запуском нужно поставить dev-зависимости.

```bash
cd backend
source .venv/bin/activate
pip install -r requirements-dev.txt
python -m pytest
```

Если снова появляется ошибка про `alembic==1.18.3` или пакеты `cp39`, значит активировано окружение на Python 3.9. Нужно пересоздать окружение через `python3.11 -m venv .venv`.
