import express from 'express';
import { history, spin, status } from '../controllers/spinController.js';
import { authenticateSpinUser } from '../middlewares/spinAuth.middleware.js';
import { rejectClientControlledSpinFields } from '../middlewares/validate.middleware.js';

const router = express.Router();

router.use(authenticateSpinUser);

router.get('/status', status);
router.post('/', rejectClientControlledSpinFields, spin);
router.get('/history', history);

export default router;
