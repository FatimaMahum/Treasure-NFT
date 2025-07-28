import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Plan from './models/Plan.js';

dotenv.config();

async function createPlans() {
  try {
    await connectDB();
    console.log('🔍 Creating sample plans...');
    
    // Check if plans already exist
    const existingPlans = await Plan.find();
    if (existingPlans.length > 0) {
      console.log('📋 Plans already exist:', existingPlans.map(p => p.name));
      process.exit(0);
    }
    
    const samplePlans = [
      {
        name: 'Bronze Plan',
        description: 'Perfect for beginners',
        minAmount: 100,
        maxAmount: 499,
        dailyReturnRate: 5,
        duration: 30,
        isActive: true
      },
      {
        name: 'Silver Plan',
        description: 'Great for intermediate investors',
        minAmount: 500,
        maxAmount: 999,
        dailyReturnRate: 30,
        duration: 30,
        isActive: true
      },
      {
        name: 'Gold Plan',
        description: 'Premium investment opportunity',
        minAmount: 1000,
        maxAmount: 5000,
        dailyReturnRate: 70,
        duration: 30,
        isActive: true
      }
    ];
    
    const createdPlans = await Plan.insertMany(samplePlans);
    console.log('✅ Created plans:', createdPlans.length);
    console.log('📋 Plans:', createdPlans.map(p => p.name));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating plans:', error);
    process.exit(1);
  }
}

createPlans(); 