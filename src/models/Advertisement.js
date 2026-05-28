/**
 * Advertisement Model
 * Stores admin-managed promo banner configurations
 */

import mongoose from 'mongoose';

const advertisementSchema = new mongoose.Schema(
  {
    singletonKey: {
      type: String,
      trim: true,
      unique: true,
      index: true,
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
