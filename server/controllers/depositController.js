import Deposit from '../models/Deposit.js';
import User from '../models/User.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { sendDepositApprovedEmail, sendDepositRejectedEmail } from '../services/emailService.js';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/deposits';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('📁 Created uploads directory:', uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'deposit-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
}).single('screenshot');

// Submit deposit
export const submitDeposit = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    try {
      console.log("🔍 Submit deposit - User from token:", req.user);
      console.log("🔍 Submit deposit - Request body:", req.body);
      
      const { amount } = req.body;

      if (!amount) {
        return res.status(400).json({
          success: false,
          message: "Amount is required"
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Screenshot is required"
        });
      }

      // Validate amount
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid amount"
        });
      }

      // Get user from JWT token
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

                   // Create deposit record
             const screenshotPath = req.file.path.replace(/\\/g, '/'); // Store file path with forward slashes
             // Store only the relative path for the database
             const relativePath = screenshotPath.replace(/^.*[\\\/]uploads[\\\/]/, 'uploads/');
             console.log('📸 Screenshot saved at:', screenshotPath);
             console.log('📸 Relative path for database:', relativePath);
             console.log('📸 File exists check:', fs.existsSync(req.file.path));
             console.log('📸 File size:', req.file.size);
             console.log('📸 File mimetype:', req.file.mimetype);
             console.log('📸 File originalname:', req.file.originalname);
             
                           const deposit = new Deposit({
                userId: user._id,
                userEmail: user.email,
                amount: numAmount,
                screenshot: relativePath,
                status: 'pending'
              });

      await deposit.save();

      console.log(`✅ Deposit submitted: $${numAmount} by ${user.email}`);

      res.status(201).json({
        success: true,
        message: "Deposit submitted successfully",
        deposit: {
          id: deposit._id,
          amount: deposit.amount,
          status: deposit.status,
          createdAt: deposit.createdAt
        }
      });

    } catch (error) {
      console.error('Submit deposit error:', error);
      res.status(500).json({
        success: false,
        message: "Failed to submit deposit"
      });
    }
  });
};

// Get all deposits (admin only)
export const getAllDeposits = async (req, res) => {
  try {
    const deposits = await Deposit.find()
      .populate('userId', 'name email')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      deposits: deposits
    });
  } catch (error) {
    console.error('Get deposits error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to get deposits"
    });
  }
};

// Get user's deposits
export const getUserDeposits = async (req, res) => {
  try {
    const userId = req.user.id;
    const deposits = await Deposit.find({ userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      deposits: deposits
    });
  } catch (error) {
    console.error('Get user deposits error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to get user deposits"
    });
  }
};

// Approve deposit (admin only)
export const approveDeposit = async (req, res) => {
  try {
    const { depositId } = req.params;
    const { notes } = req.body;
    const adminId = req.user.id;

    const deposit = await Deposit.findById(depositId);
    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: "Deposit not found"
      });
    }

    if (deposit.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: "Deposit is not pending"
      });
    }

    // Update deposit status
    deposit.status = 'approved';
    deposit.adminNotes = notes || '';
    deposit.approvedBy = adminId;
    deposit.approvedAt = new Date();
    await deposit.save();

    // Add amount to user's wallet
    await User.findByIdAndUpdate(deposit.userId, {
      $inc: { walletBalance: deposit.amount }
    });

    console.log(`✅ Deposit approved: $${deposit.amount} for user ${deposit.userEmail}`);

    // Send approval email to user
    try {
      const user = await User.findById(deposit.userId);
      if (user) {
        await sendDepositApprovedEmail(
          user.name || 'User',
          deposit.userEmail,
          deposit.amount,
          notes || ''
        );
        console.log(`📧 Approval email sent to ${deposit.userEmail}`);
      }
    } catch (emailError) {
      console.error('❌ Failed to send approval email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      success: true,
      message: "Deposit approved successfully"
    });

  } catch (error) {
    console.error('Approve deposit error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to approve deposit"
    });
  }
};

// Reject deposit (admin only)
export const rejectDeposit = async (req, res) => {
  try {
    const { depositId } = req.params;
    const { notes } = req.body;
    const adminId = req.user.id;

    const deposit = await Deposit.findById(depositId);
    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: "Deposit not found"
      });
    }

    if (deposit.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: "Deposit is not pending"
      });
    }

    // Update deposit status
    deposit.status = 'rejected';
    deposit.adminNotes = notes || '';
    deposit.approvedBy = adminId;
    deposit.approvedAt = new Date();
    await deposit.save();

    console.log(`❌ Deposit rejected: $${deposit.amount} for user ${deposit.userEmail}`);

    // Send rejection email to user
    try {
      const user = await User.findById(deposit.userId);
      if (user) {
        await sendDepositRejectedEmail(
          user.name || 'User',
          deposit.userEmail,
          deposit.amount,
          notes || ''
        );
        console.log(`📧 Rejection email sent to ${deposit.userEmail}`);
      }
    } catch (emailError) {
      console.error('❌ Failed to send rejection email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      success: true,
      message: "Deposit rejected successfully"
    });

  } catch (error) {
    console.error('Reject deposit error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to reject deposit"
    });
  }
};

// Get deposit by ID
export const getDepositById = async (req, res) => {
  try {
    const { depositId } = req.params;
    const deposit = await Deposit.findById(depositId)
      .populate('userId', 'name email')
      .populate('approvedBy', 'name');

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: "Deposit not found"
      });
    }

    res.status(200).json({
      success: true,
      deposit: deposit
    });

  } catch (error) {
    console.error('Get deposit error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to get deposit"
    });
  }
}; 