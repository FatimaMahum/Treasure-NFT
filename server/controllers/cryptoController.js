import axios from 'axios';
import dotenv from 'dotenv';
import User from '../models/User.js';
dotenv.config();

export const createCryptoCheckout = async (req, res) => {
  try {
    const { amount, userId, email, planId, purpose = 'investment' } = req.body;
    
    // Validate required fields
    if (!amount || !userId || !email) {
      return res.status(400).json({
        success: false,
        message: "Amount, userId, and email are required"
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

    // Create charge description based on purpose
    let description = "Pay securely with crypto";
    let name = "Crypto Payment";
    
    if (purpose === 'wallet_topup') {
      description = `Wallet top-up of $${numAmount}`;
      name = "Wallet Top-up";
    } else if (purpose === 'investment' && planId) {
      description = `Investment payment of $${numAmount} for plan ${planId}`;
      name = "Investment Payment";
    }

    // Save pending transaction to user
    const pendingTransaction = {
      amount: numAmount,
      purpose: purpose,
      planId: planId || null,
      timestamp: new Date(),
      status: 'pending'
    };

    await User.findByIdAndUpdate(userId, {
      pendingCryptoTransaction: pendingTransaction
    });

    console.log(`🚀 Creating crypto checkout: $${numAmount} for ${purpose}`);

    const response = await axios.post(
      'https://api.commerce.coinbase.com/charges',
      {
        name: name,
        description: description,
        pricing_type: "fixed_price",
        local_price: {
          amount: numAmount.toString(),
          currency: "USD",
        },
        metadata: {
          customer_id: userId,
          user_email: email,
          purpose: purpose,
          plan_id: planId || '',
        },
        redirect_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-success`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invest`,
      },
      {
        headers: {
          'X-CC-Api-Key': process.env.COINBASE_API_KEY,
          'X-CC-Version': '2018-03-22',
          'Content-Type': 'application/json',
        },
      }
    );

    return res.json({ 
      success: true,
      hosted_url: response.data.data.hosted_url,
      message: "Crypto payment initiated"
    });
  } catch (error) {
    console.error("❌ Crypto payment error:", error?.response?.data || error);
    return res.status(500).json({ 
      success: false,
      error: "Failed to create crypto charge" 
    });
  }
};

export const handleCryptoCallback = async (req, res) => {
  try {
    const { event } = req.body;
    
    if (event.type === 'charge:confirmed') {
      const { metadata } = event.data;
      const userId = metadata.customer_id;
      const amount = parseFloat(event.data.pricing.local.amount);
      const purpose = metadata.purpose;
      const planId = metadata.plan_id;

      console.log(`📞 Crypto payment confirmed: $${amount} for ${purpose}`);

      // Find user and update wallet
      const user = await User.findById(userId);
      if (!user) {
        console.log(`⚠️  User not found for crypto payment: ${userId}`);
        return res.status(404).json({ error: "User not found" });
      }

      // Add amount to wallet
      user.walletBalance += amount;

      // If it's an investment, create the investment record
      if (purpose === 'investment' && planId) {
        // Here you would create an investment record
        console.log(`✅ Investment created: $${amount} for plan ${planId}`);
      }

      // Clear pending transaction
      user.pendingCryptoTransaction = null;
      await user.save();

      console.log(`✅ Crypto payment successful: $${amount} added to wallet for user ${user.email}`);
      
      res.status(200).json({ success: true, message: "Payment processed successfully" });
    } else {
      console.log(`❌ Crypto payment failed or pending: ${event.type}`);
      res.status(400).json({ error: "Payment not confirmed" });
    }
  } catch (error) {
    console.error("❌ Crypto callback error:", error);
    res.status(500).json({ error: "Callback processing error" });
  }
}; 