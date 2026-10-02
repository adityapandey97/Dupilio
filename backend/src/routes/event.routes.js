import express from 'express';
import { getEvents, getEventById, createEvent } from '../controllers/event.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', protect, authorize('ADMIN'), createEvent);

export default router;
