/**
 * Auth Controller
 * Handles HTTP requests and responses for auth endpoints
 * IMPORTANT: This layer should NOT contain business logic
 * It just receives the request, validates it, calls the service, and sends back the response
 */

import {
  validateRegister,
  validateLogin,
  validateRefreshToken,
  validateForgotPassword,
  validateResetPassword,
} from '../validators/authValidator.js';
import {
  registerUser,
  loginUser,
  startGoogleOAuth,
  handleGoogleCallback,
  refreshTokens,
  requestPasswordReset,
  resetPassword,
  logoutUser,
  validateAccessToken,
} from '../services/authService.js';
import { config } from '../config/env.js';
import { parseCookies } from '../utils/oauth.js';

/**
 * Register endpoint - POST /api/v1/auth/register
 * This function:
 * 1. Validates the incoming request data
 * 2. Calls the service to register the user
 * 3. Sends back a response to the client
 */
export const register = async (req, res, next) => {
  try {
    // First, validate that the request has valid email, password, and name
    // If validation fails, we return an error immediately
    const { error, value } = validateRegister(req.body);
    
    if (error) {
      // If validation failed, send back the errors to the client
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errorMessages,
      });
    }

    // If validation passed, call the service to actually register the user
    // The service handles all the business logic like hashing passwords and saving to DB
    const newUser = await registerUser(value);

    // Send back a success response with the new user data (no password!)
    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: newUser,
    });
  } catch (error) {
    // If something goes wrong (like email already exists), pass the error to the error handler
    // The error handler middleware will format it nicely for the client
    next(error);
  }
};

/**
 * Login endpoint - POST /api/v1/auth/login
 * This function:
 * 1. Validates email and password from the request
 * 2. Calls the service to verify credentials and generate tokens
 * 3. Sends back tokens and user info
 */
export const login = async (req, res, next) => {
  try {
    // Validate that email and password are provided and in correct format
    const { error, value } = validateLogin(req.body);

    if (error) {
      // If validation failed, return errors to the client
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errorMessages,
      });
    }

    // Call the service to verify the user and generate tokens
    // The service handles password comparison and token generation
    const result = await loginUser(value);

    // Send back a success response with tokens and user info
    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (error) {
    // Pass any errors to the error handler middleware
    next(error);
  }
};

/**
 * Refresh token endpoint - POST /api/v1/auth/refresh-token
 * This is called when the access token expires but the user still has a valid refresh token
 * We generate a new access token and rotate the refresh token (for security)
 */
export const refreshToken = async (req, res, next) => {
  try {
    // Validate that refresh token is provided
    const { error, value } = validateRefreshToken(req.body);

    if (error) {
      // If validation failed, return errors to the client
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errorMessages,
      });
    }

    // Call the service to verify the refresh token and generate new tokens
    // The service handles token rotation (invalidates old token, creates new one)
    const result = await refreshTokens(value);

    // Send back the new tokens
    // Note: We do NOT return the user info - just the tokens
    res.status(200).json({
      status: 'success',
      message: 'Token refreshed successfully',
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (error) {
    // Pass any errors to the error handler middleware
    next(error);
  }
};

/**
 * Forgot password endpoint - POST /api/auth/forgot-password
 * We always return the same response so nobody can learn whether an email exists
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { error, value } = validateForgotPassword(req.body);

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errorMessages,
      });
    }

    await requestPasswordReset(value);

    res.status(200).json({
      status: 'success',
      message: 'If the email exists, a password reset link has been sent',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password endpoint - POST /api/auth/reset-password
 * This uses the token from the reset link to set a new password
 */
export const resetUserPassword = async (req, res, next) => {
  try {
    const { error, value } = validateResetPassword(req.body);

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errorMessages,
      });
    }

    await resetPassword(value);

    res.status(200).json({
      status: 'success',
      message: 'Password reset successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout endpoint - POST /api/auth/logout
 * We accept the refresh token from the body or cookies so the client can use either approach
 */
export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.body?.refreshToken || req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Refresh token is required',
      });
    }

    await logoutUser({ refreshToken });

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Token validation endpoint - GET /api/auth/validate-token
 * This is meant for other services, so we return only the information they actually need
 */
export const validateToken = async (req, res, next) => {
  try {
    const result = await validateAccessToken({
      authorizationHeader: req.headers.authorization,
    });

    res.status(200).json({
      status: 'success',
      message: result.message,
      data: {
        userId: result.userId,
        role: result.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Google OAuth start endpoint - GET/POST /api/v1/auth/google
 * Redirects to Google with PKCE and sets short-lived HttpOnly cookies
 */
export const googleAuthStart = async (req, res, next) => {
  try {
    const { url, state, nonce, codeVerifier } = startGoogleOAuth();

    const cookieOptions = {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000,
      path: '/api',
    };

    res.cookie('oauth_state', state, cookieOptions);
    res.cookie('oauth_nonce', nonce, cookieOptions);
    res.cookie('oauth_verifier', codeVerifier, cookieOptions);

    const wantsJson =
      req.method === 'POST' || (req.headers.accept || '').includes('application/json');

    if (wantsJson) {
      return res.status(200).json({
        status: 'success',
        data: {
          authorizationUrl: url,
        },
      });
    }

    return res.redirect(url);
  } catch (error) {
    next(error);
  }
};

/**
 * Google OAuth callback endpoint - GET /api/v1/auth/google/callback
 */
export const googleAuthCallback = async (req, res, next) => {
  try {
    const oauthError = typeof req.query.error === 'string' ? req.query.error : null;
    const oauthErrorDescription =
      typeof req.query.error_description === 'string' ? req.query.error_description : null;

    if (oauthError) {
      const error = new Error(oauthErrorDescription || 'Google authorization failed');
      error.statusCode = 401;
      throw error;
    }

    const code = typeof req.query.code === 'string' ? req.query.code : '';
    const state = typeof req.query.state === 'string' ? req.query.state : '';

    const cookies = parseCookies(req.headers.cookie);
    const storedState = cookies.oauth_state;
    const storedNonce = cookies.oauth_nonce;
    const codeVerifier = cookies.oauth_verifier;

    const result = await handleGoogleCallback({
      code,
      state,
      storedState,
      storedNonce,
      codeVerifier,
    });

    const clearCookieOptions = {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      path: '/api',
    };

    res.clearCookie('oauth_state', clearCookieOptions);
    res.clearCookie('oauth_nonce', clearCookieOptions);
    res.clearCookie('oauth_verifier', clearCookieOptions);

    return res.status(200).json({
      status: 'success',
      message: 'Google login successful',
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
  refreshToken,
  forgotPassword,
  resetUserPassword,
  logout,
  validateToken,
  googleAuthStart,
  googleAuthCallback,
};
