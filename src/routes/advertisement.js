/**
 * Advertisement Routes
 * Public endpoint for fetching current advertisement status
 */

import express from 'express';
import { getPublicAdvertisement } from '../controllers/advertisementController.js';

const router = express.Router();

router.get('/', getPublicAdvertisement);

export default router;
