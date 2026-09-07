import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
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
router.patch('/users/:id/status', toggleUserStatus);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Job listing oversight & moderation
router.get('/jobs', getAllJobsAdmin);
router.patch('/jobs/:id/status', toggleJobStatusAdmin);
router.delete('/jobs/:id', deleteJobAdmin);

export default router;
