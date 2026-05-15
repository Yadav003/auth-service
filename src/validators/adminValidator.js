/**
 * Admin Validators
 * Validation rules for admin-only APIs
 */

import Joi from 'joi';

const listUsersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().trim().max(100).allow(''),
  role: Joi.string().valid('user', 'admin').allow(''),
});

const createUserSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('user', 'admin').default('user'),
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(2),
  email: Joi.string().email(),
  password: Joi.string().min(6),
  role: Joi.string().valid('user', 'admin'),
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
