# Cafe Fausse Web Application

This project contains a React frontend and Flask backend for the Cafe Fausse website.

## Project Structure

- `frontend/` React + Vite user-facing website and admin page
- `backend/` Flask API and PostgreSQL models
- `scripts/copy-provided-assets.ps1` copies the four provided image files into the frontend public folder

## Use The Provided Images

Run this from the project root:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\copy-provided-assets.ps1
```

This populates `frontend/public/images` with:

- `home-cafe-fausse.png`
- `gallery-special-event.png`
- `gallery-ribeye-steak.png`
- `gallery-cafe-interior.png`

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python app.py
```

Backend runs on `http://localhost:5000`.

Note: this project uses the `psycopg` PostgreSQL driver (v3). If you set `DATABASE_URL`, use this format:

- `postgresql+psycopg://<db_user>:<db_password>@<db_host>:5432/<db_name>`

Admin defaults (change in `.env`):

- `ADMIN_USERNAME=manager`
- `ADMIN_PASSWORD=change-this-password`

## Automated Tests

Run from `backend/`:

```bash
pytest
```

## Deploy To Vercel

This repository is configured for a single Vercel project:

- React frontend is built from `frontend/`
- Flask API is served by `api/index.py`
- Routing is defined in `vercel.json`

### 1) Prerequisites

- A hosted PostgreSQL database (Neon, Supabase, Railway, etc.)
- Vercel CLI (`npm i -g vercel`) or GitHub integration

### 2) Required Vercel Environment Variables

Set these in Vercel Project Settings -> Environment Variables:

- `DATABASE_URL` = `postgresql+psycopg://<db_user>:<db_password>@<db_host>:5432/<db_name>`
- `SECRET_KEY` = long random string
- `ADMIN_USERNAME` = admin login username
- `ADMIN_PASSWORD` = admin login password

Frontend API base URL is environment-aware:

- Local dev defaults to `http://localhost:5000`
- Vercel defaults to same-origin (`/api/...`)
- Optional override with `VITE_API_BASE_URL`

### Supabase Notes

If you are using Supabase for Postgres:

- Keep using SQLAlchemy via `DATABASE_URL` (or `SUPABASE_DB_URL`) with the Supabase Postgres connection string.
- `SUPABASE_URL` and `SUPABASE_KEY` can be set for Supabase SDK usage, but they do not replace `DATABASE_URL` for this backend.
- Never use or expose a Supabase `service_role` key in the browser.

### 3) Deploy Command (CLI)

Run from repository root:

```bash
vercel
```

For production:

```bash
vercel --prod
```

## Implemented Endpoints

- `GET /api/health`
- `GET /api/reservations/availability?time_slot=<iso_datetime>`
- `POST /api/reservations`
- `POST /api/newsletter`
- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/me`
- `POST /api/admin/menu-items` (auth required)
- `GET /api/admin/newsletter` (auth required)
- `GET /api/admin/reservations` (auth required)
- `DELETE /api/admin/reservations/<reservation_id>` (auth required)
