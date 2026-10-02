import express from 'express';
import {
  getReminders,
  createReminder,
  cancelReminder
} from '../controllers/reminder.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getReminders);
router.post('/', createReminder);
router.delete('/:id', cancelReminder);

export default router;
