import express from 'express';
import {
  getProblems,
  getProblem,
  updateProblemState,
  toggleBookmark,
  addProblemToTodo,
  submitCode
} from '../controllers/problem.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getProblems);
router.get('/:id', protect, getProblem);
router.put('/:id/solve', protect, updateProblemState);
router.put('/:id/bookmark', protect, toggleBookmark);
router.post('/:id/add-to-todo', protect, addProblemToTodo);
router.post('/:id/submit', protect, submitCode);

export default router;
