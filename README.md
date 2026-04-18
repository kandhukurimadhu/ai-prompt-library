# AI Prompt Library

A full-stack web application for storing and managing AI image generation prompts.

**Assignment:** Front-end Developer Intern — Emplay  
**Date:** April 2026

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 16 |
| Backend | Python 3.11 + Django 4.2 |
| Database | PostgreSQL 14 |
| Cache / Counter | Redis 7 |
| Containerization | Docker + Docker Compose |

---

## Features

- **Browse prompts** — list view showing title and complexity badge (Low / Medium / High)
- **Prompt detail** — full content with a live view counter powered by Redis
- **Add prompt** — reactive form with client-side and server-side validation
- **Complexity indicator** — color-coded badges and visual fill bar (1–10 scale)
- **Persistent storage** — prompts survive container restarts via a named Docker volume
- **Live view count** — incremented in Redis every time a detail page is loaded

---

## Architecture

```
Browser (Angular)
      │
      │  HTTP (proxied in dev via proxy.conf.json)
      ▼
Django (port 8000)
  ├── GET  /prompts/          → list all prompts from PostgreSQL
  ├── POST /prompts/          → validate + create prompt in PostgreSQL
  └── GET  /prompts/:id/      → fetch prompt + INCR Redis counter
      │
      ├── PostgreSQL          → source of truth for prompt data
      └── Redis               → source of truth for view counts
```

### Key architectural decisions

1. **Plain Django views, not DRF** — all endpoints are function-based views returning `JsonResponse`. No serializer classes needed for this scope.
2. **Redis for view counts only** — PostgreSQL stores all persistent prompt data. Redis is used solely for the ephemeral view counter via `INCR`, keeping each concern separate.
3. **Angular proxy in development** — `proxy.conf.json` routes `/prompts` to Django, avoiding CORS issues in development.
4. **Entrypoint script** — the backend container waits for both PostgreSQL and Redis to be healthy before running migrations and starting the server.
5. **Named volume for PostgreSQL** — data persists across `docker-compose down` / `up` cycles.
6. **SQLite fallback for local dev** — when `USE_SQLITE=True`, the backend uses SQLite so developers can run without a local PostgreSQL install. Docker Compose always uses PostgreSQL.

---

## Project Structure

```
ai-prompt-library/
├── backend/
│   ├── config/
│   │   ├── settings.py        # Django settings (reads env vars)
│   │   ├── urls.py            # Root URL config
│   │   └── wsgi.py
│   ├── prompts/
│   │   ├── models.py          # Prompt model
│   │   ├── views.py           # All 3 API endpoints + Redis logic
│   │   ├── urls.py            # Prompt URL routes
│   │   ├── admin.py
│   │   └── migrations/
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── entrypoint.sh          # Waits for DB+Redis, runs migrations
│   └── manage.py
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── prompt-list/     # Lists all prompts
│   │   │   │   ├── prompt-detail/   # Single prompt + view count
│   │   │   │   └── add-prompt/      # Reactive form
│   │   │   ├── services/
│   │   │   │   └── prompt.service.ts
│   │   │   ├── app-routing.module.ts
│   │   │   └── app.module.ts
│   │   ├── styles.css               # Global design system
│   │   └── index.html
│   ├── proxy.conf.json              # Dev proxy → localhost:8000
│   ├── package.json
│   ├── angular.json
│   └── Dockerfile
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## How to Run Locally

### Option 1: Docker Compose (Recommended)

**Prerequisites:** Docker Desktop installed and running

```bash
# 1. Clone the repo
git clone https://github.com/your-username/ai-prompt-library.git
cd ai-prompt-library

# 2. Create environment file
cp .env.example .env

# 3. Start all 4 services (frontend, backend, postgres, redis)
docker-compose up --build

# 4. Open in browser
# Frontend  → http://localhost:4200
# API       → http://localhost:8000/prompts/
```

```bash
# Stop (data preserved in named volume)
docker-compose down

# Stop and wipe all data
docker-compose down -v
```

---

### Option 2: Run Without Docker

#### Backend

```bash
cd backend

python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
# → http://localhost:8000
```

#### Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm start
# → http://localhost:4200
```

> **Note on Redis locally:** Redis is not required locally. If Redis is unavailable, `view_count` gracefully returns `0`. The counter increments correctly when running via Docker Compose.

---

## API Endpoints

### `GET /prompts/`
Returns all prompts.

**Response `200`**
```json
[
  {
    "id": 1,
    "title": "Cyberpunk City",
    "content": "A neon-drenched megacity at night...",
    "complexity": 7,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

### `POST /prompts/`
Creates a new prompt.

**Request body**
```json
{
  "title": "Forest Spirit",
  "content": "An ancient forest spirit emerging from the mist, glowing softly...",
  "complexity": 4
}
```

**Validation rules**
- `title` — required, min 3 characters
- `content` — required, min 20 characters
- `complexity` — required, integer 1–10

**Response `201`** — the created prompt object

**Response `400`** — validation errors
```json
{
  "errors": {
    "title": "Title must be at least 3 characters.",
    "complexity": "Complexity must be between 1 and 10."
  }
}
```

---

### `GET /prompts/:id/`
Returns a single prompt and increments its Redis view counter.

**Response `200`**
```json
{
  "id": 1,
  "title": "Cyberpunk City",
  "content": "A neon-drenched megacity at night...",
  "complexity": 7,
  "created_at": "2024-01-15T10:30:00Z",
  "view_count": 12
}
```

**Response `404`** — `{ "error": "Prompt not found." }`

---

## Frontend Routes

| Route | Component | Description |
|---|---|---|
| `/` | — | Redirects to `/prompts` |
| `/prompts` | PromptListComponent | Browse all prompts |
| `/prompts/:id` | PromptDetailComponent | Single prompt + live views |
| `/add-prompt` | AddPromptComponent | Create new prompt form |

---

## Form Validation

| Field | Rule | Error message |
|---|---|---|
| Title | Required, min 3 chars | "Title must be at least 3 characters." |
| Content | Required, min 20 chars | "Content must be at least 20 characters." |
| Complexity | Required, 1–10 | "Complexity must be between 1 and 10." |

Errors appear after the field is touched. Submit button is disabled while a request is in progress.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `SECRET_KEY` | `super-secret-dev-key` | Django secret key |
| `DEBUG` | `True` | Django debug mode |
| `POSTGRES_DB` | `promptlibrary` | Database name |
| `POSTGRES_USER` | `postgres` | Database user |
| `POSTGRES_PASSWORD` | `postgres` | Database password |
| `USE_SQLITE` | `True` | Use SQLite locally (False in Docker) |

---

## Assumptions & Trade-offs

- **No authentication** — POST endpoint is open. Bonus A not implemented in core scope.
- **Dev server in Docker** — Angular runs `ng serve` rather than Nginx. Appropriate for this assignment scope.
- **Redis view counts reset on restart** — intentional per spec ("Redis is the source of truth"). Not persisted to PostgreSQL.
- **Integer primary key** — `BigAutoField` used over UUID for simplicity and cleaner URLs.
- **SQLite for local dev** — avoids requiring local PostgreSQL install. Docker Compose always uses PostgreSQL.

---

## Bonus Features

- [ ] Bonus A: Authentication (JWT / Session)
- [ ] Bonus B: Tagging system
- [ ] Bonus C: Live hosting
