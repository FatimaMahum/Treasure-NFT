import express from 'express';
import { 
  submitDeposit, 
  getAllDeposits, 
  getUserDeposits, 
  approveDeposit, 
  rejectDeposit, 
  getDepositById 
} from '../controllers/depositController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Submit deposit (user)
router.post('/submit', protect, submitDeposit);

// Get user's deposits (user)
router.get('/user', protect, getUserDeposits);

// Get all deposits (admin only)
router.get('/all', protect, admin, getAllDeposits);

// Get deposit by ID (admin only)
router.get('/:depositId', protect, admin, getDepositById);

// Approve deposit (admin only)
router.put('/:depositId/approve', protect, admin, approveDeposit);

// Reject deposit (admin only)
router.put('/:depositId/reject', protect, admin, rejectDeposit);

export default router; 