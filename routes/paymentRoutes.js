
import express from 'express';
import { createSubscription } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Require authentication for creating a subscription
router.post('/create-subscription', protect, createSubscription);

export default router;
