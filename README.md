# AutoHub

AutoHub is an online vehicle buying and selling marketplace. The project follows the core flow: Seller → AutoHub → Buyer.

## Project structure

- frontend/: React + Vite frontend UI
- backend/: Python FastAPI backend API
- docker-compose.yml: PostgreSQL database setup

## Frontend

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

## Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Database

```bash
docker compose up -d db
```

This starts PostgreSQL on port 5432.

## Default environment

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- PostgreSQL: localhost:5432
