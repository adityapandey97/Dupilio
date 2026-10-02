import { createModel } from '../config/db.js';

export const User = createModel('User', {
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  college: { type: String, default: 'National Institute of Technology' },
  department: { type: String, default: 'Computer Science & Engineering' },
  batch: { type: String, default: '2026' },
  bio: { type: String, default: 'Passionate developer & competitive programmer.' },
  privacySettings: {
    profileVisibility: { type: String, enum: ['public', 'college', 'private'], default: 'public' },
    showRank: { type: Boolean, default: true },
    showStats: { type: Boolean, default: true },
    showEmail: { type: Boolean, default: false }
  },
  developerScore: {
    overall: { type: Number, default: 72 },
    dimensions: {
      problemSolving: { type: Number, default: 75 },
      competitiveProgramming: { type: Number, default: 68 },
      consistency: { type: Number, default: 70 },
      contestParticipation: { type: Number, default: 64 },
      gitHubActivity: { type: Number, default: 78 },
      projectActivity: { type: Number, default: 74 }
    },
    calculatedAt: { type: String, default: () => new Date().toISOString() }
  },
  profile: {
    role: { type: String, default: 'Software Engineer' },
    skills: { type: [String], default: ['DSA', 'React', 'JavaScript', 'Node.js', 'C++'] },
    education: { type: String, default: 'B.Tech Computer Science' },
    achievements: { type: String, default: 'Dupilio Pioneer Candidate' },
    codingProfiles: {
      leetcode: { type: String, default: '' },
      codeforces: { type: String, default: '' },
      codechef: { type: String, default: '' },
      hackerrank: { type: String, default: '' },
      gfg: { type: String, default: '' },
      atcoder: { type: String, default: '' },
      github: { type: String, default: '' }
    },
    codingStats: {
      leetcodeSolved: { type: Number, default: 0 },
      codeforcesSolved: { type: Number, default: 0 },
      codechefSolved: { type: Number, default: 0 },
      hackerrankSolved: { type: Number, default: 0 },
      gfgSolved: { type: Number, default: 0 },
      atcoderSolved: { type: Number, default: 0 },
      completedTopics: { type: [String], default: [] }
    },
    developerDna: {
      languages: { type: Array, default: [] },
      detectedTechStack: { type: [String], default: [] },
      velocityScore: { type: Number, default: 74 },
      commitStreakDays: { type: Number, default: 14 },
      totalStars: { type: Number, default: 0 },
      topRepositories: { type: Array, default: [] }
    },
    gapAnalysis: {
      topicMastery: { type: Array, default: [] },
      weakTopics: { type: Array, default: [] },
      fallPoints: { type: Array, default: [] },
      recommendedProblemSets: { type: Array, default: [] },
      placementReadinessIndex: { type: Number, default: 72 },
      summary: { type: String, default: '' },
      lastAnalyzedAt: { type: String, default: '' }
    }
  }
});

export default User;
