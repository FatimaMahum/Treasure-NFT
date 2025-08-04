import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import planRoutes from './routes/planRoutes.js';
import investmentRoutes from './routes/investmentRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import easypaisaRoutes from './routes/easypaisa.js';
import referralRoutes from './routes/referralRoutes.js';
import cryptoRoutes from './routes/cryptoRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import emailValidationRoutes from './routes/emailValidationRoutes.js';
import withdrawalRoutes from './routes/withdrawalRoutes.js';
import depositRoutes from './routes/depositRoutes.js';
import earnRoutes from './routes/earnRoutes.js';
import './cron/dailyReturn.js';
import startAutoWithdrawalCron from './cron/autoWithdrawal.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { protect } from './middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from root directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Debug: Check if email variables are loaded
console.log('🔍 Environment Variables Check:');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'NOT SET');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM ? 'SET' : 'NOT SET');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'SET' : 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');

const app = express();

    // Initialize server
    const startServer = async () => {
      try {
        // Connect to database
        await connectDB();
        
        // Start cron jobs
        startAutoWithdrawalCron();
    
    // Middleware
    // Production CORS configuration
    app.use(cors({
      origin: process.env.NODE_ENV === 'production' 
        ? [process.env.FRONTEND_URL] 
        : ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    
    // Security middleware
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Serve uploaded files
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
    
    // Specific route for serving deposit screenshots with CORS headers
    app.get('/uploads/deposits/:filename', (req, res, next) => {
      const { filename } = req.params;
      const filePath = path.join(__dirname, 'uploads', 'deposits', filename);
      
      // Set CORS headers for images
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      
      // Serve the file
      res.sendFile(filePath, (err) => {
        if (err) {
          console.log('❌ Error serving file:', filename, err.message);
          res.status(404).json({ error: 'File not found' });
        } else {
          console.log('✅ File served successfully:', filename);
        }
      });
    });
    
    // Test route to check if uploads directory exists and list files
    app.get('/api/test-uploads', async (req, res) => {
      const fs = await import('fs');
      const uploadsPath = path.join(__dirname, 'uploads');
      const depositsPath = path.join(uploadsPath, 'deposits');
      
      try {
        const uploadsExists = fs.existsSync(uploadsPath);
        const depositsExists = fs.existsSync(depositsPath);
        
        let uploadsFiles = [];
        let depositsFiles = [];
        
        if (uploadsExists) {
          uploadsFiles = fs.readdirSync(uploadsPath);
        }
        
        if (depositsExists) {
          depositsFiles = fs.readdirSync(depositsPath);
        }
        
        res.json({
          uploadsPath,
          depositsPath,
          uploadsExists,
          depositsExists,
          uploadsFiles,
          depositsFiles
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Test route to check if a specific file exists
    app.get('/api/test-file/:filename', async (req, res) => {
      const fs = await import('fs');
      const { filename } = req.params;
      const filePath = path.join(__dirname, 'uploads', 'deposits', filename);
      
      try {
        const exists = fs.existsSync(filePath);
        const stats = exists ? fs.statSync(filePath) : null;
        
        res.json({
          filename,
          filePath,
          exists,
          size: stats ? stats.size : null,
          created: stats ? stats.birthtime : null
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // TikTok embed proxy route to handle CORS
    app.get('/api/tiktok-embed/:videoId', (req, res) => {
      const { videoId } = req.params;
      const embedUrl = `https://www.tiktok.com/embed/${videoId}`;
      
      // Set CORS headers for TikTok embeds
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      // Redirect to TikTok embed
      res.redirect(embedUrl);
    });

    // Test route to check static file serving
    app.get('/api/test-static/:filename', async (req, res) => {
      const { filename } = req.params;
      const staticUrl = `${req.protocol}://${req.get('host')}/uploads/deposits/${filename}`;
      
      res.json({
        filename,
        staticUrl,
        testUrl: `/uploads/deposits/${filename}`,
        backendUrl: process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'
      });
    });
    
    // Test route to serve a specific file directly
    app.get('/api/test-serve/:filename', async (req, res) => {
      const fs = await import('fs');
      const { filename } = req.params;
      const filePath = path.join(__dirname, 'uploads', 'deposits', filename);
      
      try {
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          res.json({
            success: true,
            filename,
            filePath,
            size: stats.size,
            created: stats.birthtime,
            directUrl: `${req.protocol}://${req.get('host')}/uploads/deposits/${filename}`
          });
        } else {
          res.json({
            success: false,
            filename,
            filePath,
            error: 'File not found'
          });
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Remove debug logs in production
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔍 Environment Variables Check:');
      console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'NOT SET');
      console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');
      console.log('EMAIL_FROM:', process.env.EMAIL_FROM ? 'SET' : 'NOT SET');
      console.log('MONGO_URI:', process.env.MONGO_URI ? 'SET' : 'NOT SET');
      console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
    }

    // Test route to verify server is working
    app.get('/api/test', (req, res) => {
      res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
    });

    // Test route to check database and users
    app.get('/api/test-db', async (req, res) => {
      try {
        const User = (await import('./models/User.js')).default;
        const users = await User.find({});
        res.json({ 
          message: 'Database test successful!', 
          userCount: users.length,
          users: users.map(u => ({ id: u._id, email: u.email, role: u.role }))
        });
      } catch (error) {
        res.status(500).json({ 
          message: 'Database test failed!', 
          error: error.message 
        });
      }
    });

    // Test route to check if auth middleware is working
    app.get('/api/test-auth', protect, (req, res) => {
      res.json({ 
        message: 'Auth middleware working!', 
        user: req.user 
      });
    });

    // Test route to check uploaded files
    app.get('/api/test-uploads', (req, res) => {
      const fs = require('fs');
      const path = require('path');
      const uploadsDir = path.join(__dirname, 'uploads');
      const depositsDir = path.join(uploadsDir, 'deposits');
      
      try {
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        if (!fs.existsSync(depositsDir)) {
          fs.mkdirSync(depositsDir, { recursive: true });
        }
        
        const files = fs.readdirSync(depositsDir);
        res.json({ 
          message: 'Uploads directory check', 
          uploadsDir,
          depositsDir,
          files: files.slice(0, 10), // Show first 10 files
          testUrl: files.length > 0 ? `${process.env.BACKEND_URL || req.protocol + '://' + req.get('host')}/uploads/deposits/${files[0]}` : 'No files'
        });
      } catch (error) {
        res.status(500).json({ 
          message: 'Uploads directory error', 
          error: error.message 
        });
      }
    });

    // Test route to check if a specific file exists
    app.get('/api/test-file/:filename', (req, res) => {
      const fs = require('fs');
      const path = require('path');
      const filename = req.params.filename;
      const filePath = path.join(__dirname, 'uploads', 'deposits', filename);
      
      try {
        if (fs.existsSync(filePath)) {
          res.json({ 
            message: 'File exists', 
            filename,
            filePath,
            size: fs.statSync(filePath).size
          });
        } else {
          res.status(404).json({ 
            message: 'File not found', 
            filename,
            filePath
          });
        }
      } catch (error) {
        res.status(500).json({ 
          message: 'File check error', 
          error: error.message 
        });
      }
    });

    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/plans', planRoutes);
    app.use('/api/investments', investmentRoutes);
    app.use('/api/payments', paymentRoutes);
    app.use('/api/easypaisa', easypaisaRoutes);
    app.use('/api/referrals', referralRoutes);
    app.use('/api/crypto', cryptoRoutes);
    app.use('/api/email', emailRoutes);
    app.use('/api/email-validation', emailValidationRoutes);
    app.use('/api/withdrawals', withdrawalRoutes);
    app.use('/api/deposits', depositRoutes);
app.use('/api/earn', earnRoutes);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
