import { Router } from 'express';
import {
  getCandidateDashboard,
  getRecruiterDashboard,
} from '../controllers/dashboardController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = Router();

// Candidate Dashboard Metrics & Insights
router.get(
  '/candidate',
  protect,
  authorize('candidate', 'admin'),
  getCandidateDashboard
);

// Recruiter Dashboard Metrics & Hiring Funnel
router.get(
  '/recruiter',
  protect,
  authorize('recruiter', 'admin'),
  getRecruiterDashboard
);

export default router;
