import express from 'express';
import { 
  getReferralDashboard, 
  applyReferralCode, 
  getReferralLink,
  getReferralStats
} from '../controllers/referralController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get user's referral dashboard data
router.get('/dashboard', protect, getReferralDashboard);

// Get referral statistics
router.get('/stats', protect, getReferralStats);

// Apply referral code
router.post('/apply-code', protect, applyReferralCode);

// Get user's referral link
router.get('/link', protect, getReferralLink);

export default router; 