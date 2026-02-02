### Сделать виртуальное окружение

`python3 -m venv venv`

### Активировать окружение

`source venv/bin/activate`

### Установить зависимости

`pip install -r requirements.txt`

## Создать main.py

### Запустить dev backend

`fastapi dev main.py`

### Запустить prod backend

`python main.py`

> запуск на **http://localhost:8000/**
> docs **http://localhost:8000/docs**

>посмотреть логи контейнера docker logs -f dictionary_backend

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

> Для деплоя прода пример алембика (руками подправлять версию в алембике)

def upgrade() -> None:
    # 1. Сначала добавляем колонку как nullable (чтобы не упало сразу)
    op.add_column('words', sa.Column('learned', sa.Boolean(), nullable=True))
    
    # 2. ЗАПОЛНЯЕМ данные для старых строк (Вот этого шага не хватило!)
    op.execute("UPDATE words SET learned = false WHERE learned IS NULL")
    
    # 3. (Опционально) Теперь можно сделать колонку NOT NULL, если нужно
    op.alter_column('words', 'learned', nullable=False)
