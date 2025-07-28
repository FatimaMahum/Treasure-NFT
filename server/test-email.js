import dotenv from 'dotenv';
import { sendWelcomeEmail } from './services/emailService.js';

dotenv.config();

console.log('🧪 Testing email service...');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not set');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM || 'Not set');

const testEmail = async () => {
  try {
    console.log('📧 Sending test welcome email...');
    
    const result = await sendWelcomeEmail(
      'Test User', 
      process.env.TEST_EMAIL || process.env.EMAIL_USER || 'test@gmail.com'
    );
    
    console.log('📧 Test result:', result);
    
    if (result.success) {
      console.log('✅ Email sent successfully!');
    } else {
      console.log('❌ Email failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testEmail(); 