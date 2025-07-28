import axios from 'axios';

// Email validation service
export const validateGmailAccount = async (email) => {
  try {
    console.log("Validating Gmail account:", email);
    
    // First, check if it's a valid Gmail format
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      console.log("Gmail regex validation failed");
      return {
        valid: false,
        message: "Please enter a valid Gmail address (example@gmail.com)"
      };
    }

    // Check if Gmail account exists using Gmail's API or alternative method
    // Note: Gmail doesn't provide a public API to check account existence
    // We'll use a combination of format validation and DNS check
    
    // Extract domain and check if it's gmail.com
    const domain = email.split('@')[1];
    if (domain !== 'gmail.com') {
      console.log("Domain validation failed:", domain);
      return {
        valid: false,
        message: "Please enter a valid Gmail address"
      };
    }

    // Additional validation: Check email format and common patterns
    const emailParts = email.split('@')[0];
    console.log("Email parts:", emailParts, "Length:", emailParts.length);
    
    // Check for valid characters in local part
    const localPartRegex = /^[a-zA-Z0-9._%+-]+$/;
    if (!localPartRegex.test(emailParts)) {
      console.log("Local part regex validation failed");
      return {
        valid: false,
        message: "Email contains invalid characters"
      };
    }

    // Check length constraints (Gmail limits) - be more lenient
    if (emailParts.length < 3) { // Gmail minimum is actually 3 characters
      console.log("Email too short:", emailParts.length);
      return {
        valid: false,
        message: "Gmail username must be at least 3 characters"
      };
    }
    
    if (emailParts.length > 64) { // Gmail allows up to 64 characters
      console.log("Email too long:", emailParts.length);
      return {
        valid: false,
        message: "Gmail username must be less than 64 characters"
      };
    }

    // Check for common invalid patterns
    if (emailParts.startsWith('.') || emailParts.endsWith('.') || emailParts.includes('..')) {
      console.log("Invalid Gmail pattern detected");
      return {
        valid: false,
        message: "Invalid Gmail format"
      };
    }

    console.log("Gmail validation passed");
    // If all validations pass, consider it valid
    // Note: We can't actually verify if the Gmail account exists without Gmail's API
    // But we can validate the format and structure
    return {
      valid: true,
      message: "Valid Gmail address"
    };

  } catch (error) {
    console.error('Email validation error:', error);
    return {
      valid: false,
      message: "Error validating email address"
    };
  }
};

// Enhanced validation with additional checks
export const validateEmailForRegistration = async (email) => {
  try {
    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        valid: false,
        message: "Please enter a valid email address"
      };
    }

    // Check if it's Gmail - only Gmail addresses are allowed
    if (email.toLowerCase().endsWith('@gmail.com')) {
      const gmailValidation = await validateGmailAccount(email);
      return gmailValidation;
    }

    // Reject non-Gmail addresses
    return {
      valid: false,
      message: "Please enter a valid Gmail address (example@gmail.com)"
    };

  } catch (error) {
    console.error('Email validation error:', error);
    return {
      valid: false,
      message: "Error validating email address"
    };
  }
};

// Test function for email validation
export const testEmailValidation = async (email) => {
  console.log(`Testing email validation for: ${email}`);
  const result = await validateEmailForRegistration(email);
  console.log('Validation result:', result);
  return result;
}; 