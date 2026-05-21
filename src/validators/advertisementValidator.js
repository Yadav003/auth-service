/**
 * Advertisement Validators
 * Validation rules for the advertisement configuration
 */

import Joi from 'joi';

const advertisementUpdateSchema = Joi.object({
  title: Joi.string().trim().min(2).max(120),
  websiteUrl: Joi.string().trim().uri({ scheme: ['http', 'https'] }),
  imageUrl: Joi.string().trim().uri({ scheme: ['http', 'https'] }),
  show: Joi.boolean(),
}).min(1);

export const validateAdvertisementUpdate = (data) => {
  return advertisementUpdateSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};

export default {
  validateAdvertisementUpdate,
};
