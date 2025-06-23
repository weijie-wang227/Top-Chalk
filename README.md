# Top-Chalk

Dependancies:
Go (≥ 1.20)
MySQL (≥ 8.0)
Node.js & npm (≥ 18)

Setup Instructions

Backend setup

1. cd backend
2. cp .env.sample .env # Create environment config # Edit `.env` and fill in your MySQL DB credentials, R2 bucket details , etc.
3. go mod tidy
4. go run cmd/project/main.go

Frontend setup

1. cd frontend/vite
2. npm install # First time only
3. npm run dev

Access the App
Visit the URL output by Vite (usually http://localhost:5173).
