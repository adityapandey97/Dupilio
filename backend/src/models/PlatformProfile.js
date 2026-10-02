import { createModel } from '../config/db.js';

export const PlatformProfile = createModel('PlatformProfile', {
  userId: { type: String, required: true },
  platform: {
    type: String,
    required: true,
    enum: ['leetcode', 'codeforces', 'codechef', 'hackerrank', 'gfg', 'atcoder', 'github']
  },
  username: { type: String, required: true },
  profileUrl: { type: String, default: '' },
  connectionStatus: {
    type: String,
    enum: ['connected', 'syncing', 'error', 'disconnected'],
    default: 'connected'
  },
  lastSyncedAt: { type: String, default: () => new Date().toISOString() },
  rating: { type: Number, default: 0 },
  rank: { type: String, default: 'Unranked' },
  solved: { type: Number, default: 0 },
  contests: { type: Number, default: 0 },
  badges: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  recentActivity: { type: Array, default: [] },
  difficultyBreakdown: {
    easy: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    hard: { type: Number, default: 0 }
  },
  rawStats: { type: Object, default: {} },
  visibility: { type: String, enum: ['public', 'college', 'private'], default: 'public' }
});

export default PlatformProfile;
