import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "./Deposit.module.css";

const Deposit = () => {
  const { user, token } = useAuth();
  const [searchParams] = useSearchParams();
  const [amount, setAmount] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // USDT TRC20 Address (you can make this configurable from backend)
  const USDT_ADDRESS = "TNVFSb5Jv1HNavWitufyEzdwoU5ZrSChpK";
  const NETWORK = "Tron (TRC20)";
  const CONTRACT_INFO = "Contract: ***jLj6t";

  useEffect(() => {
    const amountParam = searchParams.get("amount");
    if (amountParam) {
      setAmount(amountParam);
    }
  }, [searchParams]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(USDT_ADDRESS);
      setCopied(true);
      toast.success("Address copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy address");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setScreenshot(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("🔍 Submit deposit - User:", user);
      console.log("🔍 Submit deposit - Token:", token);
      
      if (!amount || amount <= 0) {
        toast.error("Please enter a valid amount");
        setLoading(false);
        return;
      }

      if (!screenshot) {
        toast.error("Please upload a screenshot of your transaction");
        setLoading(false);
        return;
      }

      if (!token) {
        toast.error("Please log in to submit a deposit");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("amount", amount);
      formData.append("screenshot", screenshot);

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/deposits/submit`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Deposit submitted successfully! Awaiting admin approval.");
        // Reset form
        setScreenshot(null);
        setAmount("");
        // Clear file input
        const fileInput = document.getElementById("screenshot");
        if (fileInput) fileInput.value = "";
      } else {
        toast.error(response.data.message || "Failed to submit deposit");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit deposit");
    }

    setLoading(false);
  };

  // Generate QR code for the address
  const generateQRCode = () => {
    const qrData = `tron:${USDT_ADDRESS}?amount=${amount}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
  };

  return (
    <>
      <Navbar />
      <main className={styles.depositContainer}>
        <div className={styles.depositCard}>
          <h2>USDT Deposit</h2>
          <p>Send USDT to the address below and upload your transaction screenshot</p>

          <div className={styles.qrSection}>
            <div className={styles.qrCode}>
              <img src={generateQRCode()} alt="QR Code" />
            </div>
          </div>

          <div className={styles.addressSection}>
            <div className={styles.networkInfo}>
              <label>Network</label>
              <div className={styles.networkDisplay}>
                <span className={styles.networkName}>{NETWORK}</span>
                <span className={styles.contractInfo}>{CONTRACT_INFO}</span>
                <button className={styles.networkSwitch} title="Switch Network">
                  ↕
                </button>
              </div>
            </div>

            <div className={styles.addressInfo}>
              <label>Deposit Address</label>
              <div className={styles.addressDisplay}>
                <span className={styles.address}>{USDT_ADDRESS}</span>
                <button 
                  className={styles.copyButton} 
                  onClick={copyToClipboard}
                  title="Copy Address"
                >
                  {copied ? "✓" : "📋"}
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.uploadForm}>
            <div className={styles.formGroup}>
              <label htmlFor="amount">Amount (USDT)</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                step="0.01"
                placeholder="Enter amount"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="screenshot">Transaction Screenshot</label>
              <input
                type="file"
                id="screenshot"
                accept="image/*"
                onChange={handleFileChange}
                required
                className={styles.fileInput}
              />
              {screenshot && (
                <div className={styles.filePreview}>
                  <img 
                    src={URL.createObjectURL(screenshot)} 
                    alt="Preview" 
                    className={styles.previewImage}
                  />
                  <span className={styles.fileName}>{screenshot.name}</span>
                </div>
              )}
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "Submitting..." : "Submit Deposit"}
            </button>
          </form>

          <div className={styles.instructions}>
            <h3>Instructions:</h3>
            <ol>
              <li>Send the exact amount of USDT to the address above</li>
              <li>Make sure to use the Tron (TRC20) network</li>
              <li>Take a screenshot of your transaction</li>
              <li>Upload the screenshot and submit</li>
              <li>Wait for admin approval (usually within 24 hours)</li>
            </ol>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Deposit; 