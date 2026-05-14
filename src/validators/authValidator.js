/**
 * Auth Validators
 * Defines validation rules for authentication endpoints
 * We use Joi to make sure the data coming from users is clean and safe
 */

import Joi from 'joi';

/**
 * Validation schema for user registration
 * This checks that the user provided valid email, password, and name
 */
const registerSchema = Joi.object({
  // Email must be a valid email format
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  // Password needs at least 6 characters for basic security
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required',
    }),
  // Name is required and should be at least 2 characters
  name: Joi.string()
    .min(2)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'any.required': 'Name is required',
    }),
});

/**
 * Validation schema for user login
 * This checks that the user provided email and password
 */
const loginSchema = Joi.object({
  // Email must be a valid email format
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  // Password is required (we don't validate length here - if it's wrong, the DB query will fail)
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required',
    }),
});

/**
 * Validate registration data
 * This function takes the data from the request and checks it against our rules
 * Returns the validated data if everything is good, or an error if something is wrong
 */
export const validateRegister = (data) => {
  return registerSchema.validate(data, {
    abortEarly: false, // Return all errors, not just the first one
    stripUnknown: true, // Ignore any extra fields the user sends
  });
};

/**
 * Validate login data
 * Checks that email and password are provided
 */
export const validateLogin = (data) => {
  return loginSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};

/**
 * Validation schema for refresh token
 * Just checks that a refresh token was provided
 */
const refreshTokenSchema = Joi.object({
  // Refresh token can come from body
  refreshToken: Joi.string()
    .required()
    .messages({
      'any.required': 'Refresh token is required',
    }),
});

/**
 * Validate refresh token request
 */
export const validateRefreshToken = (data) => {
  return refreshTokenSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};

/**
 * Validation schema for forgot password
 * We only need an email address here because the reset link is sent out of band
 */
const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
});

/**
 * Validate forgot password request
 */
export const validateForgotPassword = (data) => {
  return forgotPasswordSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};

/**
 * Validation schema for reset password
 * The token proves the user owns the reset link, and the new password replaces the old one
 */
const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Reset token is required',
    }),
  newPassword: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'New password is required',
    }),
});

/**
 * Validate reset password request
 */
export const validateResetPassword = (data) => {
  return resetPasswordSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};

export default {
  validateRegister,
  validateLogin,
  validateRefreshToken,
  validateForgotPassword,
  validateResetPassword,
};
