import express from 'express';
import {
  getPreparationData,
  getRecommendations
} from '../controllers/preparation.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getPreparationData);
router.get('/recommendations', getRecommendations);

export default router;
