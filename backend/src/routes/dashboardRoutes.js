import { Router } from 'express';
import { getCandidateDashboard } from '../controllers/dashboardController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = Router();

// Candidate Dashboard Metrics & Insights
router.get(
  '/candidate',
  protect,
  authorize('candidate', 'admin'),
  getCandidateDashboard
);

export default router;
