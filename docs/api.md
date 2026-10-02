# DUPILIO REST API Specification

Base URL: `http://localhost:5000/api/v1` (also accessible via `/api`)

Authentication: Bearer Token in `Authorization: Bearer <jwt_token>` header.

---

## 1. Authentication & User Profile

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register new coder with name, email, password, college, dept, batch |
| `POST` | `/auth/login` | Authenticate and obtain JWT token |
| `POST` | `/auth/logout` | Invalidate session |
| `GET` | `/users/me` | Fetch authenticated user profile & Dupilio score |
| `PUT` | `/users/profile` | Update academic information, bio, and privacy settings |

---

## 2. Dashboard & Platform Integrations

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/dashboard` | Aggregated dashboard: overall score, 6 dimensions, contest reminders, platform summaries |
| `GET` | `/platforms/supported` | List of supported platforms (LeetCode, Codeforces, CodeChef, HackerRank, GFG, AtCoder, GitHub) |
| `GET` | `/platforms` | Get all connected platform profiles for current user |
| `POST` | `/platforms/connect` | Connect public username for a platform (Zero credentials required) |
| `POST` | `/platforms/:platform/sync` | Force real-time sync for a specific platform adapter |
| `POST` | `/platforms/sync-all` | Sync all connected platforms and recalculate Dupilio Developer Score |
| `DELETE` | `/platforms/:platform` | Disconnect platform profile |

---

## 3. Contests & Hackathon Hub

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/contests` | Filter contests by `status` (upcoming/live/past), `platform`, `search` |
| `GET` | `/contests/:id` | Get contest details |
| `POST` | `/contests/sync` | Ingest upcoming contests from external APIs (Codeforces, etc.) |
| `GET` | `/events` | Filter hackathons & events by `type`, `location`, `search` |
| `GET` | `/events/:id` | Get event details |

---

## 4. Problems & Preparation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/problems` | Query problems by `topic`, `difficulty`, `search` |
| `GET` | `/problems/:id` | Get problem details |
| `PUT` | `/problems/:id/solve` | Toggle solved status (`isSolved: true/false`) |
| `PUT` | `/problems/:id/bookmark` | Toggle problem bookmark |
| `POST` | `/problems/:id/add-to-todo` | Create a todo task linked to this problem |
| `GET` | `/preparation` | Get diagnostic domain mastery and identified weak areas |
| `GET` | `/preparation/recommendations` | Get personalized problem suggestions targeting priority gaps |

---

## 5. Todo Planner & Reminders

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/todos` | Query tasks by `view` (today/upcoming/overdue/completed), `category`, `priority` |
| `POST` | `/todos` | Create a new preparation task |
| `PUT` | `/todos/:id` | Update task details |
| `PUT` | `/todos/:id/toggle` | Toggle task completion |
| `DELETE` | `/todos/:id` | Delete task |
| `GET` | `/reminders` | List scheduled contest/event reminders |
| `POST` | `/reminders` | Schedule reminder (`channel: browser/email/voice`, `leadTimeMinutes: 30`) |
| `DELETE` | `/reminders/:id` | Cancel reminder |

---

## 6. Leaderboard & Community Discussions

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/leaderboard` | Query rankings by `scope` (global/college/department/batch) & `search` |
| `GET` | `/discussions` | Query discussion threads by `category`, `sortBy` (trending/newest), `search` |
| `POST` | `/discussions` | Publish new discussion post |
| `POST` | `/discussions/:id/upvote` | Toggle upvote on discussion post |
| `POST` | `/discussions/:id/bookmark` | Toggle bookmark on discussion post |
| `POST` | `/discussions/:id/comment` | Add comment to discussion thread |
| `DELETE` | `/discussions/:id` | Remove discussion post (Author or Admin) |

---

## 7. AI Assistant & Voice Copilot

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/ai/parse-action` | Natural language command parser -> executes verified backend mutations |
| `POST` | `/ai/chat` | Conversational developer copilot chat |
| `POST` | `/ai/configure-key` | Set/verify Gemini API key for session |
