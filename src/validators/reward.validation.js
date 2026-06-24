import Joi from 'joi';
import {
  ADMIN_MUTABLE_REDEMPTION_STATUSES,
  REWARD_CONFIG,
  SUPPORTED_REWARD_BRANDS,
} from '../utils/rewardConfig.js';

const brandAmountPairs = Object.entries(REWARD_CONFIG).flatMap(([brand, rules]) =>
  rules.map((rule) => ({ brand, amount: rule.amount }))
);

const redeemSchema = Joi.object({
  brand: Joi.string()
    .trim()
    .lowercase()
    .valid(...SUPPORTED_REWARD_BRANDS)
    .required(),
  amount: Joi.number().integer().positive().required(),
})
  .custom((value, helpers) => {
    const isAllowedPair = brandAmountPairs.some(
      (pair) => pair.brand === value.brand && pair.amount === value.amount
    );

    if (!isAllowedPair) {
      return helpers.error('reward.unsupportedCoupon');
    }

    return value;
  })
  .messages({
    'reward.unsupportedCoupon': 'Selected reward coupon is not supported',
  });

const redemptionListSchema = Joi.object({
  status: Joi.string().trim().uppercase().valid('PENDING', 'APPROVED', 'REJECTED', 'FULFILLED').allow(''),
  brand: Joi.string()
    .trim()
    .lowercase()
    .valid(...SUPPORTED_REWARD_BRANDS)
    .allow(''),
  from: Joi.date().iso(),
  to: Joi.date().iso().min(Joi.ref('from')),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

const updateRedemptionSchema = Joi.object({
  status: Joi.string()
    .trim()
    .uppercase()
    .valid(...ADMIN_MUTABLE_REDEMPTION_STATUSES)
    .required(),
  remark: Joi.string().trim().max(500).allow('').default(''),
});

export const validateRedeemRequest = (data) => {
  return redeemSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};

export const validateRedemptionList = (data) => {
  return redemptionListSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};

export const validateRedemptionUpdate = (data) => {
  return updateRedemptionSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};

export default {
  validateRedeemRequest,
  validateRedemptionList,
  validateRedemptionUpdate,
};
