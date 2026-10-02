import express from 'express';
import {
  getTodos,
  createTodo,
  updateTodo,
  toggleComplete,
  deleteTodo
} from '../controllers/todo.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getTodos);
router.post('/', createTodo);
router.put('/:id', updateTodo);
router.put('/:id/toggle', toggleComplete);
router.delete('/:id', deleteTodo);

export default router;
