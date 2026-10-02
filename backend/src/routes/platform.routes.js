import express from 'express';
import {
  listSupportedPlatforms,
  getUserPlatforms,
  connectPlatform,
  syncPlatform,
  syncAllUserPlatforms,
  disconnectPlatform
} from '../controllers/platform.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/supported', listSupportedPlatforms);
router.get('/', protect, getUserPlatforms);
router.post('/connect', protect, connectPlatform);
router.post('/sync-all', protect, syncAllUserPlatforms);
router.post('/:platform/sync', protect, syncPlatform);
router.delete('/:platform', protect, disconnectPlatform);

export default router;
