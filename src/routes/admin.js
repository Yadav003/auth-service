/**
 * Admin Routes
 * Admin-only APIs for user management and dashboard
 */

import express from 'express';
import { verifyAccessToken } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import {
  getDashboard,
  getUsers,
  getContacts,
  getUser,
  createUserHandler,
  updateUserHandler,
  deleteUserHandler,
  deleteContactHandler,
  adminLogout,
} from '../controllers/adminController.js';
import {
  getAdminAdvertisement,
  updateAdvertisement,
  getAdminAdvertisements,
  createAdvertisement,
  updateAdvertisementById,
  deleteAdvertisement,
} from '../controllers/advertisementController.js';
import { uploadAdvertisementImage } from '../middlewares/uploadImage.middleware.js';

const router = express.Router();

router.use(verifyAccessToken, authorizeRoles('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.get('/contacts', getContacts);
router.delete('/contacts/:contactId', deleteContactHandler);
router.get('/users/:userId', getUser);
router.post('/users', createUserHandler);
router.patch('/users/:userId', updateUserHandler);
router.delete('/users/:userId', deleteUserHandler);
router.post('/logout', adminLogout);
router.get('/advertisement', getAdminAdvertisement);
router.patch('/advertisement', uploadAdvertisementImage, updateAdvertisement);
router.get('/advertisements', getAdminAdvertisements);
router.post('/advertisements', uploadAdvertisementImage, createAdvertisement);
router.patch(
  '/advertisements/:advertisementId',
  uploadAdvertisementImage,
  updateAdvertisementById
);
router.delete('/advertisements/:advertisementId', deleteAdvertisement);

export default router;
