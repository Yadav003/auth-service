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
  getUser,
  createUserHandler,
  updateUserHandler,
  deleteUserHandler,
  adminLogout,
} from '../controllers/adminController.js';
import {
  getAdminAdvertisement,
  updateAdvertisement,
} from '../controllers/advertisementController.js';

const router = express.Router();

router.use(verifyAccessToken, authorizeRoles('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.get('/users/:userId', getUser);
router.post('/users', createUserHandler);
router.patch('/users/:userId', updateUserHandler);
router.delete('/users/:userId', deleteUserHandler);
router.post('/logout', adminLogout);
router.get('/advertisement', getAdminAdvertisement);
router.patch('/advertisement', updateAdvertisement);

export default router;
