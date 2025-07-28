import { v4 as uuidv4 } from 'uuid';
import Investment from "../models/Investment.js";
import Plan from "../models/Plan.js";
import User from "../models/User.js";

// Simulate Easypaisa API integration
const simulateEasypaisaPayment = async (amount, userId) => {
  try {
    // In real implementation, you would call Easypaisa API here
    // For now, we'll simulate the payment process
    const sessionId = uuidv4();
    const transactionId = `EP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Use a fallback URL if FRONTEND_URL is not set
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    return {
      sessionId,
      transactionId,
      paymentUrl: `${frontendUrl}/payment-gateway?session=${sessionId}&amount=${amount}&user=${userId}`,
      status: 'pending'
    };
  } catch (error) {
    console.error("Error in simulateEasypaisaPayment:", error);
    throw error;
  }
};

// Initiate payment
export const initiatePayment = async (req, res) => {
  const { amount, planId } = req.body;
  const userId = req.user.id;

  try {
    console.log("Payment initiation request:", { amount, planId, userId });

    // For testing purposes, use hardcoded plan data if plan not found in database
    let plan = null;
    
    // Check if planId is a valid ObjectId (24 character hex string)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(planId);
    
    if (isValidObjectId) {
      plan = await Plan.findOne({ _id: planId });
    }
    
    if (!plan) {
      console.log("Plan not found in database, using hardcoded plan data");
      // Use hardcoded plan data for testing
      const planData = {
        bronze: { minAmount: 10, maxAmount: 49, dailyReturnRate: 0.03 },
        silver: { minAmount: 50, maxAmount: 99, dailyReturnRate: 0.05 },
        gold: { minAmount: 100, maxAmount: 10000, dailyReturnRate: 0.08 }
      };
      
      plan = planData[planId];
      if (!plan) {
        console.log("Plan not found in hardcoded data either");
        return res.status(404).json({ 
          success: false, 
          message: "Plan not found" 
        });
      }
    }

    console.log("Plan validation passed:", plan);

    // Validate amount
    if (amount < plan.minAmount || amount > plan.maxAmount) {
      console.log("Amount validation failed:", { amount, min: plan.minAmount, max: plan.maxAmount });
      return res.status(400).json({
        success: false,
        message: `Amount must be between $${plan.minAmount} and $${plan.maxAmount}`
      });
    }

    console.log("Amount validation passed");

    // Check user wallet balance (if using wallet)
    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found:", userId);
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    console.log("User found:", user.name);

    if (user.walletBalance < amount) {
      console.log("Insufficient wallet balance:", { balance: user.walletBalance, amount });
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance. Please top up your wallet or use Easypaisa payment."
      });
    }

    console.log("Wallet balance check passed");

    // Create payment session
    console.log("Creating payment session...");
    const paymentSession = await simulateEasypaisaPayment(amount, userId);

    console.log("Payment session created:", paymentSession);

    res.status(200).json({
      success: true,
      paymentUrl: paymentSession.paymentUrl,
      sessionId: paymentSession.sessionId,
      transactionId: paymentSession.transactionId,
      amount,
      planId
    });

  } catch (error) {
    console.error("Payment initiation error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to initiate payment"
    });
  }
};

// Handle payment success
export const handlePaymentSuccess = async (req, res) => {
  const { transactionId, sessionId, amount, planId, paymentMethod } = req.body;
  const userId = req.user.id;

  try {
    console.log("Payment success request:", { transactionId, sessionId, amount, planId, paymentMethod, userId });

    // Validate the payment (in real implementation, verify with Easypaisa)
    if (!transactionId || !sessionId) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment data"
      });
    }

    // Get plan details from database
    let plan = null;
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(planId);
    
    if (isValidObjectId) {
      plan = await Plan.findById(planId);
    }
    
    if (!plan) {
      console.log("Plan not found in database, using hardcoded plan data");
      // Use hardcoded plan data for testing
      const planData = {
        bronze: { dailyReturnRate: 3, minAmount: 10, maxAmount: 49 },
        silver: { dailyReturnRate: 5, minAmount: 50, maxAmount: 99 },
        gold: { dailyReturnRate: 8, minAmount: 100, maxAmount: 10000 }
      };
      
      plan = planData[planId];
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: "Plan not found"
        });
      }
    }

    // Validate amount against plan limits
    if (amount < plan.minAmount || (plan.maxAmount !== Number.POSITIVE_INFINITY && amount > plan.maxAmount)) {
      return res.status(400).json({
        success: false,
        message: `Investment amount must be between $${plan.minAmount} and $${plan.maxAmount === Number.POSITIVE_INFINITY ? "∞" : plan.maxAmount}`
      });
    }

    // Calculate daily return (convert percentage to decimal)
    const dailyReturnRate = typeof plan.dailyReturnRate === 'number' ? plan.dailyReturnRate / 100 : plan.dailyReturnRate;
    const dailyReturn = amount * dailyReturnRate;

    console.log("Creating investment with:", { userId, planId, amount, dailyReturn, paymentMethod, transactionId });

    // Create investment
    const investment = new Investment({
      user: userId,
      plan: planId,
      investedAmount: amount,
      dailyReturn: dailyReturn,
      startDate: new Date(),
      paymentMethod: paymentMethod || 'easypaisa',
      transactionId: transactionId
    });

    await investment.save();

    // Update user wallet if payment was from wallet
    if (paymentMethod === 'wallet') {
      const user = await User.findById(userId);
      if (user && user.walletBalance >= amount) {
        user.walletBalance -= amount;
        await user.save();
        console.log(`Wallet balance updated for user ${userId}: -$${amount}`);
      } else {
        console.log(`Insufficient wallet balance for user ${userId}`);
        return res.status(400).json({
          success: false,
          message: "Insufficient wallet balance"
        });
      }
    }

    console.log("Investment created successfully:", investment._id);

    res.status(201).json({
      success: true,
      message: "Investment created successfully",
      investment: {
        id: investment._id,
        amount: investment.investedAmount,
        dailyReturn: investment.dailyReturn,
        startDate: investment.startDate
      }
    });

  } catch (error) {
    console.error("Payment success handling error:", error);
    res.status(500).json({
      success: false,
      message: "Error completing investment"
    });
  }
};

// Get user wallet balance
export const getWalletBalance = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId).select('walletBalance');
    res.status(200).json({
      success: true,
      walletBalance: user.walletBalance || 0
    });
  } catch (error) {
    console.error("Get wallet balance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get wallet balance"
    });
  }
};

// Top up wallet
export const topUpWallet = async (req, res) => {
  const { amount } = req.body;
  const userId = req.user.id;

  try {
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount"
      });
    }

    await User.findByIdAndUpdate(userId, {
      $inc: { walletBalance: amount }
    });

    res.status(200).json({
      success: true,
      message: "Wallet topped up successfully"
    });
  } catch (error) {
    console.error("Top up wallet error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to top up wallet"
    });
  }
}; 