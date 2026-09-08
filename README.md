# MedPlus Smart Queue AI - Hospital Queue Management System

A full-stack, production-ready **Smart Queue AI** hospital management platform. This system connects a React + Vite TypeScript frontend to a FastAPI Python backend featuring real-time WebSockets, AI consultation duration predictions, triage prioritization, and automated OPD room queue dispatching.

---

## 🌟 Key Features

1. **AI-Powered Consultation Predictions**:
   - Predicts consultation duration dynamically based on medical service type, patient triage category (`regular` vs `priority`), hour of day, and doctor room experience.

2. **Automated OPD Room Dispatcher**:
   - Calculates estimated wait times in real time.
   - Automatically assigns patients to available OPD consultation rooms based on current queue load.

3. **Real-Time WebSocket Sync**:
   - Instant live updates across all connected clients whenever a patient registers, is called to a consultation room, or completes a session.

4. **Multi-Role Authentication & Access Control**:
   - **Doctor / Staff**: Room control, calling next patient, completing consultations, seeding demo queues, and clinical analytics.
   - **Patient Portal**: Live token status tracking, position in queue, assigned OPD room, and estimated wait time.

5. **EHR & Patient Record Search**:
   - Integrated search across active and historical patient consultation records.

---

## 🚀 Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Lucide Icons, Modern Glassmorphism CSS.
- **Backend**: Python 3.11, FastAPI, Uvicorn, SQLAlchemy, SQLite (production PostgreSQL ready), Pydantic v2, NumPy, Scikit-Learn.
- **Real-Time Communication**: WebSockets (`/ws` endpoint).
- **Deployment Targets**: Render (FastAPI Backend) + Vercel (React Frontend).

---

## 📂 Project Structure

```text
smart-queue-ai/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── ai.py            # AI prediction engine logic
│   │   ├── database.py      # SQLAlchemy engine & session setup
│   │   ├── main.py          # FastAPI app, routes, CORS & WebSocket manager
│   │   ├── models.py        # Database models (Token, Counter, Service)
│   │   ├── queue.py         # Room assignment & wait time recalculation
│   │   └── schemas.py       # Pydantic validation schemas
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── requirements.txt     # Python backend dependencies
│   └── runtime.txt          # Python version (3.11.9)
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts    # Central API client & WebSocket handler
│   │   ├── components/      # React components (LandingPortal, Header, LiveQueue, etc.)
│   │   ├── types/           # TypeScript interfaces (queue.ts)
│   │   ├── App.tsx          # Main application & role routing
│   │   ├── main.tsx         # Root entrypoint with ErrorBoundary
│   │   └── styles.css       # Complete Dark Emerald Glassmorphism theme
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vercel.json          # SPA routing rewrites for Vercel
│   └── vite.config.ts
├── .gitignore               # Root gitignore excluding secrets, venvs & DB
├── render.yaml              # Render Infrastructure-as-Code deployment config
├── runtime.txt              # Root Python runtime specification
├── vercel.json              # Root Vercel build configuration
└── README.md                # Project documentation
```

---

## 🔑 Environment Variables

### Frontend Environment Variables (`frontend/.env`)
| Variable | Local Value | Production Example | Description |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | `http://127.0.0.1:8000` | `https://smart-queue-ai-backend.onrender.com` | FastAPI backend HTTP URL |
| `VITE_WS_URL` | `ws://127.0.0.1:8000/ws` | `wss://smart-queue-ai-backend.onrender.com/ws` | FastAPI WebSocket URL |

### Backend Environment Variables (`backend/.env`)
| Variable | Local Value | Production Value | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | `8000` | set by Render automatically (`$PORT`) | HTTP server port |
| `DATABASE_URL` | `sqlite:///./smart_queue.db` | `sqlite:///./smart_queue.db` (or PostgreSQL URI) | Database connection URL |
| `CORS_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | `https://*.vercel.app,*` | Allowed CORS origins for API requests |

---

## ⚡ Local Development Setup

### 1. Start the Backend Server
```bash
# Navigate to project root
cd backend

# Create virtual environment (Python 3.11 recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend API will run at `http://127.0.0.1:8000`. API docs available at `http://127.0.0.1:8000/docs`.*

---

### 2. Start the Frontend Application
```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
*Frontend application will run at `http://localhost:5173`.*

---

## 📤 Commands to Push to GitHub

Execute the following commands from your project root folder:

```bash
# 1. Initialize Git repository (if not already initialized)
git init

# 2. Stage all files (tracked files will exclude .env, node_modules, venv, .db)
git add .

# 3. Commit changes
git commit -m "Initial commit: Production-ready MedPlus Smart Queue AI"

# 4. Set main branch name
git branch -M main

# 5. Add your remote repository (replace with your repository URL)
git remote add origin https://github.com/your-username/smart-queue-ai.git

# 6. Push code to GitHub
git push -u origin main
```

---

## ☁️ Render Deployment Settings (Backend)

1. Sign in to [Render](https://render.com) and click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the following service settings:
   - **Name**: `smart-queue-ai-backend`
   - **Region**: Choose closest to your users (e.g. Oregon / Singapore)
   - **Branch**: `main`
   - **Root Directory**: Leave blank (or enter `.`)
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
4. Add **Environment Variables** in Render Dashboard:
   - `PYTHON_VERSION`: `3.11.9`
   - `CORS_ORIGINS`: `*` (or your Vercel frontend URL `https://smart-queue-ai.vercel.app`)
5. Click **Create Web Service**.
6. Copy your deployed backend URL (e.g. `https://smart-queue-ai-backend.onrender.com`).

---

## 🌐 Vercel Deployment Settings (Frontend)

1. Sign in to [Vercel](https://vercel.com) and click **Add New** -> **Project**.
2. Import your `smart-queue-ai` GitHub repository.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variables** in Vercel Project Settings:
   - `VITE_API_URL`: `https://smart-queue-ai-backend.onrender.com`
   - `VITE_WS_URL`: `wss://smart-queue-ai-backend.onrender.com/ws`
5. Click **Deploy**.
