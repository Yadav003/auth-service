import express from 'express';
import {
  getRewardDashboard,
  getRewardHistory,
  redeemReward,
} from '../controllers/reward.controller.js';
import { authenticateRewardUser } from '../middlewares/rewardAuth.middleware.js';

const router = express.Router();

router.use(authenticateRewardUser);

router.post('/redeem', redeemReward);
router.get('/history', getRewardHistory);
router.get('/dashboard', getRewardDashboard);

export default router;
