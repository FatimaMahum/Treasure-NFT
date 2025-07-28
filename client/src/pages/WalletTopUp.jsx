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
  const [paymentMethod, setPaymentMethod] = useState("easypaisa");

  const handleTopUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!amount || amount <= 0) {
        toast.error("Please enter a valid amount");
        setLoading(false);
        return;
      }

      if (paymentMethod === "easypaisa") {
        const response = await axios.post("http://localhost:5000/api/easypaisa/pay", {
          amount: parseFloat(amount),
          email: user.email
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.redirectUrl) {
          window.location.href = response.data.redirectUrl;
        } else {
          toast.error("Failed to initiate top-up");
        }
      } else if (paymentMethod === "crypto") {
        const response = await axios.post("http://localhost:5000/api/crypto/checkout", {
          amount: parseFloat(amount),
          userId: user.id,
          email: user.email,
          purpose: "wallet_topup"
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.hosted_url) {
          window.location.href = response.data.hosted_url;
        } else {
          toast.error("Failed to initiate crypto payment");
        }
      }
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
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className={styles.paymentMethodSelect}
                required
              >
                <option value="easypaisa">Easypaisa</option>
                <option value="crypto">Crypto (Bitcoin, Ethereum, etc.)</option>
              </select>
            </div>

            <button type="submit" className={styles.topUpBtn} disabled={loading}>
              {loading ? "Processing..." : `Top Up with ${paymentMethod === "easypaisa" ? "Easypaisa" : "Crypto"}`}
            </button>
          </form>

          <div className={styles.info}>
            <p>• You will be redirected to a secure payment page</p>
            <p>• After successful payment, your wallet will be updated automatically</p>
            <p>• You can use your wallet balance for investments</p>
            {paymentMethod === "crypto" && (
              <p>• Supported cryptocurrencies: Bitcoin, Ethereum, Litecoin, and more</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default WalletTopUp; 