import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "./ForgotPassword.module.css";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: enter code, 2: enter new password
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Create axios instance
  const api = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL
  });

  useEffect(() => {
    // Get email from navigation state
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit verification code.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/auth/verify-reset-code", {
        email,
        verificationCode
      });

      if (response.data.success) {
        setResetToken(response.data.resetToken);
        setStep(2);
        toast.success("Code verified successfully! Enter your new password.");
      } else {
        toast.error(response.data.message || "Invalid verification code.");
      }
    } catch (error) {
      console.error("Verify code error:", error);
      toast.error(error.response?.data?.message || "Failed to verify code.");
    }

    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/auth/reset-password", {
        resetToken,
        newPassword,
        confirmPassword
      });

      if (response.data.success) {
        toast.success("Password reset successfully! You can now login with your new password.");
        navigate("/login");
      } else {
        toast.error(response.data.message || "Failed to reset password.");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error(error.response?.data?.message || "Failed to reset password.");
    }

    setLoading(false);
  };

  const handleResendCode = async () => {
    setLoading(true);

    try {
      const response = await api.post("/auth/forgot-password", {
        email
      });

      if (response.data.success) {
        toast.success("New verification code sent to your email!");
      } else {
        toast.error(response.data.message || "Failed to send verification code.");
      }
    } catch (error) {
      console.error("Resend code error:", error);
      toast.error(error.response?.data?.message || "Failed to send verification code.");
    }

    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <main className={`${styles.forgotPasswordContainer} fade-in`}>
        <div className={`${styles.forgotPasswordCard} slide-up`}>
          <h2 className={styles.cardTitle}>
            {step === 1 ? "Enter Verification Code" : "Reset Your Password"}
          </h2>
          
          {step === 1 ? (
            <form onSubmit={handleVerifyCode}>
              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="verificationCode">Verification Code</label>
                <input
                  type="text"
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                  style={{ letterSpacing: '2px', fontSize: '18px', textAlign: 'center' }}
                />
                <small className={styles.helpText}>
                  Enter the 6-digit code sent to your email
                </small>
              </div>
              
              <button type="submit" className={styles.btnPrimary} disabled={loading}>
                {loading ? <span className="loading-spinner"></span> : "Verify Code"}
              </button>
              
              <div className={styles.resendSection}>
                <p>Didn't receive the code?</p>
                <button 
                  type="button" 
                  onClick={handleResendCode}
                  className={styles.resendBtn}
                  disabled={loading}
                >
                  Resend Code
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className={styles.formGroup}>
                <label htmlFor="newPassword">New Password</label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
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
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                  <span
                    className={styles.eyeIcon}
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    style={{ cursor: "pointer" }}
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? "👁️" : "🙈"}
                  </span>
                </div>
              </div>
              
              <button type="submit" className={styles.btnPrimary} disabled={loading}>
                {loading ? <span className="loading-spinner"></span> : "Reset Password"}
              </button>
            </form>
          )}
          
          <div className={styles.backToLogin}>
            <button 
              type="button" 
              onClick={() => navigate("/login")}
              className={styles.backBtn}
            >
              ← Back to Login
            </button>
          </div>
          
          <div className={styles.cardGlow}></div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ForgotPassword; 