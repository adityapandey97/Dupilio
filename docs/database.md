# DUPILIO Database Schema & Data Models

DUPILIO supports both MongoDB via Mongoose and an autonomous local JSON file sandbox (`backend/db_sandbox/`). The schemas below define the authoritative contracts.

---

## 1. User Model (`User.js`)
Stores coder authentication, academic background, privacy preferences, and cached 6D developer score.

```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  college: { type: String, default: 'National Institute of Technology' },
  department: { type: String, default: 'Computer Science & Engineering' },
  batch: { type: String, default: '2026' },
  bio: { type: String, default: '' },
  avatar: { type: String, default: '' },
  privacySettings: {
    profileVisibility: { type: String, enum: ['public', 'campus_only', 'private'], default: 'public' },
    showInLeaderboard: { type: Boolean, default: true },
    showPlatforms: { type: Boolean, default: true }
  },
  developerScore: {
    overall: { type: Number, default: 0 },
    dimensions: {
      competitiveProgramming: { type: Number, default: 0 },
      dsaProblemSolving: { type: Number, default: 0 },
      openSourceProjects: { type: Number, default: 0 },
      hackathons: { type: Number, default: 0 },
      consistency: { type: Number, default: 0 },
      coreCS: { type: Number, default: 0 }
    },
    lastCalculatedAt: { type: String, default: null }
  }
}
```

---

## 2. Platform Profile (`PlatformProfile.js`)
Normalizes connected third-party coding accounts without credentials.

```javascript
{
  userId: { type: String, required: true },
  platform: {
    type: String,
    enum: ['leetcode', 'codeforces', 'codechef', 'hackerrank', 'gfg', 'atcoder', 'github'],
    required: true
  },
  username: { type: String, required: true },
  isConnected: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  maxRating: { type: Number, default: 0 },
  rank: { type: String, default: 'N/A' },
  solved: { type: Number, default: 0 },
  solvedEasy: { type: Number, default: 0 },
  solvedMedium: { type: Number, default: 0 },
  solvedHard: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  contestsAttended: { type: Number, default: 0 },
  rawStats: { type: Object, default: {} },
  lastSyncedAt: { type: String, default: null }
}
```

---

## 3. Contest Model (`Contest.js`)
Aggregates CP contests across 7 platforms with external registration redirection.

```javascript
{
  title: { type: String, required: true },
  platform: {
    type: String,
    enum: ['leetcode', 'codeforces', 'codechef', 'atcoder', 'hackerrank', 'gfg', 'other'],
    required: true
  },
  externalContestId: { type: String, required: true },
  url: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  durationSeconds: { type: Number, required: true },
  status: { type: String, enum: ['upcoming', 'live', 'past'], default: 'upcoming' },
  difficulty: { type: String, enum: ['All Ratings', 'Div 1', 'Div 2', 'Div 3', 'Div 4', 'Beginner'], default: 'All Ratings' },
  phase: { type: String, default: 'BEFORE' }
}
```

---

## 4. Event Model (`Event.js`)
Tracks campus hackathons, hiring challenges, and open-source programs.

```javascript
{
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ['Hackathon', 'Hiring Challenge', 'Open Source', 'Workshop', 'Coding Contest'],
    required: true
  },
  organizer: { type: String, required: true },
  bannerImage: { type: String, default: '' },
  description: { type: String, default: '' },
  registrationDeadline: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  externalUrl: { type: String, required: true },
  prizes: { type: String, default: 'Cash Prizes & Certificates' },
  location: { type: String, default: 'Online' },
  tags: { type: [String], default: [] }
}
```

---

## 5. Todo Model (`Todo.js`)
Comprehensive daily task planner across 11 Dupilio categories.

```javascript
{
  userId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  dueDate: { type: String, required: true },
  category: {
    type: String,
    enum: ['DSA', 'Competitive Programming', 'Development', 'Projects', 'DBMS', 'OS', 'CN', 'OOP', 'System Design', 'GitHub', 'Career'],
    default: 'DSA'
  },
  tags: { type: [String], default: [] },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: String, default: null },
  isRecurring: { type: Boolean, default: false },
  recurringInterval: { type: String, enum: ['none', 'daily', 'weekly'], default: 'none' }
}
```

---

## 6. Reminder Model (`Reminder.js`)
Multi-channel contest and event alert scheduling.

```javascript
{
  userId: { type: String, required: true },
  type: { type: String, enum: ['contest', 'event', 'custom'], required: true },
  referenceId: { type: String, default: null },
  referenceModel: { type: String, default: null },
  title: { type: String, required: true },
  targetTime: { type: String, required: true },
  leadTimeMinutes: { type: Number, default: 30 },
  scheduledAlertTime: { type: String, required: true },
  channel: { type: String, enum: ['browser', 'email', 'voice'], default: 'browser' },
  status: { type: String, enum: ['pending', 'triggered', 'cancelled'], default: 'pending' },
  triggeredAt: { type: String, default: null }
}
```

---

## 7. Problem & Progress Models (`Problem.js`, `ProblemProgress.js`)
Curated DSA problems with per-user tracking.

```javascript
// Problem
{
  title: { type: String, required: true },
  platform: { type: String, enum: ['leetcode', 'codeforces', 'gfg', 'hackerrank', 'dupilio'], default: 'dupilio' },
  externalUrl: { type: String, default: '' },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  topic: { type: String, required: true },
  acceptanceRate: { type: String, default: '55%' },
  companies: { type: [String], default: [] }
}

// ProblemProgress
{
  userId: { type: String, required: true },
  problemId: { type: String, required: true },
  isSolved: { type: Boolean, default: false },
  isBookmarked: { type: Boolean, default: false },
  solvedAt: { type: String, default: null }
}
```

---

## 8. Discussion Model (`Discussion.js`)
Community thread with upvoting, bookmarking, and AI key takeaway summaries.

```javascript
{
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: {
    userId: { type: String },
    name: { type: String, default: 'Anonymous' },
    college: { type: String, default: '' }
  },
  category: {
    type: String,
    enum: ['Competitive Programming', 'DSA', 'Hackathons', 'Development', 'Interview Experience', 'System Design', 'General'],
    default: 'General'
  },
  tags: { type: [String], default: [] },
  upvotes: { type: Number, default: 0 },
  upvotedBy: { type: [String], default: [] },
  bookmarksCount: { type: Number, default: 0 },
  bookmarkedBy: { type: [String], default: [] },
  views: { type: Number, default: 0 },
  aiSummary: { type: String, default: '' },
  comments: { type: Array, default: [] }
}
```
