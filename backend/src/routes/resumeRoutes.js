import { Router } from 'express';
import {
  uploadResume,
  getMyResume,
  deleteResume,
} from '../controllers/resumeController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { uploadResumeMiddleware } from '../middlewares/uploadMiddleware.js';

const router = Router();

router.post(
  '/upload',
  protect,
  authorize('candidate'),
  uploadResumeMiddleware,
  uploadResume
);

router.get('/my-resume', protect, authorize('candidate'), getMyResume);
router.delete('/my-resume', protect, authorize('candidate'), deleteResume);

export default router;
