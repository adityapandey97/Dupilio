import { createModel } from '../config/db.js';

export const Resume = createModel('Resume', {
  userId: { type: String, required: true },
  fileName: { type: String, required: true },
  fileUrl: { type: String, default: '' },
  atsScore: { type: Number, default: 0 },
  skills: { type: Number, default: 0 },
  experience: { type: Number, default: 0 },
  projects: { type: Number, default: 0 },
  keywords: { type: Number, default: 0 },
  formatting: { type: Number, default: 0 },
  missingSkills: { type: [String], default: [] },
  suggestions: { type: [String], default: [] }
});

export default Resume;
