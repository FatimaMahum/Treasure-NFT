import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "./Register.module.css";

const Register = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    whatsapp: ""
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    whatsapp: "",
    referralCode: searchParams.get("ref") || ""
  });

  const validatePassword = (password) => {
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
    const hasLength = password.length >= 8;
    
    return hasLength && hasLower && hasUpper && hasNumber && hasSpecial;
  };

  const validateWhatsApp = (number) => {
    return /^\d{10,15}$/.test(number);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Register form submitted");
    console.log("Form data:", formData);
    setLoading(true);

    // Validation
    console.log("Starting validation...");
    let hasErrors = false;
    
    if (!formData.name.trim()) {
      console.log("Name validation failed");
      setErrors(prev => ({ ...prev, name: "Username is required" }));
      hasErrors = true;
    }
    console.log("Name validation passed");

    if (!formData.email.trim()) {
      console.log("Email validation failed");
      setErrors(prev => ({ ...prev, email: "Email is required" }));
      hasErrors = true;
    }
    console.log("Email validation passed");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      console.log("Email format validation failed");
      setErrors(prev => ({ ...prev, email: "Please enter a valid email address" }));
      hasErrors = true;
    }
    console.log("Email format validation passed");

    // Check if it's a Gmail address for better experience
    if (!formData.email.toLowerCase().endsWith('@gmail.com')) {
      console.log("Gmail validation warning");
      toast.warning("For best experience and welcome emails, please use a Gmail address");
      // Don't block registration, just warn
    }

    if (!validatePassword(formData.password)) {
      console.log("Password validation failed");
      setErrors(prev => ({ ...prev, password: "Password must contain a special character, number, and at least 8 characters" }));
      hasErrors = true;
    }
    console.log("Password validation passed");

    if (!validateWhatsApp(formData.whatsapp)) {
      console.log("WhatsApp validation failed");
      setErrors(prev => ({ ...prev, whatsapp: "Please enter a valid WhatsApp number (10-15 digits)" }));
      hasErrors = true;
    }
    console.log("WhatsApp validation passed");

    if (hasErrors) {
      setLoading(false);
      return;
    }

    console.log("Passed validation, calling register...");
    console.log("Register function type:", typeof register);
    console.log("Register function:", register);
    try {
      console.log("About to call register function...");
      const result = await register(formData);
      console.log("Register result received:", result);
      console.log("Result success:", result.success);
      console.log("Result message:", result.message);
      
      if (result.success) {
        console.log("Registration successful, showing success toast...");
        toast.success(result.message);
        console.log("Resetting form data...");
        setFormData({ name: "", email: "", password: "", whatsapp: "", referralCode: "" }); // Reset form
        console.log("Navigating to login page...");
        navigate("/login"); // Redirect to login
      } else {
        console.log("Registration failed, showing field error...");
        console.log("Error message:", result.message);
        
        // Show backend validation errors as field-specific messages
        if (result.message.includes("User already registered") || result.message.includes("Gmail") || result.message.includes("email") || result.message.includes("Email") || 
            result.message.includes("email address") || result.message.includes("Email already registered")) {
          setErrors(prev => ({ ...prev, email: result.message }));
        } else if (result.message.includes("Username") || result.message.includes("name") || result.message.includes("Name") ||
                   result.message.includes("Username already taken")) {
          setErrors(prev => ({ ...prev, name: result.message }));
        } else if (result.message.includes("password") || result.message.includes("Password")) {
          setErrors(prev => ({ ...prev, password: result.message }));
        } else if (result.message.includes("WhatsApp") || result.message.includes("whatsapp") || 
                   result.message.includes("WhatsApp number")) {
          setErrors(prev => ({ ...prev, whatsapp: result.message }));
        } else {
          // Generic error for other cases
          toast.error(result.message);
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
    }
    console.log("Setting loading to false...");
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <div className={styles.registerContainer}>
        <div className={styles.registerForm}>
          <h2>Create Account</h2>
          <p>Join our investment platform and start earning today!</p>
          
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Username</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your username"
              />
              {errors.name && <p className={styles.errorMessage}>{errors.name}</p>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
              {errors.email && <p className={styles.errorMessage}>{errors.email}</p>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <div className={styles.passwordContainer}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                />
                <span
                  className={styles.eyeIcon}
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{ cursor: "pointer" }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "👁️" : "🙈"}
                </span>
              </div>
              
              {/* Simple password error message */}
              {errors.password && <p className={styles.errorMessage}>{errors.password}</p>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="whatsapp">WhatsApp Number</label>
              <input
                type="tel"
                id="whatsapp"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                required
                placeholder="Enter your WhatsApp number"
              />
              {errors.whatsapp && <p className={styles.errorMessage}>{errors.whatsapp}</p>}
            </div>

            <button type="submit" disabled={loading} className={styles.registerBtn}>
              {loading ? "Creating Account..." : "Register "}
            </button>
          </form>

          <div className={styles.loginLink}>
            Already have an account?{" "}
            <span onClick={() => navigate("/login")}>Login here</span>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Register;
