"use client"

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "./Dashboard.module.css";
import { getMyInvestments } from "../services/investmentService";
import { QRCodeCanvas } from "qrcode.react";
import { requestWithdrawal, getMyWithdrawals } from "../services/withdrawalService";

const Dashboard = () => {
  const { user, token, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    walletBalance: 0,
    dailyEarnings: 0,
    totalEarnings: 0,
    teamSize: 0,
  });
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawError, setWithdrawError] = useState("");

  // Create axios instance with base URL
  const api = axios.create({
    baseURL: 'http://localhost:5000/api'
  });

  const withdrawAddress = "TNVFSb5Jv1HNavWitufyEzdwoU5ZrSChpK";
  const withdrawNetwork = "TRC20";
  const scanUrl = `https://tronscan.org/#/address/${withdrawAddress}`;

  const fetchDashboardData = async () => {
    if (!user || !token) {
      setDashboardLoading(false);
      return;
    }
    
    try {
      // Fetch wallet balance
      const walletResponse = await api.get("/payments/wallet/balance", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const walletBalance = walletResponse.data.walletBalance || 0;

      // Fetch investments
      const investmentsResponse = await getMyInvestments(token);
      const investments = investmentsResponse.data || [];
      
      // Calculate earnings from active investments
      let dailyEarnings = 0;
      let totalEarnings = 0;
      
      investments.forEach(inv => {
        if (inv.status === 'active') {
          dailyEarnings += inv.dailyReturn || 0;
        }
        totalEarnings += inv.totalReturned || 0;
      });

      // Fetch team size (referrals)
      let teamSize = 0;
      try {
        const referralsResponse = await api.get("/referrals/stats", {
          headers: { Authorization: `Bearer ${token}` }
        });
        teamSize = referralsResponse.data.totalReferrals || 0;
      } catch (error) {
        console.log("Referrals API not available, using default");
        teamSize = 0;
      }

      setStats({
        walletBalance,
        dailyEarnings,
        totalEarnings,
        teamSize,
      });
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      toast.error("Failed to load dashboard data");
    }
    setDashboardLoading(false);
  };

  const fetchWithdrawals = async () => {
    if (!token) return;
    try {
      const res = await getMyWithdrawals(token);
      // Only show this user's withdrawals
      setWithdrawals((res.data.withdrawals || []).filter(w => w.user._id === user._id));
    } catch (err) {
      setWithdrawals([]);
    }
  };

  useEffect(() => {
    if (!authLoading && user && token) {
      fetchDashboardData();
      fetchWithdrawals();
    }
  }, [authLoading, user, token]);

 


  const handleWithdraw = () => {
    setShowWithdrawModal(true);
  };
  const handleCloseWithdrawModal = () => setShowWithdrawModal(false);
  const handleCopyWithdrawAddress = () => {
    navigator.clipboard.writeText(withdrawAddress);
    toast.success("Address copied to clipboard!");
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    setWithdrawLoading(true);
    setWithdrawError("");
    try {
      const amount = parseFloat(withdrawAmount);
      if (isNaN(amount) || amount <= 0) {
        setWithdrawError("Enter a valid amount.");
        setWithdrawLoading(false);
        return;
      }
      if (amount > stats.walletBalance) {
        setWithdrawError("Insufficient wallet balance.");
        setWithdrawLoading(false);
        return;
      }
      await requestWithdrawal({ amount, address: withdrawAddress, network: withdrawNetwork }, token);
      toast.success("Withdrawal request submitted!");
      setWithdrawAmount("");
      setShowWithdrawModal(false);
      fetchDashboardData();
      fetchWithdrawals();
    } catch (err) {
      setWithdrawError(err.response?.data?.message || "Failed to request withdrawal.");
    }
    setWithdrawLoading(false);
  };

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}?ref=${user?.name}`;
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied to clipboard!");
  };

  const refreshDashboard = async () => {
    setDashboardLoading(true);
    await fetchDashboardData();
    toast.success("Dashboard refreshed!");
  };

  if (authLoading || dashboardLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className={`${styles.dashboardContainer} fade-in`}>
        <div className={styles.dashboardContentWrapper}>
          <div className={`${styles.dashboardHeader} slide-up`}>
            <div className={styles.headerContent}>
              <div>
                <h2>
                  Welcome, <span className={styles.highlightText}>{user?.name || "Guest"}</span>!
                </h2>
                <p className={styles.subtitle}>Your AI-powered NFT investment dashboard</p>
              </div>
              <button onClick={refreshDashboard} className={styles.refreshBtn} title="Refresh Dashboard">
                🔄
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className={styles.statsGrid}>
            <div className={`${styles.statCard} slide-up`} style={{ animationDelay: "0.1s" }}>
              <div className={styles.statValue}>${stats.walletBalance.toFixed(2)}</div>
              <div className={styles.statLabel}>Wallet Balance</div>
              <div className={styles.cardGlow}></div>
            </div>
            <div className={`${styles.statCard} slide-up`} style={{ animationDelay: "0.2s" }}>
              <div className={styles.statValue}>${stats.dailyEarnings.toFixed(2)}</div>
              <div className={styles.statLabel}>Daily Earnings</div>
              <div className={styles.cardGlow}></div>
            </div>
            <div className={`${styles.statCard} slide-up`} style={{ animationDelay: "0.3s" }}>
              <div className={styles.statValue}>${stats.totalEarnings.toFixed(2)}</div>
              <div className={styles.statLabel}>Total Earnings</div>
              <div className={styles.cardGlow}></div>
            </div>
            <div className={`${styles.statCard} slide-up`} style={{ animationDelay: "0.4s" }}>
              <div className={styles.statValue}>{stats.teamSize}</div>
              <div className={styles.statLabel}>Team Members</div>
              <div className={styles.cardGlow}></div>
            </div>
          </div>

          {/* Action Cards */}
          <div className={styles.actionCards}>
            <div className={`${styles.actionCard} slide-up`} style={{ animationDelay: "0.5s" }}>
              <h3 className={styles.cardTitle}>Invest Funds</h3>
              <p className={styles.cardDescription}>Add funds to your account to start earning</p>
              <Link to="/invest" className={styles.btnPrimary}>
                Invest Now
              </Link>
              <div className={styles.cardGlow}></div>
            </div>

            <div className={`${styles.actionCard} slide-up`} style={{ animationDelay: "0.6s" }}>
              <h3 className={styles.cardTitle}>Withdraw Earnings</h3>
              <p className={styles.cardDescription}>Request a withdrawal of your profits</p>
              <button onClick={handleWithdraw} className={styles.btnPrimary}>
                Withdraw Now
              </button>
              <div className={styles.cardGlow}></div>
            </div>

            <div className={`${styles.actionCard} slide-up`} style={{ animationDelay: "0.7s" }}>
              <h3 className={styles.cardTitle}>Referral Program</h3>
              <p className={styles.cardDescription}>Earn 5% from your referrals' investments</p>
              <Link to="/referrals" className={styles.btnPrimary}>
                View Referrals
              </Link>
              <div className={styles.cardGlow}></div>
            </div>
          </div>

          {/* Referral Section */}
          <div className={`${styles.referralSection} slide-up`} style={{ animationDelay: "0.8s" }}>
            <h3 className={styles.cardTitle}>Your Referral Link</h3>
            <div className={styles.referralBox}>
              <input type="text" value={`${window.location.origin}?ref=${user?.name}`} readOnly />
              <button onClick={copyReferralLink} className={styles.btnSmall}>
                Copy
              </button>
            </div>
            <p className={styles.cardDescription}>Share this link with friends and earn commissions!</p>
            <div className={styles.cardGlow}></div>
          </div>
        </div>

         {/* Withdrawal History */}
         
      <div className={styles.withdrawalHistorySection}>
        <h3 className={styles.cardTitle}>Withdrawal History</h3>
        <div className={styles.withdrawalHistoryBox}>
          {withdrawals.length === 0 ? (
            <p style={{color: '#ccc'}}>No withdrawal requests yet.</p>
          ) : (
            <table style={{width: '100%', color: '#fff', background: '#222', borderRadius: 8, overflow: 'hidden'}}>
              <thead>
                <tr style={{background: '#ffd700', color: '#111'}}>
                  <th style={{padding: 8}}>Amount ($)</th>
                  <th style={{padding: 8}}>Address</th>
                  <th style={{padding: 8}}>Network</th>
                  <th style={{padding: 8}}>Status</th>
                  <th style={{padding: 8}}>Requested At</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map(w => (
                  <tr key={w._id}>
                    <td style={{padding: 8}}>{w.amount}</td>
                    <td style={{padding: 8}}>{w.address}</td>
                    <td style={{padding: 8}}>{w.network}</td>
                    <td style={{padding: 8, color: w.status === 'approved' ? '#4caf50' : w.status === 'rejected' ? '#ff4d4f' : '#ffd700'}}>{w.status.charAt(0).toUpperCase() + w.status.slice(1)}</td>
                    <td style={{padding: 8}}>{new Date(w.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      </main>
      <Footer />
      {showWithdrawModal && (
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
            <h3 style={{marginBottom: 18, color: "#ffd700"}}>Withdraw Earnings</h3>
            <form onSubmit={handleWithdrawSubmit}>
              <div style={{marginBottom: 12}}>
                <label style={{display: "block", marginBottom: 4}}>Amount ($)</label>
                <input type="number" min="1" step="1" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} style={{padding: 8, borderRadius: 6, border: "1px solid #ffd700", width: "100%"}} required />
              </div>
              <div style={{marginBottom: 8}}>
                <span style={{fontWeight: "bold", color: "#ffd700"}}>{withdrawAddress}</span>
              </div>
              <div style={{marginBottom: 8}}>
                Network: <span style={{color: "#ffd700"}}>{withdrawNetwork}</span>
              </div>
              <div style={{marginBottom: 16}}>
                <QRCodeCanvas value={withdrawAddress} size={120} />
              </div>
              {withdrawError && <div style={{color: "#ff4d4f", marginBottom: 8}}>{withdrawError}</div>}
              <button type="submit" disabled={withdrawLoading} style={{marginRight: 12, padding: "8px 16px", borderRadius: 6, border: "none", background: "#ffd700", color: "#111", fontWeight: 700, cursor: "pointer"}}>
                {withdrawLoading ? "Processing..." : "Submit Withdrawal"}
              </button>
              <button type="button" onClick={handleCloseWithdrawModal} style={{padding: "8px 16px", borderRadius: 6, border: "none", background: "#111", color: "#fff", fontWeight: 700, cursor: "pointer", border: "1.5px solid #ffd700"}}>Close</button>
            </form>
          </div>
        </div>
      )}
     
    </>
  );
};

export default Dashboard;
