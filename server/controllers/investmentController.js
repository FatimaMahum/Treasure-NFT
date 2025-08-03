import Investment from '../models/Investment.js';
import User from '../models/User.js';
import Plan from '../models/Plan.js';

// Create new investment (real-time wallet deduction)
export const createInvestment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, planId, paymentMethod } = req.body;

    // Validate required fields
    if (!amount || !planId) {
      return res.status(400).json({
        success: false,
        message: "Amount and plan ID are required"
      });
    }

    // Validate amount
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount"
      });
    }

    // Get user and check wallet balance
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if user has sufficient wallet balance
    if (user.walletBalance < numAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance. You need $${(numAmount - user.walletBalance).toFixed(2)} more.`
      });
    }

    // Get plan details
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Investment plan not found"
      });
    }

    // Validate investment amount against plan limits
    if (numAmount < plan.minAmount || (plan.maxAmount && numAmount > plan.maxAmount)) {
      return res.status(400).json({
        success: false,
        message: `Investment amount must be between $${plan.minAmount} and ${plan.maxAmount ? `$${plan.maxAmount}` : '∞'}`
      });
    }

    // Calculate daily return
    const dailyReturn = numAmount * plan.dailyReturnRate;

    // Deduct amount from wallet balance
    user.walletBalance -= numAmount;
    await user.save();

    // Create investment record
    const investment = new Investment({
      user: userId,
      plan: planId,
      investedAmount: numAmount,
      dailyReturn: dailyReturn,
      startDate: new Date(),
      paymentMethod: paymentMethod || 'usdt_trc20',
      status: 'active',
      transactionId: `INV_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    await investment.save();

    console.log(`✅ Investment created: $${numAmount} by ${user.email} in plan ${plan.name}`);

    res.status(201).json({
      success: true,
      message: "Investment created successfully",
      investment: {
        id: investment._id,
        amount: investment.investedAmount,
        dailyReturn: investment.dailyReturn,
        startDate: investment.startDate,
        plan: plan.name
      },
      updatedWalletBalance: user.walletBalance
    });

  } catch (error) {
    console.error('Create investment error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to create investment"
    });
  }
};

// Distribute commissions to referral chain
const distributeCommissions = async (userId, investedAmount) => {
  try {
    console.log(`💰 Distributing commissions for investment: $${investedAmount} by user ${userId}`);
    
    const user = await User.findById(userId);
    if (!user || !user.referrer) {
      console.log("No referrer found for user");
      return;
    }

    let currentUser = user;
    let level = 1;

    // Distribute commissions up to 3 levels
    while (currentUser.referrer && level <= 3) {
      const referrer = await User.findById(currentUser.referrer);
      if (!referrer) {
        console.log(`Referrer not found at level ${level}`);
        break;
      }

      // Calculate commission rate based on level
      const commissionRate = level === 1 ? 0.10 : level === 2 ? 0.05 : 0.03;
      const commission = investedAmount * commissionRate;

      console.log(`Level ${level}: ${referrer.name} gets $${commission} (${commissionRate * 100}%)`);

      // Update referrer's commission data
      referrer.totalCommissions += commission;
      referrer.pendingCommissions += commission;
      referrer.activeReferrals = (referrer.activeReferrals || 0) + (level === 1 ? 1 : 0);
      await referrer.save();

      // Move to next level
      currentUser = referrer;
      level++;
    }

    console.log(`✅ Commissions distributed successfully`);
  } catch (error) {
    console.error("❌ Commission distribution error:", error);
  }
};

// Get user's investments
export const getUserInvestments = async (req, res) => {
  try {
    const userId = req.user.id;
    const investments = await Investment.find({ user: userId })
      .populate('plan', 'name dailyReturnRate')
      .sort({ startDate: -1 });

    res.status(200).json({
      success: true,
      investments: investments
    });
  } catch (error) {
    console.error('Get user investments error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch investments"
    });
  }
};

// Get all investments (admin only)
export const getAllInvestments = async (req, res) => {
  try {
    const investments = await Investment.find()
      .populate('user', 'name email')
      .populate('plan', 'name dailyReturnRate')
      .sort({ startDate: -1 });

    res.status(200).json({
      success: true,
      investments: investments
    });
  } catch (error) {
    console.error('Get all investments error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch investments"
    });
  }
};
