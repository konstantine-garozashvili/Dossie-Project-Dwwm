# SMTP Configuration Guide for IT13 Project

## Overview
This guide will help you set up email functionality for the IT13 project using Mailtrap for development and testing.

## Option 1: Mailtrap (Recommended for Development)

### Step 1: Create a Mailtrap Account
1. Go to [https://mailtrap.io](https://mailtrap.io)
2. Sign up for a free account
3. Verify your email address

### Step 2: Create an Inbox
1. After logging in, click "Add Inbox"
2. Name it "IT13 Development"
3. Select "Email Testing" category

### Step 3: Get SMTP Credentials
1. Click on your inbox
2. Go to "SMTP Settings" tab
3. Select "Node.js - Nodemailer" from the dropdown
4. Copy the credentials

### Step 4: Configure Environment Variables
Create a `.env` file in the `backend` directory with these settings:

```env
# SMTP Configuration (Mailtrap)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_username_here
SMTP_PASS=your_mailtrap_password_here
SMTP_FROM_EMAIL=noreply@it13.com
SMTP_FROM_NAME=IT13 Support

# Frontend URL for email links
FRONTEND_URL=http://localhost:5173
```

### Step 5: Test Email Functionality
1. Start your backend server: `cd backend && npm run dev`
2. Approve a technician application from the admin dashboard
3. Check your Mailtrap inbox for the email

## Option 2: Ethereal Email (Free Alternative)

### Step 1: Generate Test Account
1. Go to [https://ethereal.email](https://ethereal.email)
2. Click "Create Ethereal Account"
3. Copy the generated credentials

### Step 2: Configure Environment Variables
```env
# SMTP Configuration (Ethereal)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your_ethereal_username
SMTP_PASS=your_ethereal_password
SMTP_FROM_EMAIL=noreply@it13.com
SMTP_FROM_NAME=IT13 Support

FRONTEND_URL=http://localhost:5173
```

## Option 3: Gmail SMTP (For Production-like Testing)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Enable 2-Factor Authentication

### Step 2: Generate App Password
1. Go to Google Account > Security > App passwords
2. Generate a new app password for "Mail"
3. Copy the 16-character password

### Step 3: Configure Environment Variables
```env
# SMTP Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_16_character_app_password
SMTP_FROM_EMAIL=your_gmail@gmail.com
SMTP_FROM_NAME=IT13 Support

FRONTEND_URL=http://localhost:5173
```

## Email Templates Included

The system includes the following email templates:

### 1. Technician Approval Email
- **Trigger**: When admin approves a technician application
- **Content**: Welcome message, temporary password, login instructions
- **Features**: Password requirements, security warnings, direct login link

### 2. Application Rejection Email
- **Trigger**: When admin rejects a technician application
- **Content**: Professional rejection message with optional reason
- **Features**: Encouragement to reapply, contact information

### 3. Password Reset Email
- **Trigger**: When user requests password reset
- **Content**: Secure reset link with 1-hour expiration
- **Features**: Security warnings, clear instructions

## Testing Email Functionality

### 1. Test Technician Approval
```bash
# 1. Start the backend server
cd backend && npm run dev

# 2. Start the frontend server
cd frontend && npm run dev

# 3. Login as admin (admin@it13.com / admin123)
# 4. Go to Candidatures tab
# 5. Approve a pending application
# 6. Check your email testing service for the approval email
```

### 2. Test Password Reset
```bash
# 1. Go to technician login page
# 2. Click "Mot de passe oublié?"
# 3. Enter a technician email
# 4. Check your email testing service for the reset email
```

## Security Considerations

### Development
- ✅ Use Mailtrap or Ethereal for testing
- ✅ Never use real user emails in development
- ✅ Keep SMTP credentials in `.env` file (not committed)

### Production
- ✅ Use a professional email service (SendGrid, AWS SES, etc.)
- ✅ Set up proper SPF, DKIM, and DMARC records
- ✅ Use environment variables for all credentials
- ✅ Enable email rate limiting
- ✅ Monitor email delivery rates

## Troubleshooting

### Common Issues

#### 1. "Email transporter not initialized"
- Check that all SMTP environment variables are set
- Verify SMTP credentials are correct
- Restart the backend server after changing `.env`

#### 2. "Connection timeout"
- Check SMTP host and port
- Verify firewall settings
- Try different SMTP port (587, 465, 2525)

#### 3. "Authentication failed"
- Double-check username and password
- For Gmail, ensure you're using app password, not regular password
- For Mailtrap, verify credentials from the inbox settings

#### 4. Emails not appearing in Mailtrap
- Check the correct inbox
- Verify the "To" email address
- Check spam/junk folder (though Mailtrap catches all emails)

### Debug Mode
Enable debug logging by adding to your `.env`:
```env
DEBUG_EMAIL=true
```

This will log detailed email sending information to the console.

## Email Service Features

### Automatic Password Generation
- 12-character passwords with mixed case, numbers, and symbols
- Excludes confusing characters (0, O, l, 1)
- Ensures at least one of each character type

### Password Requirements Validation
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- No common patterns (123456, password, etc.)

### Security Features
- Temporary passwords expire in 24 hours
- Password reset tokens expire in 1 hour
- Forced password change on first login
- Secure password hashing with bcrypt (12 rounds)

## Next Steps

1. Choose your preferred email testing service
2. Configure the `.env` file with your credentials
3. Test the email functionality
4. Customize email templates if needed
5. Set up production email service when ready to deploy

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Test with a simple email first
4. Check the email service status page
5. Review the troubleshooting section above

For production deployment, consider using:
- **SendGrid** (99% delivery rate, good free tier)
- **AWS SES** (Very reliable, pay-per-use)
- **Mailgun** (Developer-friendly, good documentation)
- **Postmark** (Excellent for transactional emails) 