import express from 'express';
import { createPlan, getPlans, getPlanById, updatePlan, deletePlan } from '../controllers/planController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
const router = express.Router();

// Public Routes (no authentication required)
router.get('/', getPlans);                              // Get all plans (public)
router.get('/:id', getPlanById);                        // Get a single plan by ID (public)

// Protected Routes (authentication required)
router.post('/', protect, admin, createPlan);           // Add new plan (admin only)
router.put('/:id', protect, admin, updatePlan);         // Update a plan (admin only)
router.delete('/:id', protect, admin, deletePlan);      // Delete a plan (admin only)

// Test route to create sample plans (admin only)
router.post('/create-sample', protect, admin, async (req, res) => {
  try {
    const Plan = (await import('../models/Plan.js')).default;
    
    // Check if plans already exist
    const existingPlans = await Plan.find();
    if (existingPlans.length > 0) {
      return res.json({ message: "Plans already exist", plans: existingPlans });
    }

    // Create sample plans
    const samplePlans = [
      {
        name: "Bronze Plan",
        amount: 100,
        dailyReturn: 5,
        duration: 30,
        isActive: true
      },
      {
        name: "Silver Plan", 
        amount: 500,
        dailyReturn: 30,
        duration: 30,
        isActive: true
      },
      {
        name: "Gold Plan",
        amount: 1000,
        dailyReturn: 70,
        duration: 30,
        isActive: true
      }
    ];

    const createdPlans = await Plan.insertMany(samplePlans);
    res.json({ message: "Sample plans created", plans: createdPlans });
  } catch (error) {
    console.error("Error creating sample plans:", error);
    res.status(500).json({ error: "Failed to create sample plans" });
  }
});

export default router;
