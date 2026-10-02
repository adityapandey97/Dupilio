import { createModel } from '../config/db.js';

export const Discussion = createModel('Discussion', {
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: {
    userId: { type: String, default: '' },
    name: { type: String, default: 'Developer' },
    email: { type: String, default: '' },
    avatar: { type: String, default: '' },
    college: { type: String, default: '' }
  },
  category: {
    type: String,
    enum: [
      'DSA',
      'Competitive Programming',
      'Placements',
      'Development',
      'Hackathons',
      'Projects',
      'Career',
      'General'
    ],
    default: 'General'
  },
  company: { type: String, default: 'General' },
  tags: { type: [String], default: [] },
  upvotes: { type: Number, default: 0 },
  upvotedBy: { type: [String], default: [] },
  views: { type: Number, default: 0 },
  bookmarksCount: { type: Number, default: 0 },
  bookmarkedBy: { type: [String], default: [] },
  reportsCount: { type: Number, default: 0 },
  comments: { type: Array, default: [] },
  aiSummary: { type: String, default: '' }
});

export default Discussion;
