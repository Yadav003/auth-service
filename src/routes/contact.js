/**
 * Contact Routes
 * Public endpoint for contact form submissions
 */

import express from 'express';
import { submitContact } from '../controllers/contactController.js';

const router = express.Router();

router.post('/', submitContact);

export default router;
