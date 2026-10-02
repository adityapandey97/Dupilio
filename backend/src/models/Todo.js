import { createModel } from '../config/db.js';

export const Todo = createModel('Todo', {
  userId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  dueDate: { type: String, required: true },
  category: {
    type: String,
    enum: [
      'DSA',
      'Competitive Programming',
      'Development',
      'Projects',
      'DBMS',
      'OS',
      'CN',
      'OOP',
      'System Design',
      'GitHub',
      'Career'
    ],
    default: 'DSA'
  },
  tags: { type: [String], default: [] },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: String, default: null },
  isRecurring: { type: Boolean, default: false },
  recurringInterval: {
    type: String,
    enum: ['none', 'daily', 'weekly'],
    default: 'none'
  }
});

export default Todo;
