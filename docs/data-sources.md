# DUPILIO — Data Provenance, Freshness & Synchronization

> **Brand Statement**: *One profile. Every opportunity. A smarter path to your next role.*

---

## 1. Data Freshness UX Policy (Section 11)

DUPILIO adheres to strict honesty regarding data currency. We **never** label data as "Real-time" unless backed by a live streaming WebSocket connection.

### Status Indicators Displayed in UI:
- `Live`: Connected via active WebSocket or server-sent stream.
- `Updated just now`: Synced within the last 60 seconds.
- `Updated 2 min ago`: Periodic sync succeeded recently.
- `Last successful sync 2 hours ago`: Platform temporarily unreachable or rate-limited; cached data served.
- `Temporarily unavailable`: Platform is under maintenance; error isolated without degrading the rest of the application.

---

## 2. Data Provenance Schema (Section 73)

All external data persisted in DUPILIO records origin metadata:

```javascript
{
  source: 'codeforces',
  externalId: 'cf-2275',
  sourceUrl: 'https://codeforces.com/contest/2275',
  fetchedAt: '2026-10-04T06:20:13.559Z',
  lastSyncedAt: '2026-10-04T06:30:23.841Z',
  verificationState: 'verified'
}
```

---

## 3. Background Synchronization Engine (`syncEngine.js`)

Background cron schedules manage data synchronization independently of client visits:

| Cron Cadence | Target Task | Scope |
| :--- | :--- | :--- |
| `0 */1 * * *` (Hourly) | Contest Ingestion | Fetches live contests across Codeforces, LeetCode, CodeChef, and AtCoder |
| `0 */4 * * *` (Every 4h) | Platform Handle Sync | Refreshes connected user handles that haven't synced within 4 hours |
| `*/1 * * * *` (Every min) | Reminder Dispatcher | Evaluates scheduled contest alerts (10m, 30m, 1h, 1d) and triggers notifications |
| `0 0 * * *` (Daily Midnight) | Leaderboard Recalibration | Snapshots developer scores and campus rankings |

---

## 4. Partial Failure Architecture (Section 50)

External service failures are isolated at the adapter boundary:
- If CodeChef is rate-limited or undergoes maintenance, `CodeChefAdapter` catches the error, marks `connectionStatus: 'error'`, and serves the last-known-valid cached statistics.
- The user's dashboard continues rendering LeetCode, Codeforces, GitHub, and AtCoder telemetry uninterrupted.
- An alert badge notifies the user: `"CodeChef temporarily unavailable. Showing data from 2 hours ago. [Retry]"`
