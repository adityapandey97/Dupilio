import express from 'express';
import {
  getContests,
  getContestById,
  syncContests
} from '../controllers/contest.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getContests);
router.post('/sync', protect, syncContests);
router.get('/:id', getContestById);

export default router;
