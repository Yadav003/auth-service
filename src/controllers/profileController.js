import asyncHandler from '../utils/asyncHandler.js';
import {
  getProfile,
  getRewardsDashboard,
  updateProfile,
} from '../services/profileService.js';
import { validateProfileUpdate } from '../validators/profileValidator.js';

/**
 * GET /api/profile
 * Loads authenticated user's profile from req.user.id.
 */
export const showProfile = asyncHandler(async (req, res) => {
  const profile = await getProfile(req.user);

  res.status(200).json({
    success: true,
    profile,
  });
});

/**
 * PUT /api/profile
 * Updates editable profile fields for the authenticated user.
 */
export const editProfile = asyncHandler(async (req, res) => {
  const updates = validateProfileUpdate(req.body);
  const profile = await updateProfile(req.user, updates);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    profile,
  });
});

/**
 * GET /api/profile/rewards
 * Loads reward stats and spin eligibility for the authenticated user.
 */
export const rewardsDashboard = asyncHandler(async (req, res) => {
  const data = await getRewardsDashboard(req.user);

  res.status(200).json({
    success: true,
    data,
  });
});

export default {
  showProfile,
  editProfile,
  rewardsDashboard,
};
