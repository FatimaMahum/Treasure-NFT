import Withdrawal from '../models/Withdrawal.js';
import User from '../models/User.js';

// User requests a withdrawal
export const requestWithdrawal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, address, network } = req.body;
    if (!amount || !address || !network) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    if (amount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0.' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if (user.walletBalance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance.' });
    }
    // Deduct balance immediately
    user.walletBalance -= amount;
    await user.save();
    const withdrawal = new Withdrawal({
      user: userId,
      amount,
      address,
      network,
      status: 'pending',
    });
    await withdrawal.save();
    res.status(201).json({ success: true, withdrawal });
  } catch (error) {
    console.error('Withdrawal request error:', error);
    res.status(500).json({ success: false, message: 'Failed to request withdrawal.' });
  }
};

// Admin: get all withdrawals
export const getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find().populate('user', 'name email');
    res.status(200).json({ success: true, withdrawals });
  } catch (error) {
    console.error('Get withdrawals error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch withdrawals.' });
  }
};

// Admin: approve/reject withdrawal
export const updateWithdrawalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }
    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) {
      return res.status(404).json({ success: false, message: 'Withdrawal not found.' });
    }
    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Withdrawal already processed.' });
    }
    withdrawal.status = status;
    if (adminNote) withdrawal.adminNote = adminNote;
    await withdrawal.save();
    // If rejected, refund user
    if (status === 'rejected') {
      const user = await User.findById(withdrawal.user);
      if (user) {
        user.walletBalance += withdrawal.amount;
        await user.save();
      }
    }
    res.status(200).json({ success: true, withdrawal });
  } catch (error) {
    console.error('Update withdrawal error:', error);
    res.status(500).json({ success: false, message: 'Failed to update withdrawal.' });
  }
}; 