import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Create transporter with multiple provider options
const createTransporter = () => {
  console.log("🔧 Creating email transporter...");
  console.log("EMAIL_USER:", process.env.EMAIL_USER ? "Set" : "Not set");
  console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Set" : "Not set");
  console.log("EMAIL_FROM:", process.env.EMAIL_FROM || "Not set");
  
  // Option 1: Gmail (requires app password)
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log("📧 Using Gmail transporter");
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Option 2: SendGrid (recommended for production)
  if (process.env.SENDGRID_API_KEY) {
    console.log("📧 Using SendGrid transporter");
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  }

  // Option 3: Mailgun
  if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
    console.log("📧 Using Mailgun transporter");
    return nodemailer.createTransport({
      host: `smtp.mailgun.org`,
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAILGUN_USER || 'postmaster@' + process.env.MAILGUN_DOMAIN,
        pass: process.env.MAILGUN_API_KEY
      }
    });
  }

  // Option 4: Ethereal Email (for testing)
  if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
    console.log('⚠️  Using Ethereal Email for testing. Check console for login link.');
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'test@ethereal.email',
        pass: 'test123'
      }
    });
  }

  // Fallback: No email service configured
  console.warn('⚠️  No email service configured. Welcome emails will not be sent.');
  return null;
};

const transporter = createTransporter();

// Welcome email template
const createWelcomeEmail = (userName, userEmail) => {
  return {
    from: `"Treasure NFT" <${process.env.EMAIL_FROM || process.env.EMAIL_USER || 'treasureenft@gmail.com'}>`,
    to: userEmail,
    subject: '🎉 Welcome to Treasure NFT - Your Investment Journey Begins!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Treasure NFT</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .treasure {
            color: #ffd700;
            text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
          }
          .nft {
            color: #c0c0c0;
            text-shadow: 0 0 10px rgba(192, 192, 192, 0.5);
          }
          .welcome-text {
            font-size: 1.2rem;
            color: #666;
            margin-bottom: 25px;
          }
          .highlight {
            color: #ffd700;
            font-weight: bold;
          }
          .features {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .feature-item {
            margin: 10px 0;
            padding-left: 20px;
            position: relative;
          }
          .feature-item:before {
            content: "✨";
            position: absolute;
            left: 0;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%);
            color: #000;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 50px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
            box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 0.9rem;
          }
          .social-links {
            margin: 20px 0;
          }
          .social-links a {
            color: #ffd700;
            text-decoration: none;
            margin: 0 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              <span class="treasure">Treasure</span><span class="nft">NFT</span>
            </div>
            <h1>Welcome to the Family! 🎉</h1>
          </div>
          
          <p class="welcome-text">
            Dear <span class="highlight">${userName}</span>,
          </p>
          
          <p>
            Thank you for joining <span class="highlight">Treasure NFT</span>! We're excited to have you as part of our growing community of smart investors.
          </p>
          
          <p>
            Your account has been successfully created and you're now ready to start your investment journey with us.
          </p>
          
          <div class="features">
            <h3>🚀 What You Can Do Now:</h3>
            <div class="feature-item">Explore our investment plans and start earning</div>
            <div class="feature-item">Invite friends and earn referral commissions</div>
            <div class="feature-item">Track your investments in real-time</div>
            <div class="feature-item">Access your personalized dashboard</div>
            <div class="feature-item">Join our community of successful investors</div>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/dashboard" class="cta-button">
              🚀 Access Your Dashboard
            </a>
          </div>
          
          <p>
            <strong>Important:</strong> Please keep your login credentials safe and never share them with anyone. Our support team will never ask for your password.
          </p>
          
          <div class="social-links">
            <p>Follow us for updates and tips:</p>
            <a href="#">📧 Support</a> | 
            <a href="#">📱 Telegram</a> | 
            <a href="#">🐦 Twitter</a>
          </div>
          
          <div class="footer">
            <p>© 2024 Treasure NFT. All rights reserved.</p>
            <p>This email was sent to ${userEmail}</p>
            <p>If you didn't create this account, please contact support immediately.</p>
            <p><strong>Support Email:</strong> treasureenft@gmail.com</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

// Send welcome email
export const sendWelcomeEmail = async (userName, userEmail) => {
  console.log("📧 Attempting to send welcome email...");
  console.log("To:", userEmail);
  console.log("From:", process.env.EMAIL_FROM || process.env.EMAIL_USER || 'treasureenft@gmail.com');
  
  try {
    // Check if email service is configured
    if (!transporter) {
      console.log('📧 Email service not configured. Skipping welcome email.');
      return { success: false, error: 'Email service not configured' };
    }

    // Check if it's a valid Gmail account
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(userEmail)) {
      console.log(`⚠️  Skipping welcome email for non-Gmail address: ${userEmail}`);
      return { 
        success: false, 
        error: 'Email not sent - Gmail address required for welcome emails',
        reason: 'non-gmail-address'
      };
    }

    console.log("📧 Creating email template...");
    const mailOptions = createWelcomeEmail(userName, userEmail);
    console.log("📧 Email template created, sending...");
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    console.error('❌ Error details:', error.message);
    return { success: false, error: error.message };
  }
};

// Test email function
export const testEmailService = async () => {
  try {
    if (!transporter) {
      return { success: false, error: 'Email service not configured' };
    }
    
    const result = await sendWelcomeEmail('Test User', process.env.TEST_EMAIL || process.env.EMAIL_USER);
    console.log('📧 Email service test result:', result);
    return result;
  } catch (error) {
    console.error('❌ Email service test failed:', error);
    return { success: false, error: error.message };
  }
}; 

// Forgot password email template
const createForgotPasswordEmail = (userName, userEmail, verificationCode) => {
  return {
    from: `"Treasure NFT" <${process.env.EMAIL_FROM || process.env.EMAIL_USER || 'treasureenft@gmail.com'}>`,
    to: userEmail,
    subject: '🔐 Password Reset - Treasure NFT',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - Treasure NFT</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .treasure {
            color: #ffd700;
            text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
          }
          .nft {
            color: #c0c0c0;
            text-shadow: 0 0 10px rgba(192, 192, 192, 0.5);
          }
          .verification-code {
            background: linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%);
            color: #000;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            font-size: 2rem;
            font-weight: bold;
            margin: 20px 0;
            letter-spacing: 5px;
            box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
          }
          .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 0.9rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              <span class="treasure">Treasure</span><span class="nft">NFT</span>
            </div>
            <h1>Password Reset Request 🔐</h1>
          </div>
          
          <p>Dear <strong>${userName}</strong>,</p>
          
          <p>We received a request to reset your password for your Treasure NFT account.</p>
          
          <p>Use the verification code below to reset your password:</p>
          
          <div class="verification-code">
            ${verificationCode}
          </div>
          
          <div class="warning">
            <strong>⚠️ Important:</strong>
            <ul>
              <li>This code will expire in 10 minutes</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>Never share this code with anyone</li>
            </ul>
          </div>
          
          <p>If you didn't request a password reset, please contact our support team immediately.</p>
          
          <div class="footer">
            <p>© 2024 Treasure NFT. All rights reserved.</p>
            <p>This email was sent to ${userEmail}</p>
            <p><strong>Support Email:</strong> treasureenft@gmail.com</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

// Send forgot password email
export const sendForgotPasswordEmail = async (userName, userEmail, verificationCode) => {
  console.log("📧 Attempting to send forgot password email...");
  console.log("To:", userEmail);
  console.log("Verification Code:", verificationCode);
  
  try {
    // Check if email service is configured
    if (!transporter) {
      console.log('📧 Email service not configured. Skipping forgot password email.');
      return { success: false, error: 'Email service not configured' };
    }

    // Check if it's a valid Gmail account
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(userEmail)) {
      console.log(`⚠️  Skipping forgot password email for non-Gmail address: ${userEmail}`);
      return { 
        success: false, 
        error: 'Email not sent - Gmail address required for password reset',
        reason: 'non-gmail-address'
      };
    }

    console.log("📧 Creating forgot password email template...");
    const mailOptions = createForgotPasswordEmail(userName, userEmail, verificationCode);
    console.log("📧 Email template created, sending...");
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Forgot password email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending forgot password email:', error);
    console.error('❌ Error details:', error.message);
    return { success: false, error: error.message };
  }
}; 