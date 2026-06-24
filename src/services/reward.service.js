import mongoose from 'mongoose';
import User from '../models/User.js';
import RewardRedemption from '../models/RewardRedemption.js';
import { ApiError } from '../utils/apiError.js';
import {
  REDEMPTION_STATUSES,
  REWARD_CONVERSION_RATE,
  getEligibleCoupons,
  getRewardRule,
} from '../utils/rewardConfig.js';

const mapRedemption = (redemption) => ({
  id: redemption._id.toString(),
  userId: redemption.userId?.toString(),
  email: redemption.email,
  brand: redemption.brand,
  couponAmount: redemption.couponAmount,
  pointsUsed: redemption.pointsUsed,
  status: redemption.status,
  createdAt: redemption.createdAt,
  processedAt: redemption.processedAt,
  processedBy: redemption.processedBy?.toString() || null,
  adminRemark: redemption.adminRemark || '',
});

const isDuplicatePendingError = (error) =>
  error?.code === 11000 && Object.prototype.hasOwnProperty.call(error.keyPattern || {}, 'userId');

export const createRedemptionRequest = async (authUser, { brand, amount }) => {
  const rule = getRewardRule(brand, amount);

  if (!rule) {
    throw new ApiError(400, 'Selected reward coupon is not supported');
  }

  const session = await mongoose.startSession();

  try {
    let createdRedemption;
    let updatedUser;

    await session.withTransaction(async () => {
      const pendingRedemption = await RewardRedemption.findOne({
        userId: authUser.id,
        status: REDEMPTION_STATUSES.PENDING,
      })
        .session(session)
        .select('_id')
        .lean();

      if (pendingRedemption) {
        throw new ApiError(409, 'You already have a pending redemption request.');
      }

      updatedUser = await User.findOneAndUpdate(
        {
          _id: authUser.id,
          status: 'active',
          totalRewardPoints: { $gte: rule.requiredPoints },
        },
        {
          $inc: { totalRewardPoints: -rule.requiredPoints },
        },
        {
          new: true,
          runValidators: true,
          projection: { totalRewardPoints: 1, email: 1 },
          session,
        }
      );

      if (!updatedUser) {
        throw new ApiError(400, 'Insufficient reward points');
      }

      const [redemption] = await RewardRedemption.create(
        [
          {
            userId: authUser.id,
            email: updatedUser.email || authUser.email,
            brand,
            couponAmount: rule.amount,
            pointsUsed: rule.requiredPoints,
            status: REDEMPTION_STATUSES.PENDING,
            statusHistory: [
              {
                from: null,
                to: REDEMPTION_STATUSES.PENDING,
                changedBy: null,
                remark: 'Redemption request created',
              },
            ],
          },
        ],
        { session }
      );

      createdRedemption = redemption;
    });

    return {
      success: true,
      message: 'Redemption request created successfully',
      data: {
        redemptionId: createdRedemption._id.toString(),
        status: createdRedemption.status,
        pointsUsed: createdRedemption.pointsUsed,
        remainingPoints: updatedUser.totalRewardPoints,
      },
    };
  } catch (error) {
    if (isDuplicatePendingError(error)) {
      throw new ApiError(409, 'You already have a pending redemption request.');
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

export const getUserRedemptionHistory = async (authUser) => {
  const redemptions = await RewardRedemption.find({ userId: authUser.id })
    .sort({ createdAt: -1 })
    .select('brand couponAmount pointsUsed status createdAt')
    .lean();

  return redemptions.map((redemption) => ({
    id: redemption._id.toString(),
    brand: redemption.brand,
    couponAmount: redemption.couponAmount,
    pointsUsed: redemption.pointsUsed,
    status: redemption.status,
    createdAt: redemption.createdAt,
  }));
};

export const getRewardsDashboard = async (authUser) => {
  const user = await User.findById(authUser.id).select('totalRewardPoints').lean();

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const availablePoints = user.totalRewardPoints || 0;

  return {
    availablePoints,
    conversionRate: REWARD_CONVERSION_RATE,
    eligibleCoupons: getEligibleCoupons(availablePoints),
  };
};

export const listRewardRedemptions = async ({
  status = '',
  brand = '',
  from,
  to,
  page = 1,
  limit = 20,
}) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
  const query = {};

  if (status) {
    query.status = status;
  }

  if (brand) {
    query.brand = brand;
  }

  if (from || to) {
    query.createdAt = {};

    if (from) {
      query.createdAt.$gte = new Date(from);
    }

    if (to) {
      query.createdAt.$lte = new Date(to);
    }
  }

  const [redemptions, total] = await Promise.all([
    RewardRedemption.find(query)
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean(),
    RewardRedemption.countDocuments(query),
  ]);

  return {
    redemptions: redemptions.map(mapRedemption),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      pages: Math.ceil(total / safeLimit),
    },
  };
};

export const updateRewardRedemptionStatus = async (redemptionId, adminUser, { status, remark = '' }) => {
  if (!mongoose.Types.ObjectId.isValid(redemptionId)) {
    throw new ApiError(400, 'Invalid redemption id');
  }

  const session = await mongoose.startSession();

  try {
    let updatedRedemption;

    await session.withTransaction(async () => {
      const redemption = await RewardRedemption.findById(redemptionId).session(session);

      if (!redemption) {
        throw new ApiError(404, 'Redemption request not found');
      }

      if (redemption.status === status) {
        throw new ApiError(400, `Redemption is already ${status}`);
      }

      if ([REDEMPTION_STATUSES.REJECTED, REDEMPTION_STATUSES.FULFILLED].includes(redemption.status)) {
        throw new ApiError(400, `${redemption.status} redemptions cannot be changed`);
      }

      if (status === REDEMPTION_STATUSES.REJECTED) {
        await User.updateOne(
          { _id: redemption.userId },
          { $inc: { totalRewardPoints: redemption.pointsUsed } },
          { session, runValidators: true }
        );
      }

      const now = new Date();
      const previousStatus = redemption.status;

      redemption.status = status;
      redemption.processedAt = now;
      redemption.processedBy = adminUser.userId || adminUser.id;
      redemption.adminRemark = remark;
      redemption.statusHistory.push({
        from: previousStatus,
        to: status,
        changedBy: adminUser.userId || adminUser.id,
        remark,
        changedAt: now,
      });

      await redemption.save({ session });
      updatedRedemption = redemption;
    });

    return mapRedemption(updatedRedemption);
  } finally {
    await session.endSession();
  }
};

export default {
  createRedemptionRequest,
  getUserRedemptionHistory,
  getRewardsDashboard,
  listRewardRedemptions,
  updateRewardRedemptionStatus,
};
