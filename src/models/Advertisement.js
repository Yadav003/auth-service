/**
 * Advertisement Model
 * Stores a single, admin-managed promo banner configuration
 */

import mongoose from 'mongoose';

const advertisementSchema = new mongoose.Schema(
  {
    singletonKey: {
      type: String,
      default: 'global',
      unique: true,
      immutable: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 120,
      default: '',
    },
    websiteUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
      default: '',
    },
    imageUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
      default: '',
    },
    show: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Advertisement = mongoose.model('Advertisement', advertisementSchema);

export default Advertisement;
