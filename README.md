# DUPILIO

> **Your complete developer profile, preparation, and opportunity hub.**

DUPILIO is a unified platform for competitive programmers, open-source contributors, student developers, and hackathon participants. It aggregates your performance across multiple coding platforms into a single, transparent **Dupilio Developer Score**, coordinates contest schedules, pinpoints DSA weak areas, and drives structured daily preparation.

---

## 🌟 Key Highlights & Core Features

### 1. 🪪 Unified Developer Profile
- **Multi-Platform Adapter Architecture**: Seamlessly connect your handles for **LeetCode, Codeforces, CodeChef, HackerRank, GeeksforGeeks, AtCoder**, and **GitHub**.
- **Zero-Credential Security**: DUPILIO operates on public handles and verified platform APIs. No third-party passwords or sensitive credentials are ever collected or stored.
- **Auto-Sync & Recalibration**: Sync handles individually or all at once to fetch live ratings, max rating, problem counts, and commit stats.

### 2. 📊 Transparent Dupilio Developer Score (0–100)
Explainable 6-dimensional scoring methodology:
- **Competitive Programming (25%)**: Normalized rating scale across Codeforces, LeetCode, and CodeChef.
- **DSA & Problem Solving (20%)**: Volume and difficulty weights (Easy = 1pt, Med = 3pt, Hard = 6pt).
- **Open Source & Projects (15%)**: GitHub repositories, total stars, and activity metrics.
- **Hackathons & Challenges (15%)**: Verified hackathons, campus challenges, and open-source programs.
- **Consistency & Streaks (15%)**: Daily problem-solving streaks and active contest cadence.
- **Core CS Fundamentals (10%)**: Domain mastery across OS, DBMS, Networks, and System Design.

### 3. ⚔️ CP Contest Hub & Reminders
- Aggregates upcoming, live, and past contests from LeetCode, Codeforces, CodeChef, and AtCoder.
- **Direct Official Redirect**: One-click redirect to authentic external registration pages.
- **Lead-Time Reminders**: Schedule automated alerts (30 minutes, 1 hour) across browser push, email digest, or the voice engine.

### 4. 🚀 Events & Hackathons Hub
- Curated discovery for major student competitions (Smart India Hackathon, Google Summer of Code, Flipkart GRiD, LFX Mentorship, ICPC, and MLH Fellowships).
- Filters for Online vs In-Person, registration deadlines, and prize pools.

### 5. 🧩 Problem Hub & DSA Tracker
- Filter by topic (Graphs, Trees, DP, Greedy, Binary Search, Sliding Window) and difficulty.
- Per-user solved toggle, bookmarks, and one-click **"Add to Todo Planner"** integration.

### 6. 🎯 AI Preparation & Weak-Area Detection
- Diagnostic domain breakdown identifies your highest-priority growth areas.
- Generates curated practice lists tailored to bridge specific rating thresholds.

### 7. 📋 Personal Todo Planner
- 11 specialized categories: *DSA, Competitive Programming, Development, Projects, DBMS, OS, CN, OOP, System Design, GitHub, Career*.
- Filter by Today, Upcoming, Overdue, or Completed tasks. Supports daily and weekly recurrence.

### 8. 🏆 Global & Campus Leaderboards
- Compare rankings across **Global, College, Department, and Batch** scopes.
- Interactive top-3 podium and real-time candidate search.

### 9. 💬 Community Discussions
- Collaborative knowledge exchange for contest editorials, open-source stipends, and algorithmic optimization.
- Features community upvotes, bookmarks, and AI key takeaway summaries.

### 10. 🤖 AI Copilot & Voice Provider
- Natural language command execution: say or type *"Remind me 30 minutes before Codeforces"* or *"Create a task to practice 3 DP problems tomorrow"*.
- Supported by a pluggable audio engine (`VoiceProvider.js` / `MockVoiceProvider.js`).

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, React Router 7, Axios, Lucide Icons, Recharts, TanStack Query.
- **Backend**: Node.js, Express, Socket.io, JWT, bcryptjs, node-cron, Winston.
- **Database**: MongoDB with Mongoose + Autonomous Local JSON Sandbox fallback (`backend/db_sandbox/`).
- **AI Microservice**: Python FastAPI (Port 8000), Pandas, NumPy for intent extraction and data diagnostics.

For detailed architecture diagrams and schema definitions, see:
- [System Architecture](file:///c:/Users/honey/Desktop/Hierprep/docs/architecture.md)
- [Database Schema Contract](file:///c:/Users/honey/Desktop/Hierprep/docs/database.md)
- [REST API Documentation](file:///c:/Users/honey/Desktop/Hierprep/docs/api.md)

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **Python** (v3.10 or higher, optional for FastAPI AI engine)

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in both root and backend directories:
```bash
cp backend/.env.example backend/.env
```
*(By default, Dupilio works out of the box with the local file sandbox if MongoDB is not running).*

### 3. Run the Development Suite
Run frontend and backend simultaneously:
```bash
npm run dev
```

- **Frontend UI**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api/v1`
- **API Healthcheck**: `http://localhost:5000/health`

### 4. Optional: Run Python AI Microservice
```bash
cd ai_engine
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

---

## 🔒 Security & Privacy

- Third-party accounts connect via public usernames only.
- Users can switch profile visibility between **Public**, **Campus Only**, and **Private** at any time.
- Leaderboard opt-out settings can be managed directly in the Settings module.

---

## 📄 License
MIT License. Built for the developer community.
