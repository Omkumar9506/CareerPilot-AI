import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { env } from '../config/env.js';
import User from '../models/User.js';

/**
 * Protect routes: verify JWT Bearer token and attach authenticated user to req.user
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Authentication failed: No token provided. Please log in.');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Fetch user excluding password
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ApiError(401, 'Authentication failed: The user belonging to this token no longer exists.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new ApiError(401, 'Invalid authentication token.');
    }
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Authentication token has expired. Please log in again.');
    }
    throw error;
  }
});

/**
 * Authorize specific roles (RBAC)
 * @param  {...string} roles - Permitted user roles ('candidate', 'recruiter', 'admin')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'User must be authenticated to check permissions.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access forbidden: Role '${req.user.role}' does not have sufficient permissions to access this resource.`
        )
      );
    }

    next();
  };
};
