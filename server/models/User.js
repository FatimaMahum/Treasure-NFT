import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  whatsapp: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  walletBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  lastOrderId: {
    type: String,
    default: null
  },
  // Pending investment for Easypaisa payments
  pendingInvestment: {
    amount: {
      type: Number,
      default: null
    },
    planId: {
      type: String,
      default: null
    },
    orderRefNum: {
      type: String,
      default: null
    },
    timestamp: {
      type: Date,
      default: null
    }
  },
  // Pending crypto transaction
  pendingCryptoTransaction: {
    amount: {
      type: Number,
      default: null
    },
    purpose: {
      type: String,
      enum: ['investment', 'wallet_topup'],
      default: null
    },
    planId: {
      type: String,
      default: null
    },
    timestamp: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: null
    }
  },
  // Referral System Fields
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  totalReferrals: {
    type: Number,
    default: 0
  },
  activeReferrals: {
    type: Number,
    default: 0
  },
  totalCommissions: {
    type: Number,
    default: 0
  },
  pendingCommissions: {
    type: Number,
    default: 0
  },
  resetPasswordCode: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash the password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Only hash if password is new or changed
  
  // Check if password is already hashed (starts with $2b$)
  if (this.password.startsWith('$2b$')) {
    return next(); // Password is already hashed, skip hashing
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// Generate referral code before saving (if not exists)
userSchema.pre('save', async function (next) {
  if (!this.referralCode) {
    this.referralCode = this.generateReferralCode();
  }
  return next();
});

// Method to compare passwords during login
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate referral code
userSchema.methods.generateReferralCode = function() {
  return 'REF' + this._id.toString().slice(-6).toUpperCase() + Math.random().toString(36).substr(2, 3).toUpperCase();
};

// Method to get referral chain (up to 3 levels)
userSchema.methods.getReferralChain = async function() {
  const chain = [];
  let currentUser = this;
  
  for (let i = 0; i < 3; i++) {
    if (currentUser.referrer) {
      const referrer = await User.findById(currentUser.referrer).select('name email referralCode');
      if (referrer) {
        chain.push({
          level: i + 1,
          user: referrer,
          commissionRate: i === 0 ? 0.10 : i === 1 ? 0.05 : 0.03
        });
        currentUser = referrer;
      } else {
        break;
      }
    } else {
      break;
    }
  }
  
  return chain;
};

const User = mongoose.model('User', userSchema);
export default User;
