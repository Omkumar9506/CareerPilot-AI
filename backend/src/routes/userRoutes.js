import { Router } from 'express';
import {
  getMyProfile,
  updateCandidateProfile,
  updateRecruiterProfile,
  getCandidateProfileById,
  getRecruiterProfileById,
} from '../controllers/userProfileController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = Router();

// Current user profile (auto-detects role)
router.get('/profile/me', protect, getMyProfile);

// Update candidate profile
router.put('/profile/candidate', protect, authorize('candidate'), updateCandidateProfile);

// Update recruiter profile
router.put('/profile/recruiter', protect, authorize('recruiter'), updateRecruiterProfile);

// Recruiter/Admin inspecting candidate profile
router.get(
  '/profile/candidate/:id',
  protect,
  authorize('recruiter', 'admin'),
  getCandidateProfileById
);

// Public inspection of recruiter company profile
router.get('/profile/recruiter/:id', getRecruiterProfileById);

export default router;
