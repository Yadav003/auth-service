/**
 * Advertisement Validators
 * Validation rules for the advertisement configuration
 */

import Joi from 'joi';

const advertisementCreateSchema = Joi.object({
  title: Joi.string().trim().min(2).max(120).required(),
  websiteUrl: Joi.string().trim().uri({ scheme: ['http', 'https'] }).required(),
  imageUrl: Joi.string().trim().uri({ scheme: ['http', 'https'] }).required(),
  show: Joi.boolean(),
});

const advertisementUpdateSchema = Joi.object({
  title: Joi.string().trim().min(2).max(120),
  websiteUrl: Joi.string().trim().uri({ scheme: ['http', 'https'] }),
  imageUrl: Joi.string().trim().uri({ scheme: ['http', 'https'] }),
  show: Joi.boolean(),
}).min(1);

export const validateAdvertisementCreate = (data) => {
  return advertisementCreateSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};

export const validateAdvertisementUpdate = (data) => {
  return advertisementUpdateSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};

export default {
  validateAdvertisementCreate,
  validateAdvertisementUpdate,
};
