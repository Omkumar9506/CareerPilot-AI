import { Router } from 'express';
import {
  createRoadmap,
  getMyRoadmaps,
  getRoadmapById,
  toggleMilestone,
  syncSkillsToProfile,
  deleteRoadmap,
} from '../controllers/roadmapController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = Router();

router.post(
  '/',
  protect,
  authorize('candidate', 'admin'),
  createRoadmap
);

router.get(
  '/',
  protect,
  authorize('candidate', 'admin'),
  getMyRoadmaps
);

router.get(
  '/:id',
  protect,
  authorize('candidate', 'admin'),
  getRoadmapById
);

router.patch(
  '/:id/milestones/:milestoneIndex',
  protect,
  authorize('candidate', 'admin'),
  toggleMilestone
);

router.post(
  '/:id/sync-skills',
  protect,
  authorize('candidate', 'admin'),
  syncSkillsToProfile
);

router.delete(
  '/:id',
  protect,
  authorize('candidate', 'admin'),
  deleteRoadmap
);

export default router;
