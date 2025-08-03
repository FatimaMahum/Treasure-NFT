import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  console.log("🚨 AUTH MIDDLEWARE CALLED!");
  console.log("🔒 Auth middleware called for:", req.path);
  console.log("🔒 Request headers:", req.headers.authorization ? "Token present" : "No token");
  
  // Test database connection
  try {
    const dbStatus = await User.db.db.admin().ping();
    console.log("✅ Database connection test:", dbStatus);
  } catch (dbError) {
    console.log("❌ Database connection test failed:", dbError.message);
  }
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ No Bearer token found");
    return res.status(401).json({ error: "No token, authorization denied" });
  }
  const token = authHeader.split(" ")[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔍 Token decoded:", decoded);
    console.log("🔍 User ID from token:", decoded.id);
    
    // Verify user exists in database
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log("❌ User not found in database for ID:", decoded.id);
      
      // Debug: List all users to see what's in the database
      const allUsers = await User.find({});
      console.log("🔍 All users in database:", allUsers.map(u => ({ id: u._id, email: u.email, role: u.role })));
      
      return res.status(401).json({ error: "User not found" });
    }
    
    console.log("✅ User found in database:", user.email);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    res.status(401).json({ error: "Token is not valid" });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
};
