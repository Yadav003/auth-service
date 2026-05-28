/**
 * Advertisement Controller
 * Public and admin endpoints for the advertisement banner
 */

import {
  getAdvertisement,
  upsertAdvertisement,
  listAdvertisements,
  listVisibleAdvertisements,
  createAdvertisement as createAdvertisementEntry,
  updateAdvertisementById as updateAdvertisementEntry,
  deleteAdvertisementById as deleteAdvertisementEntry,
} from '../services/advertisementService.js';
import {
  validateAdvertisementCreate,
  validateAdvertisementUpdate,
} from '../validators/advertisementValidator.js';

const toAdminPayload = (advertisement) => {
  if (!advertisement) {
    return {
      id: null,
      title: '',
      websiteUrl: '',
      imageUrl: '',
      show: false,
      createdAt: null,
      updatedAt: null,
    };
  }

  return {
    id: advertisement._id?.toString(),
    title: advertisement.title || '',
    websiteUrl: advertisement.websiteUrl || '',
    imageUrl: advertisement.imageUrl || '',
    show: Boolean(advertisement.show),
    createdAt: advertisement.createdAt || null,
    updatedAt: advertisement.updatedAt || null,
  };
};

const toPublicItemPayload = (advertisement) => {
  return {
    id: advertisement._id?.toString(),
    title: advertisement.title,
    websiteUrl: advertisement.websiteUrl,
    imageUrl: advertisement.imageUrl,
  };
};

const toPublicPayload = (advertisements) => {
  const ads = advertisements.map(toPublicItemPayload);
  const primaryAd = ads[0];

  if (!primaryAd) {
    return { show: false, ads: [] };
  }

  return {
    show: true,
    title: primaryAd.title,
    websiteUrl: primaryAd.websiteUrl,
    imageUrl: primaryAd.imageUrl,
    ads,
  };
};

export const getPublicAdvertisement = async (req, res, next) => {
  try {
    const advertisements = await listVisibleAdvertisements();

    res.status(200).json({
      status: 'success',
      message: 'Advertisement status',
      data: toPublicPayload(advertisements),
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

export const getAdminAdvertisements = async (req, res, next) => {
  try {
    const advertisements = await listAdvertisements();

    res.status(200).json({
      status: 'success',
      message: 'Advertisements fetched successfully',
      data: {
        ads: advertisements.map(toAdminPayload),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createAdvertisement = async (req, res, next) => {
  try {
    const { error, value } = validateAdvertisementCreate(req.body || {});

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errorMessages,
      });
    }

    const advertisement = await createAdvertisementEntry(value);

    res.status(201).json({
      status: 'success',
      message: 'Advertisement created successfully',
      data: toAdminPayload(advertisement),
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdvertisementById = async (req, res, next) => {
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

    const advertisement = await updateAdvertisementEntry(
      req.params.advertisementId,
      value
    );

    res.status(200).json({
      status: 'success',
      message: 'Advertisement updated successfully',
      data: toAdminPayload(advertisement),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAdvertisement = async (req, res, next) => {
  try {
    const result = await deleteAdvertisementEntry(req.params.advertisementId);

    res.status(200).json({
      status: 'success',
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getPublicAdvertisement,
  getAdminAdvertisement,
  updateAdvertisement,
  getAdminAdvertisements,
  createAdvertisement,
  updateAdvertisementById,
  deleteAdvertisement,
};
