import { createModel } from '../config/db.js';

export const Event = createModel('Event', {
  title: { type: String, required: true },
  company: { type: String, required: true },
  type: {
    type: String,
    enum: ['Hackathon', 'Hiring Challenge', 'Coding Contest', 'Workshop', 'Open Source', 'Tech Summit'],
    default: 'Hackathon'
  },
  description: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  registrationDeadline: { type: String, required: true },
  eligibility: { type: String, default: 'Open to All' },
  location: { type: String, default: 'Online' },
  registrationUrl: { type: String, required: true },
  source: { type: String, default: 'Official Platform' },
  tags: { type: [String], default: [] },
  prizePool: { type: String, default: 'Prizes & Recognition' },
  lastSyncedAt: { type: String, default: () => new Date().toISOString() }
});

export default Event;
