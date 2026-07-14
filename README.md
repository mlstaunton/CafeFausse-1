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

- `postgresql+psycopg://postgres:postgres@localhost:5432/cafe_fausse`

Admin defaults (change in `.env`):

- `ADMIN_USERNAME=manager`
- `ADMIN_PASSWORD=change-this-password`

## Automated Tests

Run from `backend/`:

```bash
pytest
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
