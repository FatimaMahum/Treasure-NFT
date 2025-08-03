import Ad from '../models/Ad.js';
import UserWatchedAd from '../models/UserWatchedAd.js';
import User from '../models/User.js';
import { sendEmail } from '../services/emailService.js';

// Get random active ads (limit to 6 for variety)
const getAds = async (req, res) => {
  try {
    console.log('🔍 Fetching ads from database...');
    const allAds = await Ad.find({ isActive: true });
    console.log(`📊 Found ${allAds.length} active ads in database`);
    
    if (allAds.length === 0) {
      console.log('⚠️ No ads found in database. Creating sample ads...');
      // Create some sample ads if none exist
      const sampleAds = [
        {
          title: 'Palmolive Pakistan Ad',
          description: 'Watch this amazing Palmolive Pakistan advertisement and earn ₹100!',
          videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
          embedUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
          reward: 100,
          duration: 30,
          isActive: true
        },
        {
          title: 'Beautiful Wear Collection',
          description: 'Check out this stunning fashion collection and earn ₹100!',
          videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
          embedUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
          reward: 100,
          duration: 30,
          isActive: true
        },
        {
          title: 'Golden Pearl Official',
          description: 'Watch this Golden Pearl official advertisement and earn ₹100!',
          videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
          embedUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
          reward: 100,
          duration: 30,
          isActive: true
        }
      ];
      
      const createdAds = await Ad.insertMany(sampleAds);
      console.log(`✅ Created ${createdAds.length} sample ads`);
      allAds.push(...createdAds);
    }
    
    // Shuffle and limit to 6 random ads
    const shuffledAds = allAds.sort(() => 0.5 - Math.random());
    const randomAds = shuffledAds.slice(0, 6);
    
    console.log(`📊 Returning ${randomAds.length} random ads for user ${req.user.id}`);
    
    res.json({
      success: true,
      ads: randomAds,
      totalAds: randomAds.length
    });
  } catch (error) {
    console.error('Error fetching ads:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ads'
    });
  }
};

// Mark ad as watched and reward user
const watchAd = async (req, res) => {
  try {
    const { adId } = req.body;
    const userId = req.user.id;

    // Validate adId
    if (!adId) {
      return res.status(400).json({
        success: false,
        message: 'Ad ID is required'
      });
    }

    // Check if ad exists and is active
    const ad = await Ad.findById(adId);
    if (!ad || !ad.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Ad not found or inactive'
      });
    }

    // Check if user has already watched this ad
    const existingWatch = await UserWatchedAd.findOne({
      userId: userId,
      adId: adId
    });

    if (existingWatch) {
      return res.status(400).json({
        success: false,
        message: 'You have already watched this ad and received the reward'
      });
    }

    // Get user to update wallet
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create transaction to ensure data consistency
    const session = await UserWatchedAd.startSession();
    session.startTransaction();

    try {
      // Record that user watched the ad
      const userWatchedAd = new UserWatchedAd({
        userId: userId,
        adId: adId,
        rewardAmount: ad.reward
      });
      await userWatchedAd.save({ session });

      // Convert ₹100 to USD (₹100 ≈ $1.20 USD)
      const inrToUsd = 0.012; // 1 INR = 0.012 USD (approximate)
      const usdReward = ad.reward * inrToUsd;
      
      // Update user's wallet balance in USD
      const newWalletBalance = (user.walletBalance || 0) + usdReward;
      await User.findByIdAndUpdate(
        userId,
        { walletBalance: newWalletBalance },
        { session }
      );

      // Commit transaction
      await session.commitTransaction();

      // Send email notification
      try {
                 await sendEmail(
           user.email,
           '🎉 Reward Earned Successfully!',
           `
           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
             <h2 style="color: #ffd700;">💰 Reward Earned!</h2>
             <p>Hello ${user.name},</p>
             <p>Congratulations! You have successfully watched the ad "<strong>${ad.title}</strong>" and earned <strong>₹${ad.reward} ($${usdReward.toFixed(2)})</strong>!</p>
             <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
               <h3 style="margin: 0;">💰 New Balance: $${newWalletBalance.toFixed(2)}</h3>
             </div>
             <p>Your reward has been converted to USD and added to your wallet balance. You can now use this amount for investments or withdrawals.</p>
             <p>Keep watching more ads to earn more rewards!</p>
             <p>Best regards,<br>NovaEye Team</p>
           </div>
           `
         );
      } catch (emailError) {
        console.error('Failed to send reward email:', emailError);
        // Don't fail the request if email fails
      }

      console.log(`💰 User ${user.email} earned ₹${ad.reward} ($${usdReward.toFixed(2)}) from ad: ${ad.title}`);
      
      res.json({
        success: true,
        message: `Congratulations! You earned ₹${ad.reward} ($${usdReward.toFixed(2)})!`,
        reward: ad.reward,
        usdReward: usdReward.toFixed(2),
        newBalance: newWalletBalance,
        adTitle: ad.title
      });

    } catch (transactionError) {
      // Rollback transaction on error
      await session.abortTransaction();
      throw transactionError;
    } finally {
      session.endSession();
    }

  } catch (error) {
    console.error('Error watching ad:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process ad reward'
    });
  }
};

// Get user's watched ads
const getUserWatchedAds = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const watchedAds = await UserWatchedAd.find({ userId: userId })
      .populate('adId', 'title description reward')
      .sort({ watchedAt: -1 });

    res.json({
      success: true,
      watchedAds: watchedAds
    });
  } catch (error) {
    console.error('Error fetching user watched ads:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch watched ads'
    });
  }
};

// Admin: Create new ad
const createAd = async (req, res) => {
  try {
    const { title, description, videoUrl, embedUrl, reward, duration } = req.body;

    // Validate required fields
    if (!title || !description || !videoUrl || !embedUrl) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, video URL, and embed URL are required'
      });
    }

    const newAd = new Ad({
      title,
      description,
      videoUrl,
      embedUrl,
      reward: reward || 100,
      duration: duration || 30
    });

    await newAd.save();

    res.status(201).json({
      success: true,
      message: 'Ad created successfully',
      ad: newAd
    });
  } catch (error) {
    console.error('Error creating ad:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create ad'
    });
  }
};

// Admin: Get all ads (including inactive)
const getAllAds = async (req, res) => {
  try {
    const ads = await Ad.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      ads: ads
    });
  } catch (error) {
    console.error('Error fetching all ads:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ads'
    });
  }
};

// Admin: Update ad
const updateAd = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const ad = await Ad.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: 'Ad not found'
      });
    }

    res.json({
      success: true,
      message: 'Ad updated successfully',
      ad: ad
    });
  } catch (error) {
    console.error('Error updating ad:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ad'
    });
  }
};

// Admin: Delete ad
const deleteAd = async (req, res) => {
  try {
    const { id } = req.params;

    const ad = await Ad.findByIdAndDelete(id);

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: 'Ad not found'
      });
    }

    res.json({
      success: true,
      message: 'Ad deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting ad:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete ad'
    });
  }
};

export {
  getAds,
  watchAd,
  getUserWatchedAds,
  createAd,
  getAllAds,
  updateAd,
  deleteAd
}; 