import express from 'express';
import { requestWithdrawal, getAllWithdrawals, updateWithdrawalStatus } from '../controllers/withdrawalController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// User requests withdrawal
router.post('/', protect, requestWithdrawal);
// Admin views all withdrawals
router.get('/', protect, admin, getAllWithdrawals);
// Admin approves/rejects withdrawal
router.patch('/:id', protect, admin, updateWithdrawalStatus);

export default router; 