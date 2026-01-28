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