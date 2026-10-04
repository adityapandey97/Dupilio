import express from 'express';
import {
  getOpportunities,
  getOpportunityById
} from '../controllers/opportunity.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/opportunities', protect, getOpportunities);
router.get('/opportunities/:id', protect, getOpportunityById);

export default router;
