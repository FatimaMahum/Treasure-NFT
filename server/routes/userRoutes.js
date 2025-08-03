import express from "express"
import User from "../models/User.js"
import { protect, admin } from "../middleware/authMiddleware.js"

const router = express.Router()

// Test route to check admin user
router.get("/test-admin", async (req, res) => {
  try {
    const adminUser = await User.findOne({ email: "treasureenft@gmail.com" });
    console.log("🔍 Admin user check:", adminUser);
    res.json({ 
      adminExists: !!adminUser, 
      adminRole: adminUser?.role,
      adminId: adminUser?._id 
    });
  } catch (error) {
    console.error("❌ Error checking admin user:", error);
    res.status(500).json({ error: "Failed to check admin user" });
  }
});

// Get all users (admin only)
router.get("/", protect, admin, async (req, res) => {
  try {
    console.log("🔍 Admin requesting all users...");
    console.log("👤 Request user:", req.user);
    const users = await User.find().select("-password")
    console.log(`✅ Found ${users.length} users`);
    res.status(200).json(users)
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users", error })
  }
})

// Get user profile
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    res.status(500).json({ success: false, message: "Failed to fetch user profile" });
  }
});

export default router
