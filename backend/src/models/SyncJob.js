import { createModel } from '../config/db.js';

export const SyncJob = createModel('SyncJob', {
  jobType: {
    type: String,
    required: true,
    enum: ['contests', 'events', 'profiles', 'reminders', 'leaderboard']
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed'],
    default: 'completed'
  },
  startedAt: { type: String, default: () => new Date().toISOString() },
  completedAt: { type: String, default: () => new Date().toISOString() },
  itemsProcessed: { type: Number, default: 0 },
  retryCount: { type: Number, default: 0 },
  error: { type: String, default: null }
});

export default SyncJob;
