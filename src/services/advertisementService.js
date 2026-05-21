/**
 * Advertisement Service
 * Handles persistence for the global advertisement banner
 */

import Advertisement from '../models/Advertisement.js';

const requireVisibleFields = (advertisement) => {
  const missing = [];

  if (!advertisement.title) {
    missing.push('title');
  }

  if (!advertisement.websiteUrl) {
    missing.push('websiteUrl');
  }

  if (!advertisement.imageUrl) {
    missing.push('imageUrl');
  }

  if (missing.length > 0) {
    const error = new Error(
      `Advertisement is set to show, but missing fields: ${missing.join(', ')}`
    );
    error.statusCode = 400;
    throw error;
  }
};

export const getAdvertisement = async () => {
  return Advertisement.findOne({ singletonKey: 'global' });
};

export const upsertAdvertisement = async (updates) => {
  const advertisement =
    (await Advertisement.findOne({ singletonKey: 'global' })) ||
    new Advertisement();

  if (updates.title !== undefined) {
    advertisement.title = updates.title;
  }

  if (updates.websiteUrl !== undefined) {
    advertisement.websiteUrl = updates.websiteUrl;
  }

  if (updates.imageUrl !== undefined) {
    advertisement.imageUrl = updates.imageUrl;
  }

  if (updates.show !== undefined) {
    advertisement.show = updates.show;
  }

  if (advertisement.show) {
    requireVisibleFields(advertisement);
  }

  await advertisement.save();

  return advertisement;
};

export default {
  getAdvertisement,
  upsertAdvertisement,
};
