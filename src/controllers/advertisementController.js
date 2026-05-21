/**
 * Advertisement Controller
 * Public and admin endpoints for the advertisement banner
 */

import {
  getAdvertisement,
  upsertAdvertisement,
} from '../services/advertisementService.js';
import { validateAdvertisementUpdate } from '../validators/advertisementValidator.js';

const toAdminPayload = (advertisement) => {
  if (!advertisement) {
    return {
      id: null,
      title: '',
      websiteUrl: '',
      imageUrl: '',
      show: false,
      updatedAt: null,
    };
  }

  return {
    id: advertisement._id?.toString(),
    title: advertisement.title || '',
    websiteUrl: advertisement.websiteUrl || '',
    imageUrl: advertisement.imageUrl || '',
    show: Boolean(advertisement.show),
    updatedAt: advertisement.updatedAt || null,
  };
};

const toPublicPayload = (advertisement) => {
  if (!advertisement || !advertisement.show) {
    return { show: false };
  }

  return {
    show: true,
    title: advertisement.title,
    websiteUrl: advertisement.websiteUrl,
    imageUrl: advertisement.imageUrl,
  };
};

export const getPublicAdvertisement = async (req, res, next) => {
  try {
    const advertisement = await getAdvertisement();

    res.status(200).json({
      status: 'success',
      message: 'Advertisement status',
      data: toPublicPayload(advertisement),
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminAdvertisement = async (req, res, next) => {
  try {
    const advertisement = await getAdvertisement();

    res.status(200).json({
      status: 'success',
      message: 'Advertisement configuration',
      data: toAdminPayload(advertisement),
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdvertisement = async (req, res, next) => {
  try {
    const { error, value } = validateAdvertisementUpdate(req.body || {});

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errorMessages,
      });
    }

    const advertisement = await upsertAdvertisement(value);

    res.status(200).json({
      status: 'success',
      message: 'Advertisement updated successfully',
      data: toAdminPayload(advertisement),
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getPublicAdvertisement,
  getAdminAdvertisement,
  updateAdvertisement,
};
