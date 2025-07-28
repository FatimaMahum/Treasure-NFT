import dotenv from 'dotenv';
import { sendWelcomeEmail } from './services/emailService.js';

dotenv.config();

console.log("🧪 Testing Email Configuration...");
console.log("Environment variables:");
console.log("EMAIL_USER:", process.env.EMAIL_USER ? "Set" : "Not set");
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Set" : "Not set");
console.log("EMAIL_FROM:", process.env.EMAIL_FROM || "Not set");

const testEmail = async () => {
  try {
    console.log("📧 Testing welcome email...");
    const result = await sendWelcomeEmail("Test User", "test@gmail.com");
    console.log("📧 Test result:", result);
    
    if (result.success) {
      console.log("✅ Email test successful!");
    } else {
      console.log("❌ Email test failed:", result.error);
    }
  } catch (error) {
    console.error("❌ Email test error:", error);
  }
};

testEmail(); 