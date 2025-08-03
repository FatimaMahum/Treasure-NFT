import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import styles from './OtpVerification.module.css';

const OtpVerification = ({ user, onVerificationSuccess }) => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        console.log('Timer tick:', prev); // Debug log
        if (prev <= 1) {
          clearInterval(timer);
          console.log('Timer expired!'); // Debug log
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit OTP code');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          otpCode: otp,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('OTP verified successfully!');
        
        // Login the user with the token
        loginWithToken(data.token, data.user);
        
        // Call the success callback if provided
        if (onVerificationSuccess) {
          onVerificationSuccess();
        } else {
          // Navigate to appropriate dashboard
          if (data.user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        }
      } else {
        toast.error(data.message || 'OTP verification failed');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    console.log('🔄 Resend OTP clicked!'); // Debug log
    setIsLoading(true);
    
    try {
      console.log('📧 Calling resend OTP endpoint...'); // Debug log
      // Call resend OTP endpoint
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
        }),
      });

      console.log('📧 Response received:', response.status); // Debug log
      const data = await response.json();
      console.log('📧 Response data:', data); // Debug log

      if (data.success) {
        toast.success('New OTP sent to your email!');
        setTimeLeft(60); // Reset timer to 60 seconds (1 minute)
        setOtp(''); // Clear OTP input
        
        // In development, show the OTP code in console
        if (data.message.includes('DEV:')) {
          const otpCode = data.message.match(/DEV: (\d+)/)?.[1];
          if (otpCode) {
            console.log('🔐 Development OTP Code:', otpCode);
            toast.info(`Development OTP: ${otpCode} (check console)`);
          }
        }
      } else {
        toast.error(data.message || 'Failed to resend OTP. Please try logging in again.');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.otpOverlay}>
      <div className={styles.otpModal}>
        <div className={styles.otpHeader}>
          <h2>🔐 Email Verification</h2>
          <p>We've sent a 6-digit code to <strong>{user.email}</strong></p>
        </div>

        <form onSubmit={handleSubmit} className={styles.otpForm}>
          <div className={styles.otpInputContainer}>
            <label htmlFor="otp">Enter Verification Code</label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={handleOtpChange}
              placeholder="000000"
              maxLength={6}
              className={styles.otpInput}
              autoComplete="one-time-code"
            />
          </div>

          <div className={styles.timerContainer}>
            <p>Code expires in: <span className={styles.timer}>{formatTime(timeLeft)}</span></p>
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length !== 6 || timeLeft === 0}
            className={styles.verifyButton}
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </button>

          <button
            type="button"
            onClick={handleResendOtp}
            disabled={isLoading || timeLeft > 0}
            className={styles.resendButton}
            style={{ 
              display: timeLeft === 0 ? 'block' : 'none',
              marginTop: '10px'
            }}
          >
            {isLoading ? 'Sending...' : 'Resend Code'}
          </button>
          {/* Debug info */}
          <div style={{fontSize: '12px', color: '#666', marginTop: '10px'}}>
            Debug: timeLeft={timeLeft}, isLoading={isLoading.toString()}
          </div>
        </form>

        <div className={styles.otpFooter}>
          <p>Didn't receive the code? Check your spam folder or</p>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={isLoading || timeLeft > 0}
            className={styles.resendLink}
          >
            resend code
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification; 