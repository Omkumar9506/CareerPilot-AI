import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updatePassword,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const router = Router();

// Public auth endpoints
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);

// Protected endpoints
router.get('/me', protect, getMe);
router.put('/update-password', protect, updatePassword);

// Role verification test endpoints
router.get(
  '/test/recruiter-only',
  protect,
  authorize('recruiter', 'admin'),
  (req, res) => {
    res.json(
      new ApiResponse(200, { authorized: true, user: req.user }, 'Authorized for Recruiter access')
    );
  }
);

router.get(
  '/test/admin-only',
  protect,
  authorize('admin'),
  (req, res) => {
    res.json(
      new ApiResponse(200, { authorized: true, user: req.user }, 'Authorized for Admin access')
    );
  }
);

export default router;
