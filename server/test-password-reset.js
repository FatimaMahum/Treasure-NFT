import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const testPasswordReset = async () => {
  try {
    console.log('🧪 Testing password reset functionality...');
    
    // Find a test user
    const testUser = await User.findOne({ email: 'test@gmail.com' });
    if (!testUser) {
      console.log('❌ Test user not found. Please create a user first.');
      return;
    }
    
    console.log('✅ Test user found:', testUser.email);
    console.log('Current password hash:', testUser.password);
    
    // Test password comparison
    const testPassword = 'test123';
    const isMatch = await testUser.comparePassword(testPassword);
    console.log('Password comparison result:', isMatch);
    
    // Test new password
    const newPassword = 'newpassword123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    console.log('New password hash:', hashedPassword);
    
    // Update password
    await User.findByIdAndUpdate(testUser._id, {
      password: hashedPassword
    });
    
    console.log('✅ Password updated successfully');
    
    // Test login with new password
    const updatedUser = await User.findById(testUser._id);
    const newPasswordMatch = await updatedUser.comparePassword(newPassword);
    console.log('New password match:', newPasswordMatch);
    
    if (newPasswordMatch) {
      console.log('✅ Password reset test successful!');
    } else {
      console.log('❌ Password reset test failed!');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    mongoose.connection.close();
  }
};

testPasswordReset(); 