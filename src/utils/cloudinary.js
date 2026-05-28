/**
 * Cloudinary Upload Helper
 * Uploads advertisement images and returns the hosted URL.
 */

import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/env.js';

let isConfigured = false;

const ensureCloudinaryConfigured = () => {
  if (isConfigured) {
    return;
  }

  const { cloudName, apiKey, apiSecret } = config.cloudinary;

  if (!cloudName || !apiKey || !apiSecret) {
    const error = new Error('Cloudinary is not configured');
    error.statusCode = 500;
    throw error;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  isConfigured = true;
};

export const uploadAdvertisementImage = async (file) => {
  if (!file?.buffer) {
    const error = new Error('Image file is required');
    error.statusCode = 400;
    throw error;
  }

  ensureCloudinaryConfigured();

  const uploadOptions = {
    folder: config.cloudinary.folder || 'ads',
    resource_type: 'image',
    use_filename: true,
    unique_filename: true,
  };

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        const uploadError = new Error('Failed to upload image');
        uploadError.statusCode = 502;
        return reject(uploadError);
      }

      return resolve(result?.secure_url || result?.url);
    });

    stream.end(file.buffer);
  });
};

export default {
  uploadAdvertisementImage,
};
