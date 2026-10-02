import express from 'express';
import { getResumeData, uploadResume } from '../controllers/resume.controller.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

router.get('/', getResumeData);
router.post('/upload', upload.single('resume'), uploadResume);

export default router;
