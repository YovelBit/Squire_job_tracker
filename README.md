# Squire Job Tracker

Modern, multi-surface job application tracker with:
- **FastAPI** backend (JWT auth, Postgres, Alembic migrations)
- **React + Vite** dashboard (filtering, sorting, CRUD)
- **Chrome extension** for “quick add” from any tab

## Features
- Secure user accounts with JWT login (`/users/register`, `/users/login`)
- Job pipeline CRUD with normalized display/key fields for clean filtering
- Rich filtering & sorting (company/title/location/source, status, referred, dates)
- Chrome extension to post jobs directly to the backend
- Dockerized Postgres + backend for easy local spin-up
- OpenAPI docs at `/docs` and `/redoc`

## Stack
- Backend: FastAPI, SQLAlchemy, Alembic, Postgres
- Frontend: React 18, Vite, TypeScript, React Router, Axios
- Extension: Chrome MV3 (background worker + popup)
- Auth: JWT (HS256)

## Quick Start (Docker)
1) Copy env if you want custom secrets (optional):
```
export DATABASE_URL=postgresql+psycopg2://squire:squire@db:5432/squire
export JWT_SECRET_KEY=change-me
```
2) Build & run:
```
docker-compose up --build
```
- Backend: http://localhost:8000
- API docs: http://localhost:8000/docs
- Postgres: localhost:5432 (user/pass/db: squire/squire/squire)

3) Run frontend:
```
cd frontend
npm install
VITE_API_BASE_URL=http://localhost:8000 npm run dev
```
- Frontend: http://localhost:5173

## Manual Backend Setup (without Docker)
```
python -m venv .venv
source .venv/bin/activate   # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
export DATABASE_URL=postgresql+psycopg2://user:pass@localhost:5432/squire
export JWT_SECRET_KEY=change-me
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Frontend Dev
```
cd frontend
npm install
VITE_API_BASE_URL=http://localhost:8000 npm run dev
```
Build for production:
```
npm run build
```

## Chrome Extension
Folder: `extension/`
- Load unpacked in Chrome → Extensions → Developer mode → “Load unpacked” → select `extension/`.
- Configure backend URL, email, and password in the popup (stored in `chrome.storage`).
- Uses `/users/login` for JWT and `/jobs` to create entries.

## Environment Variables
Backend:
- `DATABASE_URL` (default: `postgresql+psycopg2://squire:squire@db:5432/squire`)
- `JWT_SECRET_KEY` (default insecure; set in prod)
- `JWT_ALGORITHM` (default: `HS256`)
- `ACCESS_TOKEN_EXPIRE_MINUTES` (default: `60`)

Frontend:
- `VITE_API_BASE_URL` (default: `http://localhost:8000`)

## Project Structure
- `app/` — FastAPI app, routers, models, schemas, auth
- `alembic/` — DB migrations
- `frontend/` — React + Vite dashboard
- `extension/` — Chrome MV3 quick-add extension
- `docker-compose.yml` — Postgres + backend

## Core Endpoints (auth required except register/login)
- `POST /users/register` — create account
- `POST /users/login` — JWT token
- `GET /jobs` — list jobs
- `POST /jobs/filter` — filtered list (supports sorting)
- `POST /jobs` — create job
- `PATCH /jobs/{public_id}` — update job
- `DELETE /jobs/{public_id}` — delete job

## Notes for Production Hardening
- Provide strong `JWT_SECRET_KEY` and rotate regularly.
- Restrict CORS origins to your deployed frontend domain.
- Run Postgres with managed backups; tune pool size/timeouts.
- Serve frontend via a CDN/static host; front it and FastAPI with HTTPS.
- Consider Alembic migration workflow in CI/CD.

## License
MIT