import express from 'express';
import {
  editProfile,
  rewardsDashboard,
  showProfile,
} from '../controllers/profileController.js';
import { authenticateSpinUser } from '../middlewares/spinAuth.middleware.js';

const router = express.Router();

router.use(authenticateSpinUser);

/**
 * @route GET /api/profile
 * @access Private
 * @description Return username, read-only email, member since date, profile image,
 * mobile number, address, reward totals, last spin date, and total spins for req.user.id.
 */
router.get('/', showProfile);

/**
 * @route PUT /api/profile
 * @access Private
 * @description Update editable profile fields for req.user.id.
 */
router.put('/', editProfile);

/**
 * @route GET /api/profile/rewards
 * @access Private
 * @description Return reward dashboard stats and canSpin using shared spin helper.
 */
router.get('/rewards', rewardsDashboard);

export default router;
