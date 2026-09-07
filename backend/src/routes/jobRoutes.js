import { Router } from 'express';
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyPostedJobs,
  toggleJobStatus,
  toggleSaveJob,
  getSavedJobs,
  getSavedJobIds,
} from '../controllers/jobController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { validateJobPayload, validateObjectId } from '../middlewares/validationMiddleware.js';

const router = Router();

// 1. Recruiter specific management routes (must precede /:id)
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
  validateJobPayload,
  createJob
);

router.put(
  '/:id',
  protect,
  authorize('recruiter', 'admin'),
  validateObjectId('id'),
  validateJobPayload,
  updateJob
);

router.delete(
  '/:id',
  protect,
  authorize('recruiter', 'admin'),
  validateObjectId('id'),
  deleteJob
);

router.patch(
  '/:id/status',
  protect,
  authorize('recruiter', 'admin'),
  validateObjectId('id'),
  toggleJobStatus
);

// 2. Candidate Saved / Bookmarked Jobs routes (must precede /:id)
router.get(
  '/saved',
  protect,
  authorize('candidate', 'admin'),
  getSavedJobs
);

router.get(
  '/saved/ids',
  protect,
  authorize('candidate', 'admin'),
  getSavedJobIds
);

router.post(
  '/:id/save',
  protect,
  authorize('candidate', 'admin'),
  validateObjectId('id'),
  toggleSaveJob
);

// 3. Public browsing & details routes
router.get('/', getJobs);
router.get('/:id', validateObjectId('id'), getJobById);

export default router;
