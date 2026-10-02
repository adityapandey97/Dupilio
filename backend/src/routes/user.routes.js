import express from 'express';
import { getMe, updateProfile, getAllUsers } from '../controllers/user.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/me', getMe);
router.put('/profile', updateProfile);
router.get('/', authorize('ADMIN'), getAllUsers);

export default router;
