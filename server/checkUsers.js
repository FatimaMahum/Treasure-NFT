import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const checkUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Count all users
    const userCount = await User.countDocuments();
    console.log(`Total users registered: ${userCount}`);

    // Get all users with basic info
    const users = await User.find().select('name email role createdAt');
    console.log("\nRegistered users:");
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role} - Created: ${user.createdAt.toLocaleDateString()}`);
    });

    // Disconnect
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  } catch (error) {
    console.error("Error:", error.message);
  }
};

checkUsers(); 