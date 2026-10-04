import { createModel } from '../config/db.js';

export const Opportunity = createModel('Opportunity', {
  title: { type: String, required: true },
  company: { type: String, required: true },
  type: {
    type: String,
    enum: ['job', 'internship'],
    default: 'job'
  },
  role: { type: String, default: 'Software Development Engineer' },
  experienceLevel: {
    type: String,
    enum: ['Internship', 'Entry Level', 'Associate', 'Mid-Level'],
    default: 'Entry Level'
  },
  location: { type: String, default: 'Remote / India' },
  isRemote: { type: Boolean, default: true },
  skills: { type: [String], default: [] },
  description: { type: String, default: '' },
  applyUrl: { type: String, required: true },
  source: { type: String, default: 'Direct Company Career Portal' },
  salary: { type: String, default: 'Competitive Market Standard' },
  deadline: { type: String, default: '' },
  lastSyncedAt: { type: String, default: () => new Date().toISOString() }
});

export default Opportunity;
