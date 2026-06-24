import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import {
  createRedemptionRequest,
  getRewardsDashboard,
  getUserRedemptionHistory,
  listRewardRedemptions,
  updateRewardRedemptionStatus,
} from '../services/reward.service.js';
import {
  validateRedeemRequest,
  validateRedemptionList,
  validateRedemptionUpdate,
} from '../validators/reward.validation.js';

const throwValidationError = (error) => {
  if (!error) {
    return;
  }

  throw new ApiError(400, error.details.map((detail) => detail.message).join(', '));
};

export const redeemReward = asyncHandler(async (req, res) => {
  const { error, value } = validateRedeemRequest(req.body || {});
  throwValidationError(error);

  const response = await createRedemptionRequest(req.user, value);
  res.status(201).json(response);
});

export const getRewardHistory = asyncHandler(async (req, res) => {
  const history = await getUserRedemptionHistory(req.user);
  res.status(200).json(history);
});

export const getRewardDashboard = asyncHandler(async (req, res) => {
  const dashboard = await getRewardsDashboard(req.user);
  res.status(200).json(dashboard);
});

export const getAdminRewardRedemptions = asyncHandler(async (req, res) => {
  const { error, value } = validateRedemptionList(req.query || {});
  throwValidationError(error);

  const result = await listRewardRedemptions(value);
  res.status(200).json({
    status: 'success',
    message: 'Reward redemptions fetched successfully',
    data: result,
  });
});

export const updateAdminRewardRedemption = asyncHandler(async (req, res) => {
  const { error, value } = validateRedemptionUpdate(req.body || {});
  throwValidationError(error);

  const redemption = await updateRewardRedemptionStatus(req.params.id, req.user, value);
  res.status(200).json({
    status: 'success',
    message: 'Reward redemption updated successfully',
    data: redemption,
  });
});

export default {
  redeemReward,
  getRewardHistory,
  getRewardDashboard,
  getAdminRewardRedemptions,
  updateAdminRewardRedemption,
};
