import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "../services/emailService.js";
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
        message: "Email already registered",
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
          console.log("✅ Admin user created");
        } else {
          // Update role to admin if user exists
          adminUser.role = "admin";
          await adminUser.save();
          console.log("✅ Admin user updated");
        }

        // Generate JWT for admin
        const token = jwt.sign({ id: adminUser._id, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1d" });

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

    // Generate JWT
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

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
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Hash new password manually (avoid double hashing from pre-save hook)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update user with new password and clear reset fields
    await User.findByIdAndUpdate(decoded.id, {
      password: hashedPassword,
      resetPasswordCode: undefined,
      resetPasswordExpires: undefined
    });

    console.log(`✅ Password reset successful for ${user.email}`);

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
