import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

// Import emailService AFTER loading env vars
import emailService from './src/utils/emailService.js';

async function testEmail() {
  console.log('Testing email sending...');
  console.log('SMTP Configuration:');
  console.log('Host:', process.env.SMTP_HOST);
  console.log('Port:', process.env.SMTP_PORT);
  console.log('User:', process.env.SMTP_USER);
  console.log('From Email:', process.env.SMTP_FROM_EMAIL);
  
  // Force re-initialization of the email service
  emailService.initializeTransporter();
  
  try {
    const result = await emailService.sendEmail(
      'test@example.com',
      'Test Email from IT13',
      '<h1>Hello from IT13!</h1><p>This is a test email to verify SMTP configuration.</p>',
      'Hello from IT13! This is a test email to verify SMTP configuration.'
    );
    
    console.log('Email test result:', result);
    
    if (result.success) {
      console.log('✅ Email sent successfully! Check your Mailtrap inbox.');
    } else {
      console.log('❌ Email failed to send:', result.error);
    }
  } catch (error) {
    console.error('❌ Error testing email:', error);
  }
}

testEmail(); 