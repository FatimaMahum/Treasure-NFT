import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "./PaymentGateway.module.css";

const PaymentGateway = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    sessionId: "",
    amount: 0,
    user: ""
  });

  useEffect(() => {
    const session = searchParams.get("session");
    const amount = searchParams.get("amount");
    const user = searchParams.get("user");

    if (session && amount && user) {
      setPaymentData({
        sessionId: session,
        amount: parseFloat(amount),
        user: user
      });
    } else {
      toast.error("Invalid payment session");
      navigate("/invest");
    }
  }, [searchParams, navigate]);

  const handlePaymentSuccess = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/payments/success`, {
        transactionId: `EP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sessionId: paymentData.sessionId,
        amount: paymentData.amount,
        planId: "bronze", // You might want to pass this in URL params
        paymentMethod: "easypaisa"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success("Payment successful! Your investment has been processed.");
        navigate("/dashboard");
      } else {
        toast.error(response.data.message || "Payment processing failed");
      }
    } catch (error) {
      toast.error("Failed to process payment");
    }
    setLoading(false);
  };

  const handlePaymentCancel = () => {
    navigate("/invest");
  };

  return (
    <>
      <Navbar />
      <main className={styles.paymentContainer}>
        <div className={styles.paymentCard}>
          <div className={styles.paymentHeader}>
            <h2>Easypaisa Payment Gateway</h2>
            <div className={styles.amount}>${paymentData.amount.toFixed(2)}</div>
          </div>

          <div className={styles.paymentDetails}>
            <div className={styles.detailRow}>
              <span>Amount:</span>
              <span>${paymentData.amount.toFixed(2)}</span>
            </div>
            <div className={styles.detailRow}>
              <span>Session ID:</span>
              <span>{paymentData.sessionId}</span>
            </div>
            <div className={styles.detailRow}>
              <span>Payment Method:</span>
              <span>Easypaisa</span>
            </div>
          </div>

          <div className={styles.paymentActions}>
            <button 
              onClick={handlePaymentSuccess}
              disabled={loading}
              className={styles.successBtn}
            >
              {loading ? "Processing..." : "Confirm Payment"}
            </button>
            <button 
              onClick={handlePaymentCancel}
              className={styles.cancelBtn}
            >
              Cancel Payment
            </button>
          </div>

          <div className={styles.paymentNote}>
            <p>This is a simulated payment gateway for demonstration purposes.</p>
            <p>In a real implementation, this would redirect to Easypaisa's payment interface.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default PaymentGateway; 