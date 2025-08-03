import express from 'express';
import { createInvestment, getUserInvestments, getAllInvestments } from '../controllers/investmentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create new investment (user)
router.post('/create', protect, createInvestment);

// Get user's investments (user)
router.get('/user', protect, getUserInvestments);

// Get all investments (admin only)
router.get('/all', protect, admin, getAllInvestments);

export default router;
