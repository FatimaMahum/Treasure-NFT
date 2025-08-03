import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "./WalletTopUp.module.css";

const WalletTopUp = () => {
  const { user, token } = useAuth();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentMethod] = useState("usdt_trc20");

  const handleTopUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!amount || amount <= 0) {
        toast.error("Please enter a valid amount");
        setLoading(false);
        return;
      }

      // Redirect to deposit page with amount
      window.location.href = `/deposit?amount=${amount}`;
    } catch (error) {
      toast.error(error.response?.data?.message || "Top-up failed");
    }

    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <main className={styles.topUpContainer}>
        <div className={styles.topUpCard}>
          <h2>Top Up Your Wallet</h2>
          <p>Add funds to your wallet using your preferred payment method</p>
          
          <form onSubmit={handleTopUp}>
            <div className={styles.formGroup}>
              <label htmlFor="amount">Amount ($)</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                step="1"
                placeholder="Enter amount"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="paymentMethod">Payment Method</label>
              <div className={styles.paymentMethodDisplay}>
                <span>USDT TRC20</span>
                <small>Only USDT on Tron network accepted</small>
              </div>
            </div>

            <button type="submit" className={styles.topUpBtn} disabled={loading}>
              {loading ? "Processing..." : "Proceed to Deposit"}
            </button>
          </form>

          <div className={styles.info}>
            <p>• You will be redirected to the deposit page</p>
            <p>• Send USDT to the provided address</p>
            <p>• Upload screenshot of your transaction</p>
            <p>• Your wallet will be credited after admin approval</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default WalletTopUp; 