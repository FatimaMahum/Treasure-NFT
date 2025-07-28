import axios from "axios";
import crypto from "crypto";
import User from "../models/User.js";

export const initiatePayment = async (req, res) => {
  const { amount, email, planId } = req.body;
  const orderRefNum = "ORD" + Date.now();

  try {
    // Validate required fields
    if (!amount || !email || !planId) {
      return res.status(400).json({
        success: false,
        message: "Amount, email, and planId are required"
      });
    }

    // Validate amount
    const numAmount = Number.parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount"
      });
    }

    // For testing purposes, use mock credentials
    const mockConfig = {
      storeId: process.env.EASYPAISA_STORE_ID || "TEST_STORE_123",
      amount: numAmount.toFixed(2),
      postBackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/easypaisa/callback`,
      orderRefNum,
      expiryDate: "20301231 235959", // format: yyyyMMdd HHmmss
      merchantHashedReq: "",
    };

    // Create hashed key (HMAC SHA256)
    const rawData = `${mockConfig.storeId}&${mockConfig.amount}&${mockConfig.postBackURL}&${mockConfig.orderRefNum}&${mockConfig.expiryDate}`;
    const secretKey = process.env.EASYPAISA_SECRET || "TEST_SECRET_KEY_123";
    mockConfig.merchantHashedReq = crypto.createHmac("sha256", secretKey).update(rawData).digest("hex");

    // Save order information to user for callback processing
    await User.findOneAndUpdate(
      { email }, 
      { 
        lastOrderId: orderRefNum,
        pendingInvestment: {
          amount: numAmount,
          planId: planId,
          orderRefNum: orderRefNum,
          timestamp: new Date()
        }
      }
    );

    console.log(`🚀 Initiating Easypaisa payment: $${numAmount} for plan ${planId}`);
    
    // For testing, return a mock redirect URL
    // In production, this would be the real Easypaisa API call
    const mockRedirectUrl = `https://easypaystg.easypaisa.com.pk/easypay/Index.jsf?storeId=${mockConfig.storeId}&amount=${mockConfig.amount}&postBackURL=${encodeURIComponent(mockConfig.postBackURL)}&orderRefNum=${mockConfig.orderRefNum}&expiryDate=${mockConfig.expiryDate}&merchantHashedReq=${mockConfig.merchantHashedReq}`;
    
    res.json({ 
      success: true,
      redirectUrl: mockRedirectUrl,
      message: "Redirecting to Easypaisa payment gateway"
    });
  } catch (err) {
    console.error("❌ Easypaisa payment initiation failed:", err);
    res.status(500).json({ 
      success: false,
      message: "Payment initiation failed", 
      error: err.message 
    });
  }
};

export const easypaisaCallback = async (req, res) => {
  const { orderRefNum, status, amount } = req.body;
  
  try {
    console.log(`📞 Easypaisa callback received: ${orderRefNum}, Status: ${status}, Amount: ${amount}`);
    
    if (status === "SUCCESS") {
      // Find user using orderRefNum
      const user = await User.findOne({ lastOrderId: orderRefNum });
      
      if (user && user.pendingInvestment) {
        const { planId } = user.pendingInvestment;
        
        // Add amount to wallet
        user.walletBalance += parseFloat(amount);
        
        // Clear pending investment
        user.pendingInvestment = null;
        await user.save();
        
        console.log(`✅ Easypaisa payment successful: $${amount} added to wallet for user ${user.email}`);
        
        res.status(200).send("Payment successful - Wallet updated");
      } else {
        console.log(`⚠️  User not found for order: ${orderRefNum}`);
        res.status(404).send("User not found");
      }
    } else {
      console.log(`❌ Easypaisa payment failed: ${orderRefNum}`);
      
      // Clear pending investment on failure
      await User.findOneAndUpdate(
        { lastOrderId: orderRefNum },
        { pendingInvestment: null }
      );
      
      res.status(400).send("Payment failed");
    }
  } catch (error) {
    console.error("❌ Easypaisa callback error:", error);
    res.status(500).send("Callback processing error");
  }
}; 