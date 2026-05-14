/**
 * JWT Utilities
 * Handles creation and verification of JSON Web Tokens
 * Tokens are used to identify users without storing their password in every request
 */

import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

/**
 * Generate an access token
 * This is a short-lived token (15 minutes) that proves a user is logged in
 * The client sends this in the Authorization header with every protected request
 */
export const generateAccessToken = (userId, role = 'user') => {
  try {
    // Create a token that expires in 15 minutes
    // The token contains the userId and role so we know who the user is without querying the DB
    const token = jwt.sign(
      {
        userId,
        role,
        type: 'access', // Mark this as an access token (not a refresh token)
      },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiry }
    );

    return token;
  } catch (error) {
    throw new Error(`Error generating access token: ${error.message}`);
  }
};

/**
 * Generate a refresh token
 * This is a long-lived token (7 days) that allows getting a new access token
 * We store this in the database so we can revoke it if needed (logout)
 */
export const generateRefreshToken = (userId) => {
  try {
    // Create a token that expires in 7 days
    // This is stored in the database so we can track it
    const token = jwt.sign(
      {
        userId,
        type: 'refresh', // Mark this as a refresh token
      },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiry }
    );

    return token;
  } catch (error) {
    throw new Error(`Error generating refresh token: ${error.message}`);
  }
};

/**
 * Verify and decode an access token
 * This is used to check if a token is valid before letting the user access a protected resource
 */
export const verifyAccessToken = (token) => {
  try {
    // Verify the token signature and check if it's expired
    // If valid, return the decoded payload (userId, role, etc.)
    const decoded = jwt.verify(token, config.jwt.accessSecret);
    return decoded;
  } catch (error) {
    // If token is invalid or expired, throw a proper error
    if (error.name === 'TokenExpiredError') {
      const expError = new Error('Access token has expired');
      expError.statusCode = 401;
      throw expError;
    }

    const verifyError = new Error('Invalid access token');
    verifyError.statusCode = 401;
    throw verifyError;
  }
};

/**
 * Verify and decode a refresh token
 * This is used when the user wants a new access token
 */
export const verifyRefreshToken = (token) => {
  try {
    // Verify the refresh token signature and expiry
    const decoded = jwt.verify(token, config.jwt.refreshSecret);
    return decoded;
  } catch (error) {
    // If token is invalid or expired, throw a proper error
    if (error.name === 'TokenExpiredError') {
      const expError = new Error('Refresh token has expired');
      expError.statusCode = 401;
      throw expError;
    }

    const verifyError = new Error('Invalid refresh token');
    verifyError.statusCode = 401;
    throw verifyError;
  }
};

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
