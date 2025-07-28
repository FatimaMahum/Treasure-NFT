import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./Footer.module.css";
import { useState } from "react";

const Footer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showContactModal, setShowContactModal] = useState(false);
  const email = "treasureenft@gmail.com";

  const handleDashboardClick = (e) => {
    e.preventDefault();
    if (user) {
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } else {
      navigate("/login");
    }
  };

  const handleReferralsClick = (e) => {
    e.preventDefault();
    if (user) {
      navigate("/referrals");
    } else {
      navigate("/login");
    }
  };

  const handleContactClick = (e) => {
    e.preventDefault();
    setShowContactModal(true);
  };

  const handleCloseModal = () => setShowContactModal(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    alert("Email copied to clipboard!");
  };

  const handleMailTo = () => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <div className={styles.footerLogo}>
              <span className={styles.treasure}>Nova</span>
              <span className={styles.nft}>Eye</span>
            </div>
            <p className={styles.footerDescription}>
              The future of AI-powered NFT investing. Join thousands of investors earning daily profits.
            </p>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink}>📱</a>
              <a href="#" className={styles.socialLink}>🐦</a>
              <a href="#" className={styles.socialLink}>💬</a>
              <a href="#" className={styles.socialLink}>📧</a>
            </div>
          </div>

          <div className={styles.footerSection}>
            <h4 className={styles.sectionTitle}>Platform</h4>
            <div className={styles.footerLinks}>
              <a href="/invest">Investment Plans</a>
              <a href="/dashboard" onClick={handleDashboardClick}>Dashboard</a>
              {user && user.role !== "admin" && (
                <a href="/referrals" onClick={handleReferralsClick}>Referrals</a>
              )}
              <a href="/faq">FAQ</a>
            </div>
          </div>

          <div className={styles.footerSection}>
            <h4 className={styles.sectionTitle}>Company</h4>
            <div className={styles.footerLinks}>
              <a href="/about">About Us</a>
              <a href="#">Terms of Service</a>
              <a href="#">Privacy Policy</a>
              <a href="#" onClick={handleContactClick}>Contact</a>
            </div>
          </div>

          <div className={styles.footerSection}>
            <h4 className={styles.sectionTitle}>Support</h4>
            <div className={styles.footerLinks}>
              <a href="/faq">Help Center</a>
            
            <a href="#" onClick={handleContactClick}>Email Support</a>
              <a href="#">Community</a>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <div className={styles.footerDisclaimer}>
            <p>&copy; 2024 NovaEye. All rights reserved.</p>
          </div>
        </div>
      </div>
      {showContactModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999
        }}>
          <div style={{
            background: "#111",
            borderRadius: 16,
            padding: 36,
            minWidth: 340,
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            textAlign: "center",
            color: "#fff",
            border: "2px solid #ffd700"
          }}>
            <h3 style={{marginBottom: 18, color: "#ffd700"}}>Contact Us</h3>
            <p style={{marginBottom: 16}}>For any query, contact this email:</p>
            <p style={{fontWeight: "bold", color: "#ffd700", marginBottom: 28, fontSize: 18}}>{email}</p>
            <button onClick={handleCopyEmail} style={{marginRight: 14, padding: "10px 20px", borderRadius: 8, border: "none", background: "#ffd700", color: "#111", fontWeight: 700, cursor: "pointer", fontSize: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.15)"}}>Copy Email</button>
            <button onClick={handleCloseModal} style={{padding: "10px 20px", borderRadius: 8, border: "none", background: "#111", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 16, border: "1.5px solid #ffd700", marginLeft: 4}}>Close</button>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
