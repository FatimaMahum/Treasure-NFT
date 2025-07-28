import express from 'express';
import { 
  createInvestment, 
  getUserInvestments, 
  getAllInvestments 
} from '../controllers/investmentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create investment
router.post('/', protect, createInvestment);

// Get user's investments
router.get('/my', protect, getUserInvestments);

// Get all investments (admin only)
router.get('/', protect, admin, getAllInvestments);

export default router;
