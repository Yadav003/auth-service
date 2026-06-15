import User from '../models/User.js';
import SpinHistory from '../models/SpinHistory.js';
import {
  canUserSpinToday,
  getCurrentSpinWindowStart,
  getNextSpinTime,
  getWeightedReward,
} from '../utils/spin.js';
import { ApiError } from '../utils/apiError.js';

const mapStatus = (user) => {
  const canSpin = canUserSpinToday(user.lastSpinDate);

  return {
    success: true,
    canSpin,
    totalPoints: user.totalRewardPoints || 0,
    lastSpinDate: user.lastSpinDate || null,
    nextSpinTime: canSpin ? null : getNextSpinTime(),
  };
};

export const getSpinStatus = async (authUser) => {
  const user = await User.findById(authUser.id).select('totalRewardPoints lastSpinDate');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return mapStatus(user);
};

export const spinDailyReward = async (authUser) => {
  const reward = getWeightedReward();
  const spinDate = new Date();
  const todayStart = getCurrentSpinWindowStart();

  const updatedUser = await User.findOneAndUpdate(
    {
      _id: authUser.id,
      $or: [
        { lastSpinDate: null },
        { lastSpinDate: { $exists: false } },
        { lastSpinDate: { $lt: todayStart } },
      ],
    },
    {
      $inc: { totalRewardPoints: reward.points },
      $set: { lastSpinDate: spinDate },
    },
    {
      new: true,
      runValidators: true,
      projection: { totalRewardPoints: 1, lastSpinDate: 1 },
    }
  );

  if (!updatedUser) {
    throw new ApiError(409, "You have already used today's spin.");
  }

  await SpinHistory.create({
    userId: authUser.id,
    email: authUser.email,
    rewardName: reward.name,
    pointsWon: reward.points,
    spinDate,
  });

  return {
    success: true,
    reward: reward.name,
    pointsWon: reward.points,
    totalPoints: updatedUser.totalRewardPoints,
  };
};

export const getSpinHistory = async (authUser) => {
  const history = await SpinHistory.find({ userId: authUser.id })
    .sort({ spinDate: -1, createdAt: -1 })
    .select('rewardName pointsWon spinDate createdAt')
    .lean();

  return {
    success: true,
    history: history.map((spin) => ({
      id: spin._id.toString(),
      rewardName: spin.rewardName,
      pointsWon: spin.pointsWon,
      spinDate: spin.spinDate,
      createdAt: spin.createdAt,
    })),
  };
};

export default {
  getSpinStatus,
  spinDailyReward,
  getSpinHistory,
};
