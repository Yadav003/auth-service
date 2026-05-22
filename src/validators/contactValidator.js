/**
 * Contact Validators
 * Validation rules for contact form submissions
 */

import Joi from 'joi';

const contactSubmissionSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(80)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name must be at most 80 characters',
      'any.required': 'Name is required',
    }),
  email: Joi.string()
    .trim()
    .email()
    .max(254)
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.max': 'Email must be at most 254 characters',
      'any.required': 'Email is required',
    }),
  subject: Joi.string()
    .trim()
    .min(2)
    .max(120)
    .required()
    .messages({
      'string.min': 'Subject must be at least 2 characters',
      'string.max': 'Subject must be at most 120 characters',
      'any.required': 'Subject is required',
    }),
  message: Joi.string()
    .trim()
    .min(10)
    .max(2000)
    .required()
    .messages({
      'string.min': 'Message must be at least 10 characters',
      'string.max': 'Message must be at most 2000 characters',
      'any.required': 'Message is required',
    }),
  phone: Joi.string()
    .trim()
    .pattern(/^[0-9+()\-\.\s]{7,30}$/)
    .empty('')
    .messages({
      'string.pattern.base': 'Phone number format is invalid',
    }),
});

export const validateContactSubmission = (data) => {
  return contactSubmissionSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};

export default {
  validateContactSubmission,
};
