import express from 'express';
import {
  getDiscussions,
  getDiscussionById,
  createDiscussion,
  upvoteDiscussion,
  bookmarkDiscussion,
  addComment,
  deleteDiscussion
} from '../controllers/discussion.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getDiscussions);
router.get('/:id', getDiscussionById);
router.post('/', protect, createDiscussion);
router.post('/:id/upvote', protect, upvoteDiscussion);
router.post('/:id/bookmark', protect, bookmarkDiscussion);
router.post('/:id/comment', protect, addComment);
router.delete('/:id', protect, deleteDiscussion);

export default router;
