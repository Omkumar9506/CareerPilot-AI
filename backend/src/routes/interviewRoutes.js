import { Router } from 'express';
import {
  startInterviewSession,
  getInterviewSession,
  submitAnswer,
  completeSession,
  getMyInterviewHistory,
} from '../controllers/interviewController.js';
import {
  scheduleInterview,
  getRecruiterInterviews,
  getCandidateInterviews,
  updateInterviewStatus,
  getInterviewById,
} from '../controllers/interviewScheduleController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { validateInterviewSchedule, validateObjectId } from '../middlewares/validationMiddleware.js';

const router = Router();

// ==========================================
// 1. AI Mock Interview Routes (Candidate)
// ==========================================
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
  validateObjectId('id'),
  getInterviewSession
);

router.post(
  '/session/:id/answer',
  protect,
  authorize('candidate', 'admin'),
  validateObjectId('id'),
  submitAnswer
);

router.post(
  '/session/:id/complete',
  protect,
  authorize('candidate', 'admin'),
  validateObjectId('id'),
  completeSession
);

// ==========================================
// 2. Real Interview Scheduling Routes
// ==========================================

// Recruiter: Schedule new interview & send invitation email
router.post(
  '/schedule',
  protect,
  authorize('recruiter', 'admin'),
  validateInterviewSchedule,
  scheduleInterview
);

// Recruiter: Fetch scheduled interviews & summary stats
router.get(
  '/recruiter',
  protect,
  authorize('recruiter', 'admin'),
  getRecruiterInterviews
);

// Candidate: Fetch scheduled interviews & status
router.get(
  '/candidate',
  protect,
  authorize('candidate', 'admin'),
  getCandidateInterviews
);

// Recruiter / Candidate / Admin: View single interview details
router.get(
  '/scheduled/:id',
  protect,
  validateObjectId('id'),
  getInterviewById
);

// Recruiter: Update status (Completed / Cancelled / Rescheduled) or details
router.patch(
  '/scheduled/:id',
  protect,
  authorize('recruiter', 'admin'),
  validateObjectId('id'),
  updateInterviewStatus
);

export default router;
