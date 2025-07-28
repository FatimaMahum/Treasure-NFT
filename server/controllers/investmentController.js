import Investment from "../models/Investment.js";
import Plan from "../models/Plan.js";
import User from "../models/User.js";

// Create investment
export const createInvestment = async (req, res) => {
  const { planId, investedAmount, paymentMethod, transactionId } = req.body;
  const userId = req.user.id;

  try {
    // Find the plan
    let plan = null;
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(planId);
    if (isValidObjectId) {
      plan = await Plan.findById(planId);
    }
    
    if (!plan) {
      // Use hardcoded plan data as fallback
      const planData = {
        bronze: { minAmount: 10, maxAmount: 49, dailyReturnRate: 3 },
        silver: { minAmount: 50, maxAmount: 99, dailyReturnRate: 5 },
        gold: { minAmount: 100, maxAmount: 499, dailyReturnRate: 8 },
        platinum: { minAmount: 500, maxAmount: 999, dailyReturnRate: 12 },
        diamond: { minAmount: 1000, maxAmount: Number.POSITIVE_INFINITY, dailyReturnRate: 15 }
      };
      plan = planData[planId];
      if (!plan) {
        return res.status(404).json({ success: false, message: "Plan not found" });
      }
    }

    // Validate investment amount
    if (investedAmount < plan.minAmount || (plan.maxAmount !== Number.POSITIVE_INFINITY && investedAmount > plan.maxAmount)) {
      return res.status(400).json({
        success: false,
        message: `Investment amount must be between $${plan.minAmount} and $${plan.maxAmount === Number.POSITIVE_INFINITY ? "∞" : plan.maxAmount}`
      });
    }

    // Calculate daily return (convert percentage to decimal)
    const dailyReturnRate = typeof plan.dailyReturnRate === 'number' ? plan.dailyReturnRate / 100 : plan.dailyReturnRate;
    const dailyReturn = investedAmount * dailyReturnRate;

    // Create investment
    const investment = new Investment({
      user: userId,
      plan: planId,
      investedAmount,
      dailyReturn: dailyReturn,
      paymentMethod,
      transactionId
    });

    await investment.save();

    // Calculate and distribute commissions
    await distributeCommissions(userId, investedAmount);

    res.status(201).json({
      success: true,
      message: "Investment created successfully",
      investment
    });

  } catch (error) {
    console.error("Create investment error:", error);
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

// Get user investments
export const getUserInvestments = async (req, res) => {
  const userId = req.user.id;

  try {
    const investments = await Investment.find({ user: userId })
      .populate('plan', 'name description dailyReturnRate')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      investments
    });

  } catch (error) {
    console.error("Get user investments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch investments"
    });
  }
};

// Get all investments (admin only)
export const getAllInvestments = async (req, res) => {
  try {
    console.log("🔍 Admin requesting all investments...");
    const investments = await Investment.find()
      .populate('user', 'name email')
      .populate('plan', 'name description')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${investments.length} investments`);
    res.status(200).json({
      success: true,
      investments
    });

  } catch (error) {
    console.error("❌ Get all investments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch investments"
    });
  }
};
