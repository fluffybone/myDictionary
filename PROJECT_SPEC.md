# Project Spec for Codex

This file is a working map of the project for future coding sessions. Keep it short, practical, and update it when architecture or workflows change.

## Product

`myDictionary` / `WordEater` is a personal vocabulary trainer.

Main user flows:
- Register/login with email verification.
- Add words with translation and optional description.
- Keep up to 10 active learning words per user.
- Practice active words and move learned words out of the active list.
- View learned words separately.

## Stack

Backend:
- FastAPI
- SQLAlchemy async
- Alembic migrations
- PostgreSQL
- JWT auth with bearer tokens
- Email sending for verification/reset flows

Frontend:
- React 19
- Vite
- TypeScript
- React Router
- Redux Toolkit Query
- CSS modules plus global CSS utilities

Infra:
- Docker Compose for dev and prod
- Nginx serves production frontend and proxies `/api/` to backend
- GitHub Actions deploys to VPS

## Local Run

Main command:

```bash
docker compose up -d --build
```

URLs:
- Frontend: `http://localhost:5173/`
- Backend: `http://localhost:8000/`
- API docs: `http://localhost:8000/docs`
- Postgres host port: `5435`

Dev backend starts through `backend/entrypoint.sh`, so Alembic migrations are applied before `uvicorn --reload`.

## Production Run

Command:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Production frontend is served by nginx on container port `80`, published as host port `8080`.

## Backend Structure

Important files:
- `backend/src/main.py`: FastAPI app, CORS, router registration.
- `backend/src/database.py`: async SQLAlchemy engine/session and `Base`.
- `backend/src/auth.py`: password hashing, JWT creation, current-user dependency.
- `backend/src/routers/users.py`: auth, registration, email verification, password reset.
- `backend/src/routers/words.py`: word CRUD and learning-status endpoints.
- `backend/src/models/users.py`: `users` table.
- `backend/src/models/words.py`: `words` table.
- `backend/src/migrations/versions/`: Alembic migration chain.

Important backend conventions:
- Do not use `Base.metadata.create_all()` in app startup. Schema must be managed by Alembic only.
- Do not run schema-changing code outside migrations.
- Do not add production seed data in normal schema migrations unless intentionally accepted.
- The migration `6163c6a09293_add_test_user.py` currently inserts a test user. Be careful with this in production discussions.

## Database

Tables:
- `users`: email, password hash, active/verified flags, verification code fields.
- `words`: original word, translation, description, owner, created timestamp, `is_learning`.

Current key rules:
- `users.email` is unique.
- `words.owner_id` references `users.id`.
- Duplicate words are checked per user case-insensitively via `ilike`.
- Max active learning words per user is `10` in `backend/src/routers/words.py`.

Migration commands:

```bash
docker compose exec backend alembic revision --autogenerate -m "message"
docker compose exec backend alembic upgrade head
docker compose exec backend alembic current
docker compose exec backend alembic history
```

If a new local DB can be deleted:

```bash
docker compose down -v
docker compose up -d --build
```

## Frontend Structure

Important files:
- `frontend/src/main.tsx`: React root and providers.
- `frontend/src/AppRoutes.tsx`: auth gate and route setup.
- `frontend/src/store/store.ts`: Redux store.
- `frontend/src/store/utils/customBaseQuery.ts`: RTK Query base query and bearer token header.
- `frontend/src/store/authorization/api.ts`: auth endpoints.
- `frontend/src/store/words/api.ts`: words endpoints.
- `frontend/src/features/Layout/`: shared layout.
- `frontend/src/features/DisplayWords/`: word add/edit/delete/list UI.
- `frontend/src/pages/auth/`: login/register/forgot-password pages.
- `frontend/src/pages/dictionary/`: main dictionary page.
- `frontend/src/pages/check/`: practice flow.
- `frontend/src/styles/`: global styles, buttons, cards, form styles, fonts.

Style conventions:
- Global styles are imported through `frontend/src/styles/index.ts`.
- Reuse global button classes: `btn`, `btn-primary`, `btn-secondary`, `btn-small`, `btn-transparent`.
- Use CSS modules for feature/page-specific layout.
- Existing font families are `SnRegular`, `SnMedium`, `SnBold`.
- PWA is intentionally minimal: manifest + network-only service worker, no asset/API caching.

## API Notes

Frontend calls backend through relative `/api/...` URLs.

Auth:
- Token is stored in localStorage under `my_dictionary_access_token`.
- `customBaseQuery` adds `Authorization: Bearer <token>`.

Known route details:
- Login: `POST /api/login`
- Register: `POST /api/register`
- Current user: `GET /api/users/me`
- Verify email: `POST /api/verify-email`
- Forgot password: `POST /api/forgot-password`
- Reset password: `POST /api/reset-password`
- Words: `GET /api/words/learning`
- Add word: `POST /api/words`
- Delete words: `DELETE /api/words/delete`
- Update word: `PUT /api/words/{word_id}`
- Move learning status: `PATCH /api/words/learning-status`

## PWA / Service Worker Decision

PWA support is intentionally minimal after previous mobile loading issues.

Current policy:
- Manifest lives at `frontend/public/manifest.webmanifest`.
- Icons live in `frontend/public`: `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`.
- Service worker lives at `frontend/public/sw.js`.
- Service worker must stay network-only: no precache, no runtime cache, no API cache.
- `navigator.serviceWorker` registration should remain production-only in `frontend/src/main.tsx`.
- If install UI is added later, keep it separate from the service worker and test mobile/desktop before deploy.

If mobile users still have old installed app behavior, tell them to remove the home-screen app and clear site data for the domain.

## Deployment Notes

GitHub workflow:
- `.github/workflows/deploy.yml`
- Runs on push to `main`.
- Uses SSH to server, pulls latest code, and runs `docker compose -f docker-compose.prod.yml up -d --build`.

GitHub Actions Node warning:
- `actions/checkout` should stay current.
- `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` may be present to opt into Node 24 actions.

## Things to Watch

- `docker-compose.prod.yml` still has `version: "3.8"`, which Compose warns is obsolete. Safe to remove later.
- Backend imports include a few unused imports in `main.py` and model files. Clean only when doing related work.
- Some generated/cache files may exist locally (`__pycache__`, `.DS_Store`, `dist`). Do not commit them unless intentionally tracked.
- The frontend build must pass with `cd frontend && npm run build`.
- For DB changes, always update models and add/check Alembic migration.
- For auth changes, test register/login/me/reset flows.
