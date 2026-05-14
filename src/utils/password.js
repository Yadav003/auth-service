/**
 * Password Utilities
 * Handles password hashing and comparison using bcrypt
 * Bcrypt is the industry standard for password hashing - it's slow on purpose!
 */

import bcrypt from 'bcrypt';
import { config } from '../config/env.js';

/**
 * Hash a password before saving to the database
 * We never want to store passwords in plain text - if someone hacks our database,
 * all passwords would be exposed. Hashing makes it impossible to reverse and get the original password.
 * Bcrypt is designed to be slow, which makes it harder for hackers to brute force.
 */
export const hashPassword = async (password) => {
  try {
    // Use bcrypt to hash the password with the number of rounds specified in config
    const hashedPassword = await bcrypt.hash(password, config.security.bcryptRounds);
    return hashedPassword;
  } catch (error) {
    throw new Error(`Error hashing password: ${error.message}`);
  }
};

/**
 * Compare a plain text password with a hashed password
 * This is used during login to check if the password the user entered matches what we have stored
 * Returns true if they match, false otherwise
 */
export const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error(`Error comparing passwords: ${error.message}`);
  }
};

export default { hashPassword, comparePassword };
