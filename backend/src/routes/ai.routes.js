import express from 'express';
import {
  parseAndExecuteAction,
  chat,
  getGithubStats,
  configureAiKey,
  getSelfTestContestProblems,
  evaluateSelfTestCode,
  submitSelfTestContest,
  getSelfTestMcq,
  evaluateSelfTestMcq
} from '../controllers/ai.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/parse-action', protect, parseAndExecuteAction);
router.post('/chat', protect, chat);
router.get('/github-stats', protect, getGithubStats);
router.post('/configure-key', protect, configureAiKey);

// Section 4: AI Functional Self-Test & Contest Arena Endpoints
router.get('/self-test/contest-problems', protect, getSelfTestContestProblems);
router.post('/self-test/evaluate-code', protect, evaluateSelfTestCode);
router.post('/self-test/submit-contest', protect, submitSelfTestContest);
router.get('/self-test/mcq', protect, getSelfTestMcq);
router.post('/self-test/evaluate-mcq', protect, evaluateSelfTestMcq);

export default router;
