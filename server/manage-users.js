import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const manageUsers = async () => {
  try {
    console.log('👥 User Management Tool');
    console.log('=======================');
    
    // 1. List all users
    console.log('\n📋 All Users:');
    const allUsers = await User.find({}).select('name email createdAt role');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role || 'user'} - ${user.createdAt.toLocaleDateString()}`);
    });
    
    // 2. Delete specific user by email
    const deleteUserByEmail = async (email) => {
      const user = await User.findOne({ email });
      if (!user) {
        console.log(`❌ User with email ${email} not found`);
        return;
      }
      
      await User.deleteOne({ email });
      console.log(`✅ User ${user.name} (${email}) deleted successfully`);
    };
    
    // 3. Delete all users except admin
    const deleteAllExceptAdmin = async () => {
      const result = await User.deleteMany({ 
        email: { $ne: "treasureenft@gmail.com" } 
      });
      console.log(`✅ Deleted ${result.deletedCount} users (kept admin)`);
    };
    
    // 4. Delete users by date range
    const deleteUsersByDate = async (daysOld) => {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
      const result = await User.deleteMany({ 
        createdAt: { $lt: cutoffDate },
        email: { $ne: "treasureenft@gmail.com" } // Keep admin
      });
      console.log(`✅ Deleted ${result.deletedCount} users older than ${daysOld} days`);
    };
    
    // 5. Count users
    const countUsers = async () => {
      const total = await User.countDocuments();
      const admins = await User.countDocuments({ role: 'admin' });
      const regularUsers = await User.countDocuments({ role: { $ne: 'admin' } });
      
      console.log(`📊 User Statistics:`);
      console.log(`   Total Users: ${total}`);
      console.log(`   Admins: ${admins}`);
      console.log(`   Regular Users: ${regularUsers}`);
    };
    
    // Example usage:
    console.log('\n🔧 Available Functions:');
    console.log('1. deleteUserByEmail("user@example.com")');
    console.log('2. deleteAllExceptAdmin()');
    console.log('3. deleteUsersByDate(7) // Delete users older than 7 days');
    console.log('4. countUsers()');
    
    // Uncomment the function you want to run:
    
    // Example: Delete a specific user
    // await deleteUserByEmail("test@example.com");
    
    // Example: Delete all users except admin
    // await deleteAllExceptAdmin();
    
    // Example: Delete users older than 7 days
    // await deleteUsersByDate(7);
    
    // Example: Count users
    await countUsers();
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

manageUsers(); 