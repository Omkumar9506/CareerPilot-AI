import { Router } from 'express';
import {
  applyForJob,
  getMyApplications,
  checkApplicationStatus,
  getRecruiterApplications,
  getJobApplicants,
  updateApplicationStatus,
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { validateObjectId } from '../middlewares/validationMiddleware.js';

const router = Router();

// Candidate endpoints
router.post('/apply/:jobId', protect, authorize('candidate'), validateObjectId('jobId'), applyForJob);
router.get('/my-applications', protect, authorize('candidate'), getMyApplications);
router.get('/check/:jobId', protect, authorize('candidate'), validateObjectId('jobId'), checkApplicationStatus);

// Recruiter endpoints
router.get('/recruiter', protect, authorize('recruiter', 'admin'), getRecruiterApplications);
router.get('/job/:jobId', protect, authorize('recruiter', 'admin'), validateObjectId('jobId'), getJobApplicants);
router.patch('/:id/status', protect, authorize('recruiter', 'admin'), validateObjectId('id'), updateApplicationStatus);

export default router;
