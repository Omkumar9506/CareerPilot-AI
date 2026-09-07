import express from 'express';
import {
  analyzeResume,
  getMyAnalyses,
  getAnalysisById,
} from '../controllers/aiController.js';
import { authorize, protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Candidate only AI resume analysis endpoints
router.use(protect);
router.use(authorize('candidate'));

router.post('/analyze-resume', analyzeResume);
router.get('/analyses', getMyAnalyses);
router.get('/analyses/:id', getAnalysisById);

export default router;
