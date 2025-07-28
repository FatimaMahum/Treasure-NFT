import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  minAmount: {
    type: Number,
    required: true
  },
  maxAmount: {
    type: Number,
    required: true
  },
  dailyReturnRate: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    default: 30 // days
  },
  features: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Plan = mongoose.model('Plan', planSchema);
export default Plan;
