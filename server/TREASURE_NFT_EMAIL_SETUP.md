# 🎯 Treasure NFT Email Setup Guide

## 📧 Dedicated Email Setup for treasureenft@gmail.com

### Step 1: Create Gmail Account
1. Go to [gmail.com](https://gmail.com)
2. Click "Create account"
3. Use: `treasureenft@gmail.com` (or similar if taken)
4. Set a strong password
5. Complete the setup

### Step 2: Enable 2-Factor Authentication
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click "Security"
3. Enable "2-Step Verification"
4. Follow the setup process

### Step 3: Generate App Password
1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Find "2-Step Verification" → "App passwords"
3. Select "Mail" from dropdown
4. Click "Generate"
5. Copy the 16-character password (like: `abcd efgh ijkl mnop`)

### Step 4: Update Your .env File
Add these lines to your `server/.env` file:

```env
# Email Configuration - Dedicated Treasure NFT Email
EMAIL_USER=treasureenft@gmail.com
EMAIL_PASS=your_16_character_app_password_here
EMAIL_FROM=treasureenft@gmail.com
```

### Step 5: Test the Email Service
1. Start your server
2. Register a new user
3. Check the user's email for the welcome message
4. Check server console for email logs

## 📋 What Users Will Receive

### Email Details:
- **From:** "Treasure NFT" <treasureenft@gmail.com>
- **Subject:** 🎉 Welcome to Treasure NFT - Your Investment Journey Begins!
- **Content:** Beautiful HTML email with your branding

### Email Features:
- ✅ Professional "Treasure NFT" sender name
- ✅ Personalized with user's name
- ✅ Your yellow/black brand colors
- ✅ Direct link to dashboard
- ✅ Security reminders
- ✅ Support email included

## 🔧 Configuration Files Updated

### Updated Files:
1. **emailService.js** - Professional sender name
2. **authController.js** - Sends welcome email on registration
3. **emailRoutes.js** - Test email functionality
4. **server.js** - Email routes registered

## 🧪 Testing Commands

### Test Email Service:
```bash
# Start server
npm start

# Register a new user through the website
# Check the user's email for welcome message
```

### Admin Test Route:
```bash
# Login as admin
# POST to: http://localhost:5000/api/email/test
```

## 📧 Email Template Features

### Professional Design:
- **Header:** Treasure NFT logo with brand colors
- **Welcome:** Personalized greeting with user's name
- **Features:** Platform benefits and capabilities
- **CTA Button:** Direct link to user's dashboard
- **Security:** Important reminders and tips
- **Footer:** Support email and legal information

### Brand Colors:
- **Gold:** #ffd700 (Treasure)
- **Silver:** #c0c0c0 (NFT)
- **Black:** #000000 (Background)
- **White:** #ffffff (Text)

## 🔒 Security Notes

- ✅ App password is more secure than regular password
- ✅ 2FA required for app password generation
- ✅ Email credentials stored in environment variables
- ✅ Non-blocking - registration works even if email fails
- ✅ Professional sender name for trust

## 🐛 Troubleshooting

### Common Issues:

1. **"Invalid login" error**:
   - Ensure 2FA is enabled
   - Verify app password is correct
   - Check EMAIL_USER and EMAIL_PASS in .env

2. **"Service not found" error**:
   - Gmail service is hardcoded, should work
   - Check internet connection

3. **Emails not sending**:
   - Check server console for error messages
   - Verify email credentials
   - Test with admin route

## 📝 Next Steps

1. **Create the Gmail account** (treasureenft@gmail.com)
2. **Enable 2FA and generate app password**
3. **Update your .env file** with the credentials
4. **Test by registering a new user**
5. **Check the user's email** for the welcome message

## 🎉 Success Indicators

- ✅ Server starts without email errors
- ✅ Registration works normally
- ✅ Welcome email appears in user's inbox
- ✅ Email shows "Treasure NFT" as sender
- ✅ Professional HTML design with your branding 