import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import OtpVerification from "../components/OtpVerification";
import styles from "./Login.module.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const { login, loginWithToken } = useAuth();
  const navigate = useNavigate();

  // Create axios instance
  const api = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateEmail(formData.email)) {
      toast.error("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/auth/login", formData);
      
      if (response.data.success) {
        if (response.data.requiresOtp) {
          // Show OTP verification
          setPendingUser(response.data.user);
          setShowOtpVerification(true);
          toast.success(response.data.message);
          
          // In development, show the OTP code in console
          if (response.data.message.includes('DEV:')) {
            const otpCode = response.data.message.match(/DEV: (\d+)/)?.[1];
            if (otpCode) {
              console.log('🔐 Development OTP Code:', otpCode);
              toast.info(`Development OTP: ${otpCode} (check console)`);
            }
          }
        } else {
          // Direct login
          loginWithToken(response.data.token, response.data.user);
          toast.success(response.data.message);
          const user = JSON.parse(localStorage.getItem("user"));
          if (user?.role === "admin") {
            navigate("/admin");
          } else {
            navigate("/dashboard");
          }
        }
      } else {
        toast.error(response.data.message || "Invalid email or password.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Login failed. Please try again.");
    }

    setLoading(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordLoading(true);

    if (!validateEmail(forgotPasswordEmail)) {
      toast.error("Please enter a valid email address.");
      setForgotPasswordLoading(false);
      return;
    }

    try {
      const response = await api.post("/auth/forgot-password", {
        email: forgotPasswordEmail
      });

      if (response.data.success) {
        toast.success("Verification code sent to your email!");
        setShowForgotPassword(false);
        setForgotPasswordEmail("");
        // Navigate to forgot password page
        navigate("/forgot-password", { state: { email: forgotPasswordEmail } });
      } else {
        toast.error(response.data.message || "Failed to send verification code.");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error(error.response?.data?.message || "Failed to send verification code.");
    }

    setForgotPasswordLoading(false);
  };

  return (
    <>
      <Navbar />
      <main className={`${styles.loginContainer} fade-in`}>
        <div className={`${styles.loginCard} slide-up`}>
          <h2 className={styles.cardTitle}>Login to Your Account</h2>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="username"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
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
            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              {loading ? <span className="loading-spinner"></span> : "Login"}
            </button>
          </form>
          
          <div className={styles.forgotPasswordSection}>
            <button 
              type="button" 
              onClick={() => setShowForgotPassword(!showForgotPassword)}
              className={styles.forgotPasswordBtn}
            >
              Forgot Password?
            </button>
            
            {showForgotPassword && (
              <form onSubmit={handleForgotPassword} className={styles.forgotPasswordForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="forgotEmail">Enter your email</label>
                  <input
                    type="email"
                    id="forgotEmail"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                <button type="submit" className={styles.btnSecondary} disabled={forgotPasswordLoading}>
                  {forgotPasswordLoading ? <span className="loading-spinner"></span> : "Send Reset Code"}
                </button>
              </form>
            )}
          </div>

          <p className={styles.authSwitch}>
            Don't have an account?{" "}
            <Link to="/register" className={styles.registerLink}>
              Register here
            </Link>
          </p>
          <div className={styles.cardGlow}></div>
        </div>
      </main>
      
      {showOtpVerification && pendingUser && (
        <OtpVerification 
          user={pendingUser}
          onVerificationSuccess={() => {
            setShowOtpVerification(false);
            setPendingUser(null);
            const user = JSON.parse(localStorage.getItem("user"));
            if (user?.role === "admin") {
              navigate("/admin");
            } else {
              navigate("/dashboard");
            }
          }}
        />
      )}
      
      <Footer />
    </>
  );
};

export default Login;
