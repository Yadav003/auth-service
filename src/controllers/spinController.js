import asyncHandler from '../utils/asyncHandler.js';
import { getSpinHistory, getSpinStatus, spinDailyReward } from '../services/spinService.js';

export const status = asyncHandler(async (req, res) => {
  const response = await getSpinStatus(req.user);
  res.status(200).json(response);
});

export const spin = asyncHandler(async (req, res) => {
  const response = await spinDailyReward(req.user);
  res.status(200).json(response);
});

export const history = asyncHandler(async (req, res) => {
  const response = await getSpinHistory(req.user);
  res.status(200).json(response);
});

export default {
  status,
  spin,
  history,
};
