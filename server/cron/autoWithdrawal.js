import cron from 'node-cron';
import Withdrawal from '../models/Withdrawal.js';
import User from '../models/User.js';

// Auto-process withdrawals after 24 hours
const processAutoWithdrawals = async () => {
  try {
    console.log('🔄 Checking for withdrawals to auto-process...');
    
    // Find pending withdrawals ready for auto-processing
    const now = new Date();
    
    const pendingWithdrawals = await Withdrawal.find({
      status: 'pending',
      autoProcessAt: { $lte: now }
    }).populate('user', 'name email');
    
    console.log(`📊 Found ${pendingWithdrawals.length} withdrawals to process`);
    
    for (const withdrawal of pendingWithdrawals) {
      try {
        // Update withdrawal status to approved (auto-processed)
        withdrawal.status = 'approved';
        withdrawal.adminNote = 'Automatically processed after 24 hours';
        await withdrawal.save();
        
        console.log(`✅ Auto-processed withdrawal: $${withdrawal.amount} for ${withdrawal.user.email} to ${withdrawal.address}`);
        
        // Here you would integrate with your USDT payment system
        // For now, we just mark it as approved
        // In production, you would:
        // 1. Call your USDT payment API
        // 2. Send USDT to withdrawal.address
        // 3. Update status based on payment result
        
      } catch (error) {
        console.error(`❌ Error processing withdrawal ${withdrawal._id}:`, error);
        
        // If auto-processing fails, mark as rejected and refund user
        withdrawal.status = 'rejected';
        withdrawal.adminNote = 'Auto-processing failed - refunded to user';
        await withdrawal.save();
        
        // Refund the user
        const user = await User.findById(withdrawal.user._id);
        if (user) {
          user.walletBalance += withdrawal.amount;
          await user.save();
          console.log(`💰 Refunded $${withdrawal.amount} to ${user.email}`);
        }
      }
    }
    
    console.log('✅ Auto-withdrawal processing completed');
    
  } catch (error) {
    console.error('❌ Auto-withdrawal processing error:', error);
  }
};

// Run every hour to check for withdrawals to process
const startAutoWithdrawalCron = () => {
  console.log('🚀 Starting auto-withdrawal cron job...');
  
  // Run every hour
  cron.schedule('0 * * * *', processAutoWithdrawals, {
    scheduled: true,
    timezone: "UTC"
  });
  
  // Also run immediately on startup to process any overdue withdrawals
  processAutoWithdrawals();
};

export default startAutoWithdrawalCron; 