import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

/**
 * 404 Route Not Found middleware
 */
export const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

/**
 * Global Centralized Error Handling Middleware
 * Normalizes Mongoose, JWT, and application errors into standard ApiResponse shape.
 */
export const errorHandler = (err, req, res, next) => {
  let error = err;

  // 1. Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Invalid format for resource identifier: ${err.value}`;
    error = new ApiError(400, message);
  }

  // 2. Handle Mongoose Duplicate Key Error (code 11000)
  else if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {});
    const field = fields.length > 0 ? fields[0] : 'field';
    const message = `Duplicate value entered for ${field}. An entity with this ${field} already exists.`;
    error = new ApiError(409, message);
  }

  // 3. Handle Mongoose Schema Validation Error
  else if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors || {}).map((val) => val.message);
    const message = messages.length > 0 ? messages.join(', ') : 'Validation error';
    error = new ApiError(400, message, messages);
  }

  // 4. Handle JSON Web Token Errors
  else if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid authentication token signature');
  } else if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Authentication token has expired. Please sign in again.');
  }

  // If not already an ApiError instance, convert it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors || [],
    ...(env.NODE_ENV === 'development' && { stack: error.stack }),
  };

  res.status(error.statusCode).json(response);
};
