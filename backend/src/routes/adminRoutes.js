import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { validateObjectId } from '../middlewares/validationMiddleware.js';
import {
  getAdminDashboardStats,
  getAllUsers,
  toggleUserStatus,
  updateUserRole,
  deleteUser,
  getAllJobsAdmin,
  toggleJobStatusAdmin,
  deleteJobAdmin,
} from '../controllers/adminController.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect, authorize('admin'));

// Platform metrics & KPI analytics
router.get('/dashboard', getAdminDashboardStats);

// User management & moderation
router.get('/users', getAllUsers);
router.patch('/users/:id/status', validateObjectId('id'), toggleUserStatus);
router.patch('/users/:id/role', validateObjectId('id'), updateUserRole);
router.delete('/users/:id', validateObjectId('id'), deleteUser);

// Job listing oversight & moderation
router.get('/jobs', getAllJobsAdmin);
router.patch('/jobs/:id/status', validateObjectId('id'), toggleJobStatusAdmin);
router.delete('/jobs/:id', validateObjectId('id'), deleteJobAdmin);

export default router;
