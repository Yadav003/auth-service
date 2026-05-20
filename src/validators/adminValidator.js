/**
 * Admin Validators
 * Validation rules for admin-only APIs
 */

import Joi from 'joi';

const listUsersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(100).allow(''),
  role: Joi.string().valid('user', 'admin').allow(''),
  loginProvider: Joi.string().valid('local', 'google', 'normal').allow(''),
  status: Joi.string().valid('active', 'disabled').allow(''),
});

const createUserSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('user', 'admin').required(),
  status: Joi.string().valid('active', 'disabled').default('active'),
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(3).max(30),
  email: Joi.string().email(),
  password: Joi.string().min(8),
  role: Joi.string().valid('user', 'admin'),
  status: Joi.string().valid('active', 'disabled'),
  lockUntil: Joi.date().allow(null),
}).min(1);

export const validateListUsers = (data) => {
  return listUsersSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};

export const validateCreateUser = (data) => {
  return createUserSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};

export const validateUpdateUser = (data) => {
  return updateUserSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};

export default {
  validateListUsers,
  validateCreateUser,
  validateUpdateUser,
};
