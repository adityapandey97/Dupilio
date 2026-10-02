import express from 'express';
import {
  parseAndExecuteAction,
  chat,
  getGithubStats,
  configureAiKey
} from '../controllers/ai.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/parse-action', protect, parseAndExecuteAction);
router.post('/chat', protect, chat);
router.get('/github-stats', protect, getGithubStats);
router.post('/configure-key', protect, configureAiKey);

export default router;
