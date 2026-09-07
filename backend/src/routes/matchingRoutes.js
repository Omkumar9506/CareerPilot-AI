import { Router } from 'express';
import {
  getRecommendedJobs,
  getJobMatchDetails,
  getTopCandidatesForJob,
} from '../controllers/matchingController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { validateObjectId } from '../middlewares/validationMiddleware.js';

const router = Router();

// Candidate: Personalized recommendations feed
router.get(
  '/recommendations',
  protect,
  authorize('candidate', 'admin'),
  getRecommendedJobs
);

// Candidate: Real-time match diagnostics for a single job
router.get(
  '/job/:jobId',
  protect,
  authorize('candidate', 'admin'),
  validateObjectId('jobId'),
  getJobMatchDetails
);

// Recruiter: Top platform candidates recommendation for an open job vacancy
router.get(
  '/recruiter/job/:jobId/top-candidates',
  protect,
  authorize('recruiter', 'admin'),
  validateObjectId('jobId'),
  getTopCandidatesForJob
);

export default router;
