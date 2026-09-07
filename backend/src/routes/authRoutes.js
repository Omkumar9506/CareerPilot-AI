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
import { authLimiter } from '../middlewares/rateLimitMiddleware.js';
import { validateRegister, validateLogin } from '../middlewares/validationMiddleware.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const router = Router();

// Public auth endpoints with brute-force rate limiter and input validation
router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/forgot-password', authLimiter, forgotPassword);
router.put('/reset-password/:resetToken', authLimiter, resetPassword);

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
