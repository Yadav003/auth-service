import Joi from 'joi';
import { ApiError } from '../utils/apiError.js';

const forbiddenProfileUpdateFields = [
  'email',
  'memberSince',
  'createdAt',
  'totalRewardPoints',
  'rewardPoints',
  'lastSpinDate',
  'totalSpins',
  'userId',
  'id',
  '_id',
];

const profileUpdateSchema = Joi.object({
  username: Joi.string().trim().min(3).max(50).required().messages({
    'string.empty': 'Username is required',
    'string.min': 'Username must be at least 3 characters',
    'string.max': 'Username must be at most 50 characters',
    'any.required': 'Username is required',
  }),
  profileImage: Joi.string()
    .trim()
    .uri({ scheme: ['http', 'https'] })
    .allow(null, '')
    .optional()
    .messages({
      'string.uri': 'Profile image must be a valid URL',
    }),
  mobileNumber: Joi.string()
    .trim()
    .max(15)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Mobile number must be at most 15 characters',
    }),
  address: Joi.string()
    .trim()
    .max(255)
    .allow(null, '')
    .optional()
    .messages({
      'string.max': 'Address must be at most 255 characters',
    }),
})
  .unknown(false)
  .messages({
    'object.unknown': 'Field "{{#label}}" is not allowed',
  });

export const validateProfileUpdate = (payload = {}) => {
  const forbiddenField = forbiddenProfileUpdateFields.find((field) =>
    Object.prototype.hasOwnProperty.call(payload, field)
  );

  if (forbiddenField) {
    throw new ApiError(400, `Field "${forbiddenField}" is not allowed`);
  }

  const { error, value } = profileUpdateSchema.validate(payload, {
    abortEarly: false,
    stripUnknown: false,
  });

  if (error) {
    const message = error.details.map((detail) => detail.message).join(', ');
    throw new ApiError(400, message);
  }

  return value;
};

export default {
  validateProfileUpdate,
};
