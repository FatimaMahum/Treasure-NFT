# Email Setup Guide

## 🚀 Welcome Email Feature

This feature automatically sends a beautiful welcome email to new users when they register successfully.

## 🤔 Why Email Credentials Are Needed

The system needs a "sender" email account to send emails FROM your platform TO your users. Think of it like this:
- **Your platform** = The sender (needs credentials)
- **User's email** = The recipient (gets the welcome email)

## 📧 Email Configuration Options

### Option 1: Gmail (Simple Setup)
```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Option 2: SendGrid (Recommended for Production)
```env
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=noreply@yourdomain.com
```

### Option 3: Mailgun
```env
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_domain.com
```

### Option 4: No Setup (Development Only)
The system will work without email setup - it just won't send welcome emails.

## 🔧 Quick Setup Guide

### For Gmail:
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. **Add to .env file**:
   ```
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_16_character_app_password
   ```

### For SendGrid (Recommended):
1. **Sign up** at sendgrid.com
2. **Get API key** from dashboard
3. **Add to .env file**:
   ```
   SENDGRID_API_KEY=your_api_key_here
   EMAIL_FROM=noreply@yourdomain.com
   ```

## 🔧 Environment Variables

Add these to your `.env` file:

```env
# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Optional: Test email
TEST_EMAIL=test@example.com
```

## 🧪 Testing the Email Service

### Method 1: Register a New User
- Register a new user through the website
- Check the user's email for the welcome message

### Method 2: Admin Test Route
- Login as admin
- Make a POST request to `/api/email/test`
- Check the configured email for the test message

## 📧 Email Features

- **Beautiful HTML Template** with your brand colors
- **Responsive Design** that works on all devices
- **Personalized Content** with user's name
- **Call-to-Action Button** linking to dashboard
- **Security Reminders** and helpful tips
- **Non-blocking** - registration won't fail if email fails

## 🎨 Email Template Features

- **Branded Header** with Treasure NFT logo
- **Welcome Message** personalized with user's name
- **Feature List** highlighting platform benefits
- **Dashboard Link** for immediate access
- **Security Tips** and best practices
- **Social Links** for community engagement
- **Professional Footer** with contact information

## 🔒 Security Notes

- Email passwords are stored in environment variables
- App passwords are more secure than regular passwords
- Email sending is non-blocking (won't affect registration)
- All emails include security reminders

## 🐛 Troubleshooting

### Common Issues:

1. **"Invalid login" error**:
   - Check if 2FA is enabled
   - Verify app password is correct
   - Ensure EMAIL_USER and EMAIL_PASS are set

2. **"Service not found" error**:
   - Change service to 'gmail', 'outlook', etc.
   - Check nodemailer documentation for supported services

3. **Emails not sending**:
   - Check server console for error messages
   - Verify email credentials in .env file
   - Test with the admin test route

## 📝 Customization

You can customize the email template in `services/emailService.js`:

- **Subject Line**: Change the welcome subject
- **HTML Content**: Modify the email design
- **Styling**: Update colors and layout
- **Content**: Add/remove features or sections 