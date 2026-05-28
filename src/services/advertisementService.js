/**
 * Advertisement Service
 * Handles persistence for advertisement banners
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
    new Advertisement({ singletonKey: 'global' });

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

export const listAdvertisements = async () => {
  return Advertisement.find().sort({ createdAt: -1 });
};

export const listVisibleAdvertisements = async () => {
  return Advertisement.find({ show: true }).sort({ updatedAt: -1 });
};

export const createAdvertisement = async (payload) => {
  const advertisement = new Advertisement();

  if (!advertisement.singletonKey) {
    advertisement.singletonKey = advertisement._id.toString();
  }

  if (payload.title !== undefined) {
    advertisement.title = payload.title;
  }

  if (payload.websiteUrl !== undefined) {
    advertisement.websiteUrl = payload.websiteUrl;
  }

  if (payload.imageUrl !== undefined) {
    advertisement.imageUrl = payload.imageUrl;
  }

  if (payload.show !== undefined) {
    advertisement.show = payload.show;
  }

  if (advertisement.show) {
    requireVisibleFields(advertisement);
  }

  await advertisement.save();

  return advertisement;
};

export const updateAdvertisementById = async (advertisementId, updates) => {
  const advertisement = await Advertisement.findById(advertisementId);

  if (!advertisement) {
    const error = new Error('Advertisement not found');
    error.statusCode = 404;
    throw error;
  }

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

export const deleteAdvertisementById = async (advertisementId) => {
  const advertisement = await Advertisement.findById(advertisementId);

  if (!advertisement) {
    const error = new Error('Advertisement not found');
    error.statusCode = 404;
    throw error;
  }

  await advertisement.deleteOne();

  return { message: 'Advertisement deleted successfully' };
};

export default {
  getAdvertisement,
  upsertAdvertisement,
  listAdvertisements,
  listVisibleAdvertisements,
  createAdvertisement,
  updateAdvertisementById,
  deleteAdvertisementById,
};
