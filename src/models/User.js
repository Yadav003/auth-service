/**
 * User Model
 * Defines the user collection structure in MongoDB
 */

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    // Store the user's name
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters'],
      maxlength: [30, 'Name must be at most 30 characters'],
    },
    // Email must be unique so each user has a different email
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    // Password will always be hashed before saving (see the service layer)
    password: {
      type: String,
      required: function () {
        return (this.authProvider || 'local') === 'local';
      },
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't return password by default when querying
    },
    // Track the primary auth provider so we can support OAuth accounts
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    // Store Google subject ID for account linking
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    // Keep a copy of email verification status when provided by OAuth
    emailVerified: {
      type: Boolean,
      default: false,
    },
    // Store refresh token so we can validate it later when user asks for a new access token
    refreshToken: {
      type: String,
      select: false, // Don't return this field by default (it's sensitive)
    },
    // Role-based access control (default: normal user)
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    // Basic account status for admin enable/disable
    status: {
      type: String,
      enum: ['active', 'disabled'],
      default: 'active',
    },
    // Track when user last logged in - useful for security and analytics
    lastLogin: {
      type: Date,
      default: null,
    },
    // We count failed logins so repeated attacks can lock the account temporarily.
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    // When the account is locked we store the unlock time instead of blocking forever.
    lockUntil: {
      type: Date,
      default: null,
    },
    // Accumulated points earned from Daily Spin & Win.
    totalRewardPoints: {
      type: Number,
      default: 0,
      min: [0, 'Reward points cannot be negative'],
    },
    // The last successful spin timestamp. Eligibility is calculated server-side.
    lastSpinDate: {
      type: Date,
      default: null,
    },
    // Store the hashed reset token so we can verify password reset requests safely
    resetPasswordToken: {
      type: String,
      select: false,
    },
    // Keep the reset window short so an old link cannot be reused later
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Create an index on email for faster lookups when checking if user already exists
userSchema.index({ email: 1 });
// Index on refreshToken so we can quickly find a user by their token
userSchema.index({ refreshToken: 1 });
// Index Google ID for faster account lookups
userSchema.index({ googleId: 1 });
// Index the reset token because password reset requests need a fast exact lookup
userSchema.index({ resetPasswordToken: 1 });
// Lock checks happen during login, so an index helps when we need to find locked accounts quickly.
userSchema.index({ lockUntil: 1 });
// Spin status checks and atomic daily spin updates query this field often.
userSchema.index({ lastSpinDate: 1 });

const User = mongoose.model('User', userSchema);

export default User;
