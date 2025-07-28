import cron from "node-cron"
import Investment from "../models/Investment.js"
import User from "../models/User.js"

// Run daily at 12 AM
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("🔄 Running daily return update...")

    // Find all active investments
    const investments = await Investment.find({ status: 'active' })

    console.log(`📊 Processing ${investments.length} active investments`)

    for (const investment of investments) {
      // Add daily return to total returned
      investment.totalReturned += investment.dailyReturn

      // Check if investment is completed (total returned >= invested amount)
      if (investment.totalReturned >= investment.investedAmount) {
        investment.status = 'completed'
        investment.isCompleted = true
        console.log(`✅ Investment ${investment._id} completed`)
      }

      await investment.save()

      // Update user's wallet balance with daily return
      const user = await User.findById(investment.user)
      if (user) {
        user.walletBalance += investment.dailyReturn
        await user.save()
        console.log(`💰 Added $${investment.dailyReturn} to user ${user.name}'s wallet`)
      }
    }

    console.log(`✅ Daily return updated for ${investments.length} investments`)
  } catch (error) {
    console.error("❌ Error updating daily returns:", error)
  }
})

console.log("⏰ Daily return cron job initialized")
