import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  address: {
    type: String,
    required: true
  },
  network: {
    type: String,
    required: true,
    default: 'TRC20'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNote: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  autoProcessAt: {
    type: Date,
    default: function() {
      // Set auto-process time to 24 hours from creation
      return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
  }
});

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);
export default Withdrawal; 