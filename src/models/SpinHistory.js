import mongoose from 'mongoose';

const spinHistorySchema = new mongoose.Schema(
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
    rewardName: {
      type: String,
      required: true,
      trim: true,
    },
    pointsWon: {
      type: Number,
      required: true,
      min: 0,
    },
    spinDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

spinHistorySchema.index({ userId: 1, spinDate: -1 });

const SpinHistory = mongoose.model('SpinHistory', spinHistorySchema);

export default SpinHistory;
