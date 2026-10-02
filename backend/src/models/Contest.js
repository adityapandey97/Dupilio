import { createModel } from '../config/db.js';

export const Contest = createModel('Contest', {
  title: { type: String, required: true },
  platform: {
    type: String,
    required: true,
    enum: ['leetcode', 'codeforces', 'codechef', 'hackerrank', 'atcoder', 'gfg', 'other']
  },
  externalContestId: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  durationMinutes: { type: Number, default: 120 },
  registrationUrl: { type: String, required: true },
  contestUrl: { type: String, required: true },
  status: {
    type: String,
    enum: ['upcoming', 'live', 'past'],
    default: 'upcoming'
  },
  ratingRange: { type: String, default: 'All Ratings' },
  description: { type: String, default: '' },
  lastSyncedAt: { type: String, default: () => new Date().toISOString() }
});

export default Contest;
