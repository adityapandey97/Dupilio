import express from 'express';
import { getInterviews, getInterviewResults, submitInterview } from '../controllers/interview.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getInterviews);
router.get('/results', getInterviewResults);
router.post('/submit', submitInterview);

export default router;
