# CampusBrain

CampusBrain is an Android-first academic workspace for attendance, deadlines, documents, and study context. The original design reference remains unchanged at [`REF/campusbrain3.html`](REF/campusbrain3.html); the production UI is being rebuilt as reusable React components.

## Milestone 2 status

Implemented: React + TypeScript + Vite frontend, responsive CampusBrain visual system, local profile/setup flow, persistent SQLite subjects, attendance, tasks, and calendar events, CRUD API validation, derived dashboard data, theme persistence, accessible focus states, and honest unavailable states. Authentication, file ingestion, AI/RAG, notifications, and Capacitor packaging remain planned milestones.

## Local development

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The backend exposes `GET /health` and academic endpoints under `/api`. Tables are created automatically at startup using SQLAlchemy's lightweight local initialization strategy; the SQLite file persists across restarts. Set `VITE_API_URL`, `CAMPUSBRAIN_FRONTEND_URL`, and `CAMPUSBRAIN_DATABASE_URL` when using non-default local settings. API keys belong only in backend environment configuration; never put them in frontend or Android bundle configuration.

## Architecture

The frontend is split into feature-level components under `frontend/src/components`, with shared visual tokens in `frontend/src/styles`. The FastAPI application is under `backend/app`, with SQLAlchemy models, Pydantic schemas, API routes, and attendance domain calculations. SQLite is local, single-user storage and does not imply device synchronization.

### Backend tests

```bash
cd backend
.venv/bin/pytest
```

See [`docs/architecture/overview.md`](docs/architecture/overview.md) and [`docs/design/design-system.md`](docs/design/design-system.md) for the current boundaries and visual tokens.