import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail, sendOtpEmail } from "../services/emailService.js";
import { validateEmailForRegistration } from "../services/emailValidationService.js";
import { sendForgotPasswordEmail } from "../services/emailService.js";

// REGISTER
export const register = async (req, res) => {
  const { name, email, password, whatsapp, referralCode } = req.body

  try {
    // Validate email format and Gmail account
    const emailValidation = await validateEmailForRegistration(email);
    if (!emailValidation.valid) {
      return res.status(400).json({
        success: false,
        message: emailValidation.message,
      });
    }

    // Check if user already exists by email
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already registered with this email address",
      })
    }
    // Check if username is already taken
    const existingName = await User.findOne({ name })
    if (existingName) {
      return res.status(400).json({
        success: false,
        message: "Username already taken. Please choose a different username.",
      })
    }

    const newUser = new User({
      name,
      email,
      password,
      whatsapp,
    })

    // Handle referral code if provided
    if (referralCode) {
      const referrer = await User.findOne({ referralCode })
      if (referrer) {
        newUser.referrer = referrer._id
        // Update referrer's total referrals
        referrer.totalReferrals += 1
        await referrer.save()
      }
    }

    await newUser.save()

    // Send welcome email (non-blocking) - don't await it
    console.log(`📧 Attempting to send welcome email to ${email}...`);
    sendWelcomeEmail(name, email)
      .then(result => {
        if (result.success) {
          console.log(`✅ Welcome email sent to ${email}`);
        } else {
          console.log(`⚠️  Welcome email not sent to ${email}:`, result.error);
        }
      })
      .catch(emailError => {
        console.error('❌ Failed to send welcome email:', emailError);
        // Don't fail registration if email fails
      });

    console.log(`✅ User registered successfully: ${email}`);

    return res.status(201).json({
      success: true,
      message: "Registered successfully",
    })
  } catch (err) {
    console.error("Registration error:", err)
    return res.status(500).json({
      success: false,
      message: "Server error during registration",
    })
  }
}

// LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt:", email); // Debug log

  try {
    // Special admin credentials check
    if (email === "treasureenft@gmail.com" && password === "Tre@sureenft@726") {
      try {
        // Debug: List all users in database
        const allUsers = await User.find({});
        console.log("🔍 All users in database:", allUsers.map(u => ({ id: u._id, email: u.email, role: u.role })));
        
        // Create or find admin user
        let adminUser = await User.findOne({ email: "treasureenft@gmail.com" });
        
        if (!adminUser) {
          // Create admin user if doesn't exist
          adminUser = new User({
            name: "Admin",
            email: "treasureenft@gmail.com",
            password: "Tre@sureenft@726",
            role: "admin",
            whatsapp: "Admin"
          });
          await adminUser.save();
          console.log("✅ Admin user created with ID:", adminUser._id);
          
          // Verify user was saved by fetching it again
          const savedUser = await User.findById(adminUser._id);
          if (savedUser) {
            console.log("✅ Admin user verified in database:", savedUser.email);
          } else {
            console.log("❌ Admin user not found in database after creation!");
          }
        } else {
          // Update role to admin if user exists
          adminUser.role = "admin";
          await adminUser.save();
          console.log("✅ Admin user updated with ID:", adminUser._id);
          
          // Verify user was saved by fetching it again
          const savedUser = await User.findById(adminUser._id);
          if (savedUser) {
            console.log("✅ Admin user verified in database:", savedUser.email);
          } else {
            console.log("❌ Admin user not found in database after update!");
          }
        }

        // Generate JWT for admin
        const token = jwt.sign({ id: adminUser._id, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1d" });
        console.log("🔐 Generated JWT token for admin with user ID:", adminUser._id);

        return res.status(200).json({
          success: true,
          message: "Admin login successful",
          token,
          user: {
            id: adminUser._id,
            name: adminUser.name,
            email: adminUser.email,
            role: "admin",
          },
        });
      } catch (adminError) {
        console.error("Admin user creation error:", adminError);
        return res.status(500).json({
          success: false,
          message: "Admin login failed",
        });
      }
    }

    // Regular user login - original functionality
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found:", email); // Debug log
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("User found:", user.email); // Debug log
    console.log("User ID:", user._id); // Debug log
    console.log("Attempting password comparison..."); // Debug log

    // Check password match
    const isMatch = await user.comparePassword(password);
    console.log("Password match result:", isMatch); // Debug log
    if (!isMatch) {
      console.log("Password comparison failed for user:", user.email); // Debug log
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    console.log("Password verified successfully for user:", user.email); // Debug log

    // Check if OTP is required (first login or 48 hours passed)
    const now = new Date();
    const lastOtpTime = user.lastOtpSent ? new Date(user.lastOtpSent) : null;
    const hoursSinceLastOtp = lastOtpTime ? (now - lastOtpTime) / (1000 * 60 * 60) : 48; // Default to 48 if no previous OTP
    
    const needsOtp = user.isFirstLogin || hoursSinceLastOtp >= 48;
    
    if (needsOtp) {
      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP and expiry time (60 seconds)
      user.otpCode = otpCode;
      user.otpExpires = new Date(Date.now() + 60 * 1000); // 60 seconds
    
      user.lastOtpSent = now;
      await user.save();

      // Send OTP email
      const emailResult = await sendOtpEmail(user.name, user.email, otpCode);
      
      if (emailResult.success) {
        console.log(`✅ OTP sent to ${user.email}: ${otpCode}`);
        return res.status(200).json({
          success: true,
          message: "OTP sent to your email for verification",
          requiresOtp: true,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
      } else {
        // For development/testing: still return success but log the OTP
        console.log(`⚠️  Email service not configured. OTP for ${user.email}: ${otpCode}`);
        return res.status(200).json({
          success: true,
          message: `OTP sent to your email for verification (DEV: ${otpCode})`,
          requiresOtp: true,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
      }
    } else {
      // No OTP required, proceed with login
      user.isFirstLogin = false; // Mark as not first login
      await user.save();
      
      // Generate JWT
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
      console.log("🔐 Generated JWT token for user with ID:", user._id);

      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// Check if username or email is taken
export const checkAvailability = async (req, res) => {
  const { field, value } = req.query;

  if (!["name", "email"].includes(field)) {
    return res.status(400).json({ available: false, message: "Invalid field" });
  }

  const exists = await User.findOne({ [field]: value });
  res.json({ available: !exists });
};

// FORGOT PASSWORD - Send verification code
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address"
      });
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store verification code and expiry time (10 minutes)
    user.resetPasswordCode = verificationCode;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Send verification code email
    const emailResult = await sendForgotPasswordEmail(user.name, email, verificationCode);
    
    if (emailResult.success) {
      console.log(`✅ Password reset code sent to ${email}`);
      return res.status(200).json({
        success: true,
        message: "Verification code sent to your email"
      });
    } else {
      console.log(`❌ Failed to send reset code to ${email}:`, emailResult.error);
      return res.status(500).json({
        success: false,
        message: "Failed to send verification code. Please try again."
      });
    }

  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during password reset"
    });
  }
};

// VERIFY RESET CODE
export const verifyResetCode = async (req, res) => {
  const { email, verificationCode } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address"
      });
    }

    // Check if code matches and is not expired
    if (user.resetPasswordCode !== verificationCode) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code"
      });
    }

    if (user.resetPasswordExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new one."
      });
    }

    // Generate temporary token for password reset
    const resetToken = jwt.sign(
      { id: user._id, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    return res.status(200).json({
      success: true,
      message: "Verification code verified successfully",
      resetToken
    });

  } catch (error) {
    console.error("Verify reset code error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during verification"
    });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  const { resetToken, newPassword, confirmPassword } = req.body;

  try {
    // Verify reset token
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    if (decoded.type !== 'password_reset') {
      return res.status(400).json({
        success: false,
        message: "Invalid reset token"
      });
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match"
      });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    // Find user and update password
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log("❌ User not found during password reset for ID:", decoded.id);
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    console.log("✅ User found during password reset:", user.email);
    console.log("✅ User ID before password reset:", user._id);

    // Hash new password manually (avoid double hashing from pre-save hook)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update user with new password and clear reset fields
    const updatedUser = await User.findByIdAndUpdate(decoded.id, {
      password: hashedPassword,
      resetPasswordCode: undefined,
      resetPasswordExpires: undefined
    }, { new: true });

    console.log("✅ Password reset successful for user:", updatedUser.email);
    console.log("✅ User ID after password reset:", updatedUser._id);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now login with your new password."
    });

  } catch (error) {
    console.error("Reset password error:", error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }
    return res.status(500).json({
      success: false,
      message: "Server error during password reset"
    });
  }
};

// RESEND OTP
export const resendOtp = async (req, res) => {
  const { email } = req.body;
  console.log('🔄 Resend OTP requested for:', email); // Debug log

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found for resend OTP:', email); // Debug log
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    console.log('✅ User found for resend OTP:', user.email); // Debug log

    // Generate new 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP and expiry time (60 seconds)
    user.otpCode = otpCode;
    user.otpExpires = new Date(Date.now() + 60 * 1000); // 60 seconds
    user.lastOtpSent = new Date();
    await user.save();

    // Send OTP email
    const emailResult = await sendOtpEmail(user.name, user.email, otpCode);
    
    if (emailResult.success) {
      console.log(`✅ OTP resent to ${user.email}: ${otpCode}`);
      return res.status(200).json({
        success: true,
        message: "New OTP sent to your email"
      });
    } else {
      // For development/testing: still return success but log the OTP
      console.log(`⚠️  Email service not configured. OTP resent for ${user.email}: ${otpCode}`);
      return res.status(200).json({
        success: true,
        message: `New OTP sent to your email (DEV: ${otpCode})`
      });
    }

  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during OTP resend"
    });
  }
};

// VERIFY OTP
export const verifyOtp = async (req, res) => {
  const { email, otpCode } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if OTP matches and is not expired
    if (user.otpCode !== otpCode) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP code"
      });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please login again to get a new code."
      });
    }

    // Mark as not first login and clear OTP fields
    user.isFirstLogin = false;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Generate JWT
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

    console.log(`✅ OTP verified successfully for ${user.email}`);

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during OTP verification"
    });
  }
};
