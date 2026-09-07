import { Router } from 'express';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { env } from '../config/env.js';
import { getDBStatus } from '../config/db.js';

const router = Router();

/**
 * @route   GET /api/health
 * @desc    Check system health status, database connection, and uptime
 * @access  Public
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const dbStatus = getDBStatus();

    const healthData = {
      service: 'CareerPilot AI Backend API',
      status: dbStatus.state === 'connected' ? 'healthy' : 'degraded',
      database: dbStatus,
      uptime: `${process.uptime().toFixed(2)}s`,
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      version: '1.0.0',
    };

    const statusCode = dbStatus.state === 'connected' ? 200 : 503;
    return res
      .status(statusCode)
      .json(
        new ApiResponse(
          statusCode,
          healthData,
          dbStatus.state === 'connected'
            ? 'CareerPilot AI API and Database are operational'
            : 'CareerPilot AI API is operating with degraded database connectivity'
        )
      );
  })
);

export default router;
