import { createModel } from '../config/db.js';

export const Reminder = createModel('Reminder', {
  userId: { type: String, required: true },
  type: {
    type: String,
    enum: ['contest', 'event', 'todo', 'custom'],
    default: 'contest'
  },
  referenceId: { type: String, default: '' },
  referenceModel: { type: String, default: 'Contest' },
  title: { type: String, required: true },
  message: { type: String, default: '' },
  scheduledAt: { type: String, required: true },
  leadTimeMinutes: { type: Number, default: 30 },
  channel: {
    type: String,
    enum: ['browser', 'email', 'voice'],
    default: 'browser'
  },
  status: {
    type: String,
    enum: ['pending', 'triggered', 'cancelled'],
    default: 'pending'
  },
  triggeredAt: { type: String, default: null },
  metadata: { type: Object, default: {} }
});

export default Reminder;
