import rateLimit from 'express-rate-limit';

/**
 * Strict rate limiter for authentication routes (login / register)
 * to prevent brute-force attacks and credential stuffing.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 30, // Limit each IP to 30 auth attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes',
  },
});

/**
 * Rate limiter for computationally intensive AI endpoints
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 20, // 20 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'AI processing capacity exceeded. Please wait a moment before trying again.',
  },
});
