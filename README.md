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

The backend expects a local PostgreSQL server on port 5432 by default, using the `AutoHub` database. Set the `DATABASE_URL` environment variable if your local PostgreSQL username, password, or database name is different.

```powershell
$env:DATABASE_URL = 'postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/AutoHub'
```

## Listings and photos

Published listings are stored in PostgreSQL. Uploaded vehicle photos are saved in `backend/uploads/`, while their file paths are stored in the database. The backend creates the required tables automatically at startup.

## Default environment

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- PostgreSQL: localhost:5432
