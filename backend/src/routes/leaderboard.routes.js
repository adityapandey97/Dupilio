import express from 'express';
import { getLeaderboard } from '../controllers/leaderboard.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getLeaderboard);

export default router;
