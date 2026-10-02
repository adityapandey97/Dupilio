import { createModel } from '../config/db.js';

export const Problem = createModel('Problem', {
  title: { type: String, required: true },
  difficulty: { type: String, required: true, enum: ['Easy', 'Medium', 'Hard'] },
  topic: { type: String, required: true },
  description: { type: String, required: true },
  constraints: { type: [String], default: [] },
  examples: [
    {
      input: { type: String, required: true },
      output: { type: String, required: true },
      explanation: { type: String }
    }
  ],
  starterCode: {
    javascript: { type: String },
    python: { type: String },
    cpp: { type: String },
    java: { type: String }
  },
  isSolved: { type: Boolean, default: false },
  platform: { type: String, default: 'LeetCode' },
  externalUrl: { type: String, default: '' },
  companyTags: { type: [String], default: [] },
  acceptanceRate: { type: Number, default: 58 }
});

export default Problem;
