import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  investedAmount: {
    type: Number,
    required: true
  },
  totalReturned: {
    type: Number,
    default: 0
  },
  dailyReturn: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  paymentMethod: {
    type: String,
    enum: ['easypaisa', 'wallet', 'crypto'],
    default: 'easypaisa'
  },
  transactionId: {
    type: String,
    required: true
  }
});

const Investment = mongoose.model('Investment', investmentSchema);
export default Investment;
