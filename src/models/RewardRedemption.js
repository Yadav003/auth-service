import mongoose from 'mongoose';
import {
  ALLOWED_REDEMPTION_STATUSES,
  REDEMPTION_STATUSES,
  SUPPORTED_REWARD_BRANDS,
} from '../utils/rewardConfig.js';

const statusHistorySchema = new mongoose.Schema(
  {
    from: {
      type: String,
      enum: ALLOWED_REDEMPTION_STATUSES,
      default: null,
    },
    to: {
      type: String,
      enum: ALLOWED_REDEMPTION_STATUSES,
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    remark: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const rewardRedemptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    brand: {
      type: String,
      required: true,
      enum: SUPPORTED_REWARD_BRANDS,
      lowercase: true,
      trim: true,
      index: true,
    },
    couponAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    pointsUsed: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ALLOWED_REDEMPTION_STATUSES,
      default: REDEMPTION_STATUSES.PENDING,
      index: true,
    },
    processedAt: {
      type: Date,
      default: null,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    adminRemark: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

rewardRedemptionSchema.index({ userId: 1, createdAt: -1 });
rewardRedemptionSchema.index({ status: 1, brand: 1, createdAt: -1 });
rewardRedemptionSchema.index(
  { userId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: REDEMPTION_STATUSES.PENDING },
  }
);

const RewardRedemption = mongoose.model('RewardRedemption', rewardRedemptionSchema);

export default RewardRedemption;
