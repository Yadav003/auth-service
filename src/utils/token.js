/**
 * Token Utilities
 * Keeps password reset token generation and hashing in one place so the service stays small
 */

import crypto from 'crypto';

/**
 * Build a one-time password reset token
 * We return the raw token only once, and store the hashed version in the database
 */
export const generateResetToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = hashToken(rawToken);

  return {
    rawToken,
    hashedToken,
  };
};

/**
 * Hash a token before we compare or store it
 * This way the database never keeps the original reset link token
 */
export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export default {
  generateResetToken,
  hashToken,
};