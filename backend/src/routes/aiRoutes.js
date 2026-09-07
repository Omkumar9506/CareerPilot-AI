import express from 'express';
import {
  analyzeResume,
  getMyAnalyses,
  getAnalysisById,
} from '../controllers/aiController.js';
import { authorize, protect } from '../middlewares/authMiddleware.js';
import { aiLimiter } from '../middlewares/rateLimitMiddleware.js';
import { validateObjectId } from '../middlewares/validationMiddleware.js';

const router = express.Router();

// Candidate only AI resume analysis endpoints
router.use(protect);
router.use(authorize('candidate'));

router.post('/analyze-resume', aiLimiter, analyzeResume);
router.get('/analyses', getMyAnalyses);
router.get('/analyses/:id', validateObjectId('id'), getAnalysisById);

export default router;
