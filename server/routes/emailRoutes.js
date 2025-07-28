import express from 'express';
import { sendWelcomeEmail, testEmailService } from '../services/emailService.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Test email service
router.post('/test', async (req, res) => {
  try {
    const result = await testEmailService();
    res.json(result);
  } catch (error) {
    console.error('Email test error:', error);
    res.status(500).json({
      success: false,
      message: 'Email test failed',
      error: error.message
    });
  }
});

// Test welcome email
router.post('/test-welcome', async (req, res) => {
  const { email, name } = req.body;
  
  if (!email || !name) {
    return res.status(400).json({
      success: false,
      message: 'Email and name are required'
    });
  }

  try {
    const result = await sendWelcomeEmail(name, email);
    res.json(result);
  } catch (error) {
    console.error('Welcome email test error:', error);
    res.status(500).json({
      success: false,
      message: 'Welcome email test failed',
      error: error.message
    });
  }
});

export default router; 