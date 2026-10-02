import { createModel } from '../config/db.js';

export const Job = createModel('Job', {
  userId: { type: String, required: true },
  company: { type: String, required: true },
  role: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ['Applied', 'OA', 'Interview', 'Selected', 'Rejected'],
    default: 'Applied'
  },
  salary: { type: String, default: '' },
  appliedDate: { type: String, required: true },
  notes: { type: String, default: '' }
});

export default Job;
