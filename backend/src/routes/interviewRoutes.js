import { Router } from 'express';
import {
  startInterviewSession,
  getInterviewSession,
  submitAnswer,
  completeSession,
  getMyInterviewHistory,
} from '../controllers/interviewController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = Router();

// Candidate only routes
router.post(
  '/start',
  protect,
  authorize('candidate', 'admin'),
  startInterviewSession
);

router.get(
  '/history',
  protect,
  authorize('candidate', 'admin'),
  getMyInterviewHistory
);

router.get(
  '/session/:id',
  protect,
  authorize('candidate', 'admin'),
  getInterviewSession
);

router.post(
  '/session/:id/answer',
  protect,
  authorize('candidate', 'admin'),
  submitAnswer
);

router.post(
  '/session/:id/complete',
  protect,
  authorize('candidate', 'admin'),
  completeSession
);

export default router;
