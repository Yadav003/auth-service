/**
 * Auth Service
 * Contains all the business logic for authentication
 * The controller will call these functions to handle registration, login, etc.
 */

import User from '../models/User.js';
import { config } from '../config/env.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from '../utils/jwt.js';
import { generateResetToken, hashToken } from '../utils/token.js';

/**
 * Register a new user
 * This function:
 * 1. Checks if user already exists (by email)
 * 2. Hashes the password for security
 * 3. Saves the new user to the database
 * 4. Returns the new user (without the password)
 */
export const registerUser = async ({ email, password, name }) => {
  // Check if a user with this email already exists
  // We need to find if they're already registered to prevent duplicate accounts
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    // If user exists, throw an error that the controller will catch
    // This stops the registration process right here
    const error = new Error('This email is already registered');
    error.statusCode = 400; // Bad request - user already exists
    throw error;
  }

  // Hash the password so we never store it as plain text
  // Even if someone hacks our database, they can't see the password
  const hashedPassword = await hashPassword(password);

  // Create a new user document with the hashed password
  // Save it to the database
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  // Convert the user to a plain object so we can remove the password
  // Then return it (without password) to the controller
  const userResponse = user.toObject();
  delete userResponse.password; // Remove password before sending back
  
  return userResponse;
};

/**
 * Login a user
 * This function:
 * 1. Finds the user by email
 * 2. Compares the provided password with the hashed password in the database
 * 3. Generates access and refresh tokens
 * 4. Stores the refresh token in the database
 * 5. Updates the lastLogin timestamp
 * 6. Returns the user and both tokens
 */
export const loginUser = async ({ email, password }) => {
  // Find the user by email
  // We need to explicitly request the password field because it's hidden by default (select: false)
  const user = await User.findOne({ email }).select('+password');

  // If user doesn't exist, send a generic error message
  // Don't say "user not found" - this is a security best practice (doesn't reveal if email is registered)
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401; // Unauthorized
    throw error;
  }

  // If the account is temporarily locked, we stop here so repeated attacks cannot keep guessing passwords.
  if (user.lockUntil && user.lockUntil > new Date()) {
    const error = new Error('Account is temporarily locked. Please try again later.');
    error.statusCode = 423;
    throw error;
  }

  // If the lock has already expired, we clear it before checking the password.
  if (user.lockUntil && user.lockUntil <= new Date()) {
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();
  }

  // Compare the password the user provided with the hashed password in the database
  // bcrypt.compare() does the complex work of comparing hashed passwords
  const isPasswordValid = await comparePassword(password, user.password);

  // If password doesn't match, throw an error
  // Again, we use a generic message to not reveal if email exists
  if (!isPasswordValid) {
    user.failedLoginAttempts += 1;

    // Five failed attempts is enough to slow down brute force attacks without locking people out forever.
    if (user.failedLoginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
    }

    await user.save();

    if (user.lockUntil && user.lockUntil > new Date()) {
      const error = new Error('Account is temporarily locked. Please try again later.');
      error.statusCode = 423;
      throw error;
    }

    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // A successful login means the earlier failures no longer matter.
  user.failedLoginAttempts = 0;
  user.lockUntil = null;

  const adminEmail = config.admin.email;
  const isAdminEmail = adminEmail && user.email.toLowerCase() === adminEmail;

  // Keep admin role in sync with configured admin email.
  if (isAdminEmail && user.role !== 'admin') {
    user.role = 'admin';
  } else if (!isAdminEmail && user.role === 'admin') {
    user.role = 'user';
  }

  // Generate a short-lived access token (15 minutes)
  // This is what the user will send with each request to prove they're logged in
  const accessToken = generateAccessToken(user._id, user.role || 'user');

  // Generate a long-lived refresh token (7 days)
  // This is stored in the database and used to get a new access token when it expires
  const refreshToken = generateRefreshToken(user._id);

  // Save the refresh token and update lastLogin in the database
  // We do this so we can revoke tokens (logout) and track login history
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();

  // Convert to plain object and remove sensitive fields before returning
  const userResponse = user.toObject();
  delete userResponse.password; // Never return password
  delete userResponse.refreshToken; // Never return refresh token in response

  // Return both tokens and user info
  return {
    user: userResponse,
    accessToken,
    refreshToken,
  };
};

/**
 * Refresh the access token using a refresh token
 * This is called when the access token expires but the user still has a valid refresh token
 * 
 * Security: We implement "Refresh Token Rotation"
 * This means we generate a NEW refresh token and invalidate the old one
 * This protects against token hijacking - if someone steals your token, they can only use it once
 */
export const refreshTokens = async ({ refreshToken }) => {
  // First, verify the refresh token signature and check if it's expired
  // If the token is invalid or expired, verifyRefreshToken will throw an error
  const decoded = await verifyRefreshToken(refreshToken);

  // Now we need to find the user who owns this token
  // We search by the stored refresh token to make sure it's still valid
  // This is important because we might have invalidated this token (token rotation)
  const user = await User.findOne({ refreshToken }).select('+refreshToken');

  // If no user found with this token, it means:
  // - The token doesn't exist in our database (already used/rotated)
  // - The token was forged/tampered with
  // Either way, we shouldn't trust it
  if (!user) {
    const error = new Error('Refresh token is invalid or has been revoked');
    error.statusCode = 401;
    throw error;
  }

  // Double-check that the token in the request matches what we have in the database
  // This prevents someone from using an old token after it's been rotated
  if (user.refreshToken !== refreshToken) {
    const error = new Error('Refresh token has expired');
    error.statusCode = 401;
    throw error;
  }

  // Token is valid! Now generate new tokens (Refresh Token Rotation)
  // Generate a new access token - short lived (15 minutes)
  const newAccessToken = generateAccessToken(user._id, user.role || 'user');

  // Generate a new refresh token - long lived (7 days)
  // This is the rotation part - we're replacing the old token with a new one
  const newRefreshToken = generateRefreshToken(user._id);

  // Update the user's refresh token in the database with the new one
  // This invalidates the old token - it can't be used anymore
  user.refreshToken = newRefreshToken;
  await user.save();

  // Return the new tokens to the client
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

/**
 * Create a password reset token and store only the hashed version in the database
 * The raw token is only needed once, when we build the reset link for the user
 */
export const requestPasswordReset = async ({ email }) => {
  const user = await User.findOne({ email });

  if (!user) {
    return {
      message: 'If the email exists, a password reset link has been sent',
    };
  }

  const { rawToken, hashedToken } = generateResetToken();
  const resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = resetPasswordExpires;
  await user.save();

  const resetLink = `http://localhost:3000/reset-password?token=${rawToken}`;

  console.log(`Password reset link for ${email}: ${resetLink}`);

  return {
    message: 'If the email exists, a password reset link has been sent',
  };
};

/**
 * Replace the old password after the reset token has been checked
 * We clear the token fields right away so the same link cannot be used again
 */
export const resetPassword = async ({ token, newPassword }) => {
  const hashedToken = hashToken(token);

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    const error = new Error('Invalid or expired reset token');
    error.statusCode = 400;
    throw error;
  }

  user.password = await hashPassword(newPassword);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  return { message: 'Password reset successfully' };
};

/**
 * Log a user out by clearing the stored refresh token
 * We do not fail if the token is already missing because logout should be safe to repeat
 */
export const logoutUser = async ({ refreshToken }) => {
  if (!refreshToken) {
    return {
      message: 'Logged out successfully',
    };
  }

  const user = await User.findOne({ refreshToken }).select('+refreshToken');

  if (user) {
    user.refreshToken = undefined;
    await user.save();
  }

  return {
    message: 'Logged out successfully',
  };
};

/**
 * Validate an access token for other services
 * We verify the JWT signature first, then optionally confirm the user still exists
 * so another service does not trust a token for a deleted account
 */
export const validateAccessToken = async ({ authorizationHeader }) => {
  if (!authorizationHeader) {
    const error = new Error('Unauthorized');
    error.statusCode = 401;
    throw error;
  }

  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    const error = new Error('Unauthorized');
    error.statusCode = 401;
    throw error;
  }

  const decoded = verifyAccessToken(token);

  const user = await User.findById(decoded.userId).select('_id');

  if (!user) {
    const error = new Error('Unauthorized');
    error.statusCode = 401;
    throw error;
  }

  return {
    userId: decoded.userId,
    role: decoded.role,
    message: 'Token is valid',
  };
};


export default {
  registerUser,
  loginUser,
  refreshTokens,
  requestPasswordReset,
  resetPassword,
  logoutUser,
  validateAccessToken,
};
