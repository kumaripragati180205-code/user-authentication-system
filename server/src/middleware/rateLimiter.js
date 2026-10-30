import rateLimit from 'express-rate-limit';

/**
 * Strict rate limiter for sensitive authentication endpoints
 * Limits to 15 attempts per 15-minute window per IP to stop brute-forcing.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 'TOO_MANY_REQUESTS',
    message: 'Too many authentication attempts from this IP address. Please try again after 15 minutes.'
  }
});

/**
 * General API rate limiter
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests. Please slow down.'
  }
});

