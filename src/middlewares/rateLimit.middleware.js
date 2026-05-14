/**
 * Rate Limit Middleware
 * We keep the brute-force protection in one place so the login routes stay easy to read.
 */

import rateLimit from 'express-rate-limit';

/**
 * General API limiter
 * This gives us a small safety net for the whole auth service without being too aggressive.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests, please try again later',
  },
});

/**
 * Strict login limiter
 * A short window and small max helps slow down password spraying attacks.
 */
export const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many login attempts, please try again later',
  },
});

/**
 * Strict forgot-password limiter
 * This stops attackers from flooding reset requests and probing for accounts.
 */
export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests, please try again later',
  },
});

export default {
  apiLimiter,
  loginLimiter,
  forgotPasswordLimiter,
};