import { Router } from 'express';
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyPostedJobs,
  toggleJobStatus,
} from '../controllers/jobController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = Router();

// Recruiter specific management routes (must precede /:id)
router.get(
  '/recruiter/my-jobs',
  protect,
  authorize('recruiter', 'admin'),
  getMyPostedJobs
);

router.post(
  '/',
  protect,
  authorize('recruiter', 'admin'),
  createJob
);

router.put(
  '/:id',
  protect,
  authorize('recruiter', 'admin'),
  updateJob
);

router.delete(
  '/:id',
  protect,
  authorize('recruiter', 'admin'),
  deleteJob
);

router.patch(
  '/:id/status',
  protect,
  authorize('recruiter', 'admin'),
  toggleJobStatus
);

// Public browsing & details routes
router.get('/', getJobs);
router.get('/:id', getJobById);

export default router;
