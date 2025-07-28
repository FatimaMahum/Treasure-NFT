import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { initiatePayment, handlePaymentSuccess, getWalletBalance } from '../controllers/paymentController.js';

const router = express.Router();

// Get wallet balance
router.get('/wallet/balance', protect, getWalletBalance);

// Initiate payment
router.post('/initiate', protect, initiatePayment);

// Payment success callback
router.post('/success', protect, handlePaymentSuccess);

export default router; 