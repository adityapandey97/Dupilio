import { createModel } from '../config/db.js';

export const ProblemProgress = createModel('ProblemProgress', {
  userId: { type: String, required: true },
  problemId: { type: String, required: true },
  isSolved: { type: Boolean, default: false },
  isBookmarked: { type: Boolean, default: false },
  solvedAt: { type: String, default: null },
  notes: { type: String, default: '' },
  addedToTodo: { type: Boolean, default: false }
});

export default ProblemProgress;
