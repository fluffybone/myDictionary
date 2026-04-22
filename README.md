# myDictionary

Создавайте персональный словарь выученных слов. Проверяйте, насколько хорошо вы их запомнили — функция проверки автоматически подбирает случайные слова для тренировки.

> запуск локально
команда `docker compose up -d --build`
Фронт **http://localhost:5173/**
Бэкенд
> запуск на **http://localhost:8000/**
> docs **http://localhost:8000/docs**

> запуск прод сборки `docker compose -f docker-compose.prod.yml up -d --build`

## Backend Python

Backend в Docker/prod работает на Python 3.11. Для локального backend-окружения используйте Python 3.11, а не системный `python3` macOS, который может быть Python 3.9.

```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements-dev.txt
python -m pytest
```

## Идеи

Идеи для развития проекта лежат в `IDEAS.md`.
