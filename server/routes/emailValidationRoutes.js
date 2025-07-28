import express from 'express';
import { validateEmailForRegistration, testEmailValidation } from '../services/emailValidationService.js';

const router = express.Router();

// Test email validation
router.post('/validate', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email is required" 
      });
    }

    const result = await validateEmailForRegistration(email);
    
    res.json({
      success: result.valid,
      message: result.message,
      warning: result.warning,
      valid: result.valid
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Email validation error", 
      error: error.message 
    });
  }
});

// Test multiple emails
router.post('/test-multiple', async (req, res) => {
  try {
    const { emails } = req.body;
    
    if (!emails || !Array.isArray(emails)) {
      return res.status(400).json({ 
        success: false, 
        message: "Emails array is required" 
      });
    }

    const results = [];
    for (const email of emails) {
      const result = await validateEmailForRegistration(email);
      results.push({
        email,
        ...result
      });
    }

    res.json({
      success: true,
      results
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Email validation error", 
      error: error.message 
    });
  }
});

export default router; 