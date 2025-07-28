import express from 'express';
import { createCryptoCheckout, handleCryptoCallback } from '../controllers/cryptoController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/checkout', protect, createCryptoCheckout);
router.post('/callback', handleCryptoCallback); // No auth needed for webhook

export default router; 