import mongoose from 'mongoose';

const userWatchedAdSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  adId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ad',
    required: true
  },
  watchedAt: {
    type: Date,
    default: Date.now
  },
  rewarded: {
    type: Boolean,
    default: true
  },
  rewardAmount: {
    type: Number,
    required: true,
    default: 100
  }
});

// Create a compound index to ensure a user can only watch an ad once
userWatchedAdSchema.index({ userId: 1, adId: 1 }, { unique: true });

export default mongoose.model('UserWatchedAd', userWatchedAdSchema); 