# HierPrep

<div align="center">
  <img src="frontend/public/favicon.svg" width="64" height="64" alt="HierPrep Logo" />
  <h3>Unified Developer Ecosystem, Contest Reminders & AI Self-Test Preparation Arena</h3>
  <p><strong>One profile. Real telemetry. Contest alarms. Self-test arena. Unrivaled preparation.</strong></p>
</div>

---

## 🌟 Executive Overview

**HierPrep** is an engineering intelligence and preparation platform designed for competitive programmers, collegiate developers, and software engineers. It replaces fragmented profile links with a single, consolidated developer dashboard, coordinates global contest schedules with audio buzzer alarms and calendar links, discovers flagship hackathons, and provides an **AI-driven self-test arena** with real-time Elo rating calculations and core CS placement exams.

The platform is designed with a **professional, non-AI aesthetic**—sharp typography, obsidian/slate palettes, crisp borders, and monospace code views inspired by Linear, GitHub, and Raycast.

---

## 🏛️ Comprehensive Feature Matrix (The 5 Core Sections)

### Section 1: All-Platform Combined Profile Dashboard & Side Leaderboard
- **All-Platform Problem Solved Aggregation**:
  - Live unified counter consolidating problems solved across **LeetCode, Codeforces, CodeChef, GeeksforGeeks, HackerRank, and AtCoder**.
  - Difficulty distribution metrics (Easy, Medium, Hard) with counts and percentages.
  - Per-platform telemetry cards featuring peak and current contest ratings, badges (Knight, Specialist, 3★), and contest participation.
- **Monthly Problem Solving Heatmap (All Platforms)**:
  - Interactive 365-day calendar heatmap visualizing day-by-day submission intensity across platforms.
  - Filter by platform (**All Platforms | LeetCode | Codeforces | CodeChef | GFG**).
  - Hover tooltips displaying exact dates, total solved count, and platform-specific breakdowns.
- **GitHub Page Heatmap & Developer Telemetry**:
  - Dedicated GitHub card with public handle, avatar, and active commit streak.
  - 52-week green contribution activity grid.
  - Summary metrics: Repositories, Yearly Commits, Pull Requests, Issues, and Stars.
  - Language breakdown bar (TypeScript, JavaScript, Python, C++, HTML/CSS) with percentages.
  - Top public repositories with direct external GitHub links.
- **Side Leaderboard (Global, College, Country)**:
  - Integrated, dockable sidebar widget providing instant rankings across **Global, College, and Country** scopes.
  - Live search filter and rank badges (#1 Gold, #2 Silver, #3 Bronze).
  - Displays user's real standing relative to collegiate and country peers.

---

### Section 2: Upcoming Contest Reminders & Alarm Buzzer System
- **All-Platform Aggregated Contests**:
  - Ingests official contest schedules from **LeetCode, Codeforces, CodeChef, and AtCoder**.
  - Real-time countdown clock (days, hours, minutes, seconds) ticking every second.
- **Direct Register Link**:
  - Instant one-click external button (`target="_blank"`) navigating to the authentic platform registration page.
- **Contest Alarm & Reminder System**:
  - **Web Audio API Synthesizer Buzzer**: Real browser audio chime/alarm that rings at 5m, 15m, 30m, or 60m before round kickoff.
  - **"Test Alarm Buzzer" Tool**: One-click audio test button in the UI allowing developers to test their speaker volume and verify audio permissions.
  - **1-Click Google Calendar Generator**: Opens Google Calendar pre-filled with the contest title, start/end timestamps, and registration URL.
  - **Download .ICS File**: Generates and downloads standard iCalendar files compatible with Apple Calendar, Outlook, and Thunderbird.
  - **Automated Call Alert Simulation**: Schedule simulated voice reminders prior to contest start.
  - **Active Armed Alarms Drawer**: Track and manage all armed alarms with live countdowns.

---

### Section 3: Events & Hackathons Hub
- **Curated Tech Competitions & Grants**:
  - Flagship hackathons, open source programs, and hiring challenges from **Unstop, Devpost, MLH, Devfolio, and AICTE**.
  - Coverage includes: *Smart India Hackathon (SIH), Google Summer of Code (GSoC), Amazon ML Summer School, Flipkart GRiD, and LFX Mentorship*.
- **Comprehensive Filters**:
  - Filter by type: *Hackathons, Hiring Challenges, Open Source Programs, Workshops, Tech Summits*.
  - Filter by location: *Online/Virtual, All India, Bengaluru, Delhi NCR, Hyderabad*.
- **Event Telemetry**:
  - Prize pool displays (e.g. ₹1,00,000 / $3,000).
  - Registration deadline countdowns.
  - Eligibility and team requirements.
  - Deterministic skill-match compatibility score based on connected profile languages.
  - One-click **"Apply Now"** and **"Add to Todo Planner"** buttons.

---

### Section 4: AI Functional Self-Test & Contest Arena
A comprehensive, real-time testing platform featuring two major tracks:

#### A. 4-Problem Algorithmic Coding Contest (Rated Simulation)
- **4 Dynamic Algorithmic Problems**:
  - **Problem 1 (Easy - 100 pts)**: Arrays, Hash Map, Target Difference Pairs.
  - **Problem 2 (Medium - 200 pts)**: Sliding Window, At Most K Distinct Subarray.
  - **Problem 3 (Medium-Hard - 300 pts)**: Graph, Shortest Path / Dijkstra in Grid.
  - **Problem 4 (Hard - 400 pts)**: Advanced Dynamic Programming / Binary Search on Answer.
- **Contest Timing & Rules**:
  - 90-minute live countdown timer with pause/finish controls.
  - ICPC scoring rule: 5 minutes penalty per rejected submission.
- **Code Editor & Multi-Language Support**:
  - Clean monospace code editor with starter boilerplates for **JavaScript (Node.js), Python 3, C++ (g++ 20), and Java (OpenJDK 17)**.
  - Detailed problem statements, boundary constraints, and input/output examples with explanations.
- **AI Automated Judge Engine**:
  - Analyzes code syntax, correctness against edge cases, and asymptotic complexity.
  - Outputs verdict: `Accepted`, `Wrong Answer (WA)`, `Time Limit Exceeded (TLE)`, or `Compile Error`.
  - Reports asymptotic Time Complexity \(O(...)\), Space Complexity \(O(...)\), execution time in ms, and peak memory.
- **Official Elo/Glicko Contest Rating Calculation**:
  - Calculates Performance Rating based on problems solved, time elapsed, and penalties.
  - Computes **Rating Delta** (\(\Delta = \pm\text{rating}\)) and updates profile rating.
  - Generates comprehensive **Contest Standings & Performance Scorecard** with Global Rank and percentile.

#### B. Dynamic MCQ Placement Contests
- **Track 1: CS Core Fundamentals**:
  - **Operating Systems (OS)**: Priority Inversion, Belady's Anomaly, Coffman's Deadlock Conditions, Paging.
  - **Database Management Systems (DBMS)**: BCNF, ACID Properties, Transaction Isolation Levels, Multi-valued Dependencies.
  - **SQL**: Window Functions (`DENSE_RANK()`, `RANK()`, `ROW_NUMBER()`), Complex Joins, Group By, Subqueries.
  - **Computer Networks (CN)**: TCP 4-way termination (`TIME_WAIT`, 2MSL), Subnetting & CIDR calculations, OSI Layers.
  - **Object-Oriented Programming (OOPs)**: Virtual Method Tables (vtable/vptr), Dynamic Polymorphism, SOLID principles (OCP, LSP, DIP).
- **Track 2: General Placement Aptitude**:
  - **Quantitative Aptitude**: Time & Work, Speed-Distance-Time, Probability, Profit & Loss.
  - **Logical Reasoning**: Blood Relations, Alphanumeric Series, Direction Sense Tests, Syllogisms.
- **Instant AI Review & Step-by-Step Solutions**:
  - Real-time scoring, percentage, and percentile rankings.
  - Subject-by-subject accuracy breakdown bars (OS, DBMS, SQL, CN, OOPs).
  - Detailed step-by-step explanations and derivations for every question.

---

### Section 5: Tech Discussions & Community
- **Developer Discussions**:
  - Categorized forums: *Competitive Programming, DSA, Hackathons, Interview Experiences, System Design, Development*.
  - Full support for formatted code blocks, Markdown, and problem references.
- **Interactive Community Actions**:
  - Upvote and downvote counters.
  - Nested comment threads and discussions.
  - Keyword and tag search.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, React Router 7, Axios, Lucide Icons, Recharts, TanStack Query |
| **Backend** | Node.js (ES Modules), Express, Socket.io, JWT, bcryptjs, node-cron, Winston |
| **Database** | MongoDB with Mongoose + Autonomous File-Based JSON Sandbox Fallback (`backend/db_sandbox/`) |
| **AI Engine** | Google Gemini API (`@google/genai`) + High-Precision Deterministic Code Judge & Evaluation Fallback |
| **Audio Alert** | HTML5 Web Audio API Synthesizer (Zero external audio asset dependencies) |

---

## ⚡ Manual Setup & Running Guide

HierPrep is engineered for **zero-friction setup**. It can run with or without a live MongoDB instance thanks to its integrated JSON sandbox database fallback.

### Prerequisites
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm**: v9.0.0 or higher (packaged with Node.js)
- **Git**: Installed and available in PATH

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/hierprep.git
cd Hierprep
```

---

### Step 2: Install Dependencies
Run the unified install script to install dependencies across the root, frontend, and backend packages:
```bash
npm run install-all
```
*Alternatively, install manually in each folder:*
```bash
npm install
npm install --prefix frontend
npm install --prefix backend
```

---

### Step 3: Configure Environment Variables

1. **Backend Environment**:
   Copy `.env.example` in `backend/` to `backend/.env`:
   ```bash
   # Windows PowerShell:
   Copy-Item backend/.env.example backend/.env

   # Linux / macOS:
   cp backend/.env.example backend/.env
   ```
   *Key environment settings:*
   ```ini
   PORT=5000
   JWT_SECRET=hierprep_super_secure_jwt_secret_key_2026
   # MONGODB_URI is optional. If omitted or unreachable, backend automatically falls back to backend/db_sandbox/
   # MONGODB_URI=mongodb://localhost:27017/hierprep
   # Optional: Google Gemini API Key for dynamic AI generation
   # GEMINI_API_KEY=your_gemini_api_key_here
   ```

2. **Frontend Environment**:
   Frontend automatically defaults to `http://localhost:5000/api/v1`. To override, create `frontend/.env`:
   ```ini
   VITE_API_URL=http://localhost:5000/api/v1
   ```

---

### Step 4: Run Automated Verification Tests
Run the comprehensive 10-suite backend test runner:
```bash
npm test
```
*Output preview:*
```
🚀 Running Unit & Functional Test Suite for HierPrep Controllers...
1. Dashboard Controller: Success, 365 Monthly Heatmap Days, GitHub Telemetry verified
2. Leaderboard: Global, College, and Country verified
3. Contests Controller: 15 official contests verified
4. Events Controller: Hackathons verified
5. Section 4 - 4-Problem Contest: 4 problems verified
6. Section 4 - AI Code Evaluation: Accepted verdict verified
7. Section 4 - Contest Submission & Rating Delta: Elo calculation verified (+70 pts)
8. Section 4 - MCQ Generation: 10 Core CS & 8 Aptitude questions verified
9. Section 4 - MCQ Evaluation: Score & Subject Breakdown verified
10. Section 5 - Discussions Controller: Verified
🌟 100% OF TESTS PASSED WITH ZERO FAILURES!
```

---

### Step 5: Start Frontend and Backend Concurrently
Run both servers simultaneously with one command:
```bash
npm run dev
```

*Or start them in separate terminals:*
```bash
# Terminal 1 - Backend API Server (Port 5000):
npm run start-backend

# Terminal 2 - Frontend Development Server (Port 5173):
npm run dev --prefix frontend
```

---

### Step 6: Access the Application
Open your browser and navigate to:
- **HierPrep Web App**: [`http://localhost:5173`](http://localhost:5173)
- **Backend API Root**: [`http://localhost:5000/api/v1`](http://localhost:5000/api/v1)
- **API Healthcheck**: [`http://localhost:5000/health`](http://localhost:5000/health)

---

## 🔒 Zero-Configuration Local Database Sandbox

HierPrep comes with an autonomous **Database Sandbox adapter** located in [`backend/db_sandbox/`](file:///c:/Users/honey/Desktop/Hierprep/backend/db_sandbox/). 
- When `MONGODB_URI` is not provided or MongoDB is offline, HierPrep seamlessly reads and writes local file-backed JSON stores.
- Pre-seeded with authentic developer profiles, Codeforces/LeetCode/CodeChef contest schedules, hackathons, and sample discussions.
- **Zero setup friction**: Developers can run and evaluate all platform features without setting up local database services or Docker containers!

---

## 🧪 Production Build

To produce an optimized production build for deployment:
```bash
npm run build-frontend
```
The compiled assets will be generated in `frontend/dist/`.

---

## 📄 License & Attribution

HierPrep is built as an open developer ecosystem. Licensed under the MIT License.
Built with precision engineering for student developers, competitive coders, and software engineers worldwide.
