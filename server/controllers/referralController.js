import User from "../models/User.js";
import Investment from "../models/Investment.js";

// Get user's referral dashboard data
export const getReferralDashboard = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Get direct referrals (level 1)
    const directReferrals = await User.find({ referrer: userId })
      .select('name email createdAt walletBalance')
      .sort({ createdAt: -1 });

    // Get all team members (up to 3 levels)
    const teamMembers = await getAllTeamMembers(userId);

    // Calculate active investors (users with investments)
    const activeInvestors = await User.aggregate([
      { $match: { referrer: user._id } },
      {
        $lookup: {
          from: 'investments',
          localField: '_id',
          foreignField: 'user',
          as: 'investments'
        }
      },
      {
        $match: {
          'investments.0': { $exists: true }
        }
      },
      {
        $count: 'activeCount'
      }
    ]);

    const activeCount = activeInvestors.length > 0 ? activeInvestors[0].activeCount : 0;

    // Calculate commissions
    const commissionData = await calculateCommissions(userId);

    // Get referral chain (who referred this user)
    const referralChain = await user.getReferralChain();

    res.status(200).json({
      success: true,
      data: {
        user: {
          name: user.name,
          email: user.email,
          referralCode: user.referralCode,
          totalReferrals: user.totalReferrals,
          activeReferrals: activeCount,
          totalCommissions: user.totalCommissions,
          pendingCommissions: user.pendingCommissions
        },
        directReferrals,
        teamMembers,
        referralChain,
        commissionData
      }
    });

  } catch (error) {
    console.error("Referral dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch referral data"
    });
  }
};

// Get all team members (up to 3 levels)
const getAllTeamMembers = async (userId) => {
  const teamMembers = [];
  
  // Level 1 (direct referrals)
  const level1 = await User.find({ referrer: userId })
    .select('name email createdAt walletBalance')
    .sort({ createdAt: -1 });
  
  teamMembers.push(...level1.map(user => ({ ...user.toObject(), level: 1 })));
  
  // Level 2
  for (const member of level1) {
    const level2 = await User.find({ referrer: member._id })
      .select('name email createdAt walletBalance')
      .sort({ createdAt: -1 });
    
    teamMembers.push(...level2.map(user => ({ ...user.toObject(), level: 2 })));
    
    // Level 3
    for (const member2 of level2) {
      const level3 = await User.find({ referrer: member2._id })
        .select('name email createdAt walletBalance')
        .sort({ createdAt: -1 });
      
      teamMembers.push(...level3.map(user => ({ ...user.toObject(), level: 3 })));
    }
  }
  
  return teamMembers;
};

// Calculate commissions for a user
const calculateCommissions = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return { total: 0, pending: 0, breakdown: [] };

  let totalCommissions = 0;
  let pendingCommissions = 0;
  const breakdown = [];

  // Get all investments from team members
  const teamInvestments = await Investment.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userData'
      }
    },
    {
      $match: {
        'userData.referrer': user._id
      }
    }
  ]);

  for (const investment of teamInvestments) {
    const investor = await User.findById(investment.user);
    if (!investor) continue;

    // Calculate commission based on level
    const level = await getReferralLevel(userId, investment.user);
    if (level <= 3) {
      const commissionRate = level === 1 ? 0.10 : level === 2 ? 0.05 : 0.03;
      const commission = investment.investedAmount * commissionRate;
      
      totalCommissions += commission;
      pendingCommissions += commission; // For now, all commissions are pending
      
      breakdown.push({
        level,
        investor: investor.name,
        investmentAmount: investment.investedAmount,
        commissionRate: commissionRate * 100,
        commission
      });
    }
  }

  return {
    total: totalCommissions,
    pending: pendingCommissions,
    breakdown
  };
};

// Get referral level between two users
const getReferralLevel = async (referrerId, userId) => {
  let level = 0;
  let currentUser = await User.findById(userId);
  
  while (currentUser && currentUser.referrer) {
    level++;
    if (currentUser.referrer.toString() === referrerId.toString()) {
      return level;
    }
    currentUser = await User.findById(currentUser.referrer);
  }
  
  return 0; // No relationship
};

// Apply referral code during registration
export const applyReferralCode = async (req, res) => {
  const { referralCode } = req.body;
  const userId = req.user.id;

  try {
    // Find user with this referral code
    const referrer = await User.findOne({ referralCode });
    if (!referrer) {
      return res.status(400).json({
        success: false,
        message: "Invalid referral code"
      });
    }

    // Check if user already has a referrer
    const user = await User.findById(userId);
    if (user.referrer) {
      return res.status(400).json({
        success: false,
        message: "Referral code already applied"
      });
    }

    // Check if trying to refer themselves
    if (referrer._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot refer yourself"
      });
    }

    // Update user with referrer
    user.referrer = referrer._id;
    await user.save();

    // Update referrer's total referrals
    referrer.totalReferrals += 1;
    await referrer.save();

    res.status(200).json({
      success: true,
      message: "Referral code applied successfully"
    });

  } catch (error) {
    console.error("Apply referral code error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to apply referral code"
    });
  }
};

// Get user's referral link
export const getReferralLink = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const referralLink = `${process.env.FRONTEND_URL}/register?ref=${user.referralCode}`;

    res.status(200).json({
      success: true,
      referralLink,
      referralCode: user.referralCode
    });

  } catch (error) {
    console.error("Get referral link error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get referral link"
    });
  }
};

// Get referral statistics for dashboard
export const getReferralStats = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Get total team members (all levels)
    const teamMembers = await getAllTeamMembers(userId);
    const totalTeamMembers = teamMembers.length;

    // Get active team members (those with investments)
    const activeTeamMembers = await User.aggregate([
      { $match: { referrer: user._id } },
      {
        $lookup: {
          from: 'investments',
          localField: '_id',
          foreignField: 'user',
          as: 'investments'
        }
      },
      {
        $match: {
          'investments.0': { $exists: true }
        }
      },
      {
        $count: 'activeCount'
      }
    ]);

    const activeTeamCount = activeTeamMembers.length > 0 ? activeTeamMembers[0].activeCount : 0;

    res.status(200).json({
      success: true,
      totalReferrals: user.totalReferrals || 0,
      totalTeamMembers,
      activeTeamMembers: activeTeamCount,
      totalCommissions: user.totalCommissions || 0,
      pendingCommissions: user.pendingCommissions || 0
    });

  } catch (error) {
    console.error("Get referral stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get referral statistics"
    });
  }
}; 