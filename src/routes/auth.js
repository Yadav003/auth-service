/**
 * Auth Routes
 * Defines all the authentication endpoints
 * Each route points to a controller function that handles the request
 */

import express from 'express';
import {
  register,
  login,
  refreshToken,
  forgotPassword,
  resetUserPassword,
  logout,
  validateToken,
  googleAuthStart,
  googleAuthCallback,
} from '../controllers/authController.js';
import { loginLimiter, forgotPasswordLimiter } from '../middlewares/rateLimit.middleware.js';

const router = express.Router();

/**
 * POST /api/v1/auth/register
 * Register a new user with email, password, and name
 * Request body should include: email, password, name
 * Response includes: newly created user (without password)
 */
router.post('/register', register);

/**
 * POST /api/v1/auth/login
 * Login with email and password to get access and refresh tokens
 * Request body should include: email, password
 * Response includes: user info, accessToken, refreshToken
 */
router.post('/login', loginLimiter, login);

/**
 * GET/POST /api/v1/auth/google
 * Start Google OAuth with PKCE
 */
router.get('/google', googleAuthStart);
router.post('/google', googleAuthStart);

/**
 * GET /api/v1/auth/google/callback
 * Handle Google OAuth callback
 */
router.get('/google/callback', googleAuthCallback);

/**
 * POST /api/v1/auth/refresh-token
 * Get a new access token using a refresh token
 * Request body should include: refreshToken
 * Response includes: new accessToken, new refreshToken (rotated)
 */
router.post('/refresh-token', refreshToken);

/**
 * POST /api/auth/forgot-password
 * Starts the reset flow without revealing whether the email exists
 */
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);

/**
 * POST /api/auth/reset-password
 * Sets a new password when the reset token is still valid
 */
router.post('/reset-password', resetUserPassword);

/**
 * POST /api/auth/logout
 * Clears the stored refresh token so the current session cannot be reused
 */
router.post('/logout', logout);

/**
 * GET /api/auth/validate-token
 * Lets other microservices verify an access token without learning anything extra
 */
router.get('/validate-token', validateToken);

/**
 * Health check endpoint to make sure auth service is running
 */
router.get('/status', (req, res) => {
  res.status(200).json({
    status: 'Auth service is running',
    availableEndpoints: {
      register: 'POST /api/v1/auth/register',
      login: 'POST /api/v1/auth/login',
      refreshToken: 'POST /api/v1/auth/refresh-token',
      googleStart: 'GET /api/v1/auth/google',
      googleCallback: 'GET /api/v1/auth/google/callback',
      forgotPassword: 'POST /api/auth/forgot-password',
      resetPassword: 'POST /api/auth/reset-password',
      logout: 'POST /api/auth/logout',
      validateToken: 'GET /api/auth/validate-token',
      // Logout and other endpoints will be added later
    },
  });
});

export default router;
