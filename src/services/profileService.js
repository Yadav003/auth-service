import mongoose from 'mongoose';
import User from '../models/User.js';
import SpinHistory from '../models/SpinHistory.js';
import { ApiError } from '../utils/apiError.js';
import { canUserSpinToday } from '../utils/spin.js';

const toDateOnly = (date) => {
  if (!date) {
    return null;
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.toISOString().slice(0, 10);
};

const getSpinStats = async (userId) => {
  const [stats] = await SpinHistory.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: '$userId',
        totalSpins: { $sum: 1 },
        totalRewardPoints: { $sum: '$pointsWon' },
        lastSpinDate: { $max: '$spinDate' },
      },
    },
  ]);

  return {
    totalSpins: stats?.totalSpins || 0,
    totalRewardPoints: stats?.totalRewardPoints || 0,
    lastSpinDate: stats?.lastSpinDate || null,
  };
};

const getProfileUser = async (userId) => {
  const user = await User.findById(userId).select(
    'name username email profileImage mobileNumber address createdAt status'
  );

  if (!user || user.status === 'disabled') {
    throw new ApiError(404, 'User not found');
  }

  return user;
};

const buildProfileResponse = async (user) => {
  const spinStats = await getSpinStats(user._id.toString());

  return {
    username: user.username || user.name,
    email: user.email,
    profileImage: user.profileImage || '',
    mobileNumber: user.mobileNumber || '',
    address: user.address || '',
    memberSince: toDateOnly(user.createdAt),
    totalRewardPoints: spinStats.totalRewardPoints,
    lastSpinDate: toDateOnly(spinStats.lastSpinDate),
    totalSpins: spinStats.totalSpins,
  };
};

export const getProfile = async (authUser) => {
  const user = await getProfileUser(authUser.id);
  return buildProfileResponse(user);
};

export const updateProfile = async (authUser, updates) => {
  const user = await getProfileUser(authUser.id);

  user.username = updates.username;
  user.name = updates.username;

  if (updates.profileImage !== undefined) {
    user.profileImage = updates.profileImage;
  }

  if (updates.mobileNumber !== undefined) {
    user.mobileNumber = updates.mobileNumber;
  }

  if (updates.address !== undefined) {
    user.address = updates.address;
  }

  await user.save();

  return buildProfileResponse(user);
};

export const getRewardsDashboard = async (authUser) => {
  await getProfileUser(authUser.id);

  const spinStats = await getSpinStats(authUser.id);

  return {
    totalRewardPoints: spinStats.totalRewardPoints,
    totalSpins: spinStats.totalSpins,
    lastSpinDate: toDateOnly(spinStats.lastSpinDate),
    canSpin: canUserSpinToday(spinStats.lastSpinDate),
  };
};

export default {
  getProfile,
  updateProfile,
  getRewardsDashboard,
};
