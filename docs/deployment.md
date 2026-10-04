# DUPILIO — Deployment & Production Operations Guide

> **Brand Statement**: *One profile. Every opportunity. A smarter path to your next role.*

---

## 1. Local Development Multi-Service Topology

DUPILIO consists of three coordinated microservices:

| Service | Port | Directory | Run Command | Technology |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend UI** | `5173` | `frontend/` | `npm run dev` | React 18, Vite 8, TailwindCSS |
| **Backend API** | `5000` | `backend/` | `npm run start` | Node.js, Express, Socket.IO |
| **AI Microservice** | `8000` | `ai_engine/` | `python -m uvicorn main:app --host 127.0.0.1 --port 8000` | Python 3.12, FastAPI, Uvicorn |

---

## 2. Environment Variables Configuration

### Backend (`backend/.env`)
```bash
PORT=5000
NODE_ENV=development
JWT_SECRET=dupilio_production_secure_jwt_secret_key_2026
PYTHON_ENGINE_URL=http://127.0.0.1:8000

# Optional Persistence Overrides (Defaults to sandbox db_sandbox/)
MONGODB_URI=mongodb://localhost:27017/dupilio
REDIS_URL=redis://localhost:6379

# Optional GitHub API Token for Higher Rate Limits
GITHUB_TOKEN=ghp_exampleTokenForHigherRateLimits
```

### Frontend (`frontend/.env`)
```bash
VITE_API_URL=http://localhost:5000/api/v1
```

---

## 3. Production Build & Validation

To test and build the production bundle:

```bash
# 1. Build Frontend
cd frontend
npm run build

# Output will be generated in frontend/dist/ (pure static HTML/JS/CSS assets)
```

---

## 4. Health Check Endpoints

- **Backend Health**: `GET http://localhost:5000/health`
  - Response: `{"status":"ok","service":"Dupilio Core API"}`
- **AI Microservice Health**: `GET http://127.0.0.1:8000/health`
  - Response: `{"status":"ok","service":"DUPILIO AI Engine","engine":"FastAPI / Python 3.10+"}`
- **Contests Live Ingestion**: `GET http://localhost:5000/api/v1/contests`
  - Response: `{"success":true,"count":15,"contests":[...]}`
