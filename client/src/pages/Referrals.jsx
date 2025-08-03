"use client"

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "./Referrals.module.css";

const Referrals = () => {
  const { user, token } = useAuth();
  const [referralData, setReferralData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState("");
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Create axios instance with base URL
  const api = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL
  });

  useEffect(() => {
    if (user && token) {
      fetchReferralData();
    }
  }, [user, token]);

  // Refresh referral data when user returns to the page
  useEffect(() => {
    const handleFocus = () => {
      if (user && token) {
        console.log("🔄 Referral page focused, refreshing data...");
        fetchReferralData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, token]);

  


  const fetchReferralData = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching referral data...");
      
      const response = await api.get("/referrals/dashboard", {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("📊 Referral response:", response.data);

      if (response.data.success) {
        setReferralData(response.data.data);
        console.log("✅ Referral data updated:", response.data.data);
      } else {
        console.error("❌ Referral data fetch failed:", response.data.message);
        toast.error("Failed to load referral data");
      }
    } catch (error) {
      console.error("❌ Failed to fetch referral data:", error);
      console.error("❌ Error details:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);
      toast.error("Failed to load referral data");
    } finally {
      setLoading(false);
    }
  };

  const refreshReferralData = async () => {
    setRefreshing(true);
    await fetchReferralData();
    toast.success("Referral data refreshed!");
    setRefreshing(false);
  };

  const copyReferralLink = async () => {
    try {
      console.log("🔗 Getting referral link...");
      const response = await api.get("/referrals/link", {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("📊 Referral link response:", response.data);

      if (response.data.success) {
        await navigator.clipboard.writeText(response.data.referralLink);
        console.log("✅ Referral link copied:", response.data.referralLink);
        toast.success("🎉 Referral link copied to clipboard!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: {
            background: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
            color: "#000",
            fontWeight: "bold",
            borderRadius: "10px",
            boxShadow: "0 4px 15px rgba(255, 215, 0, 0.3)"
          }
        });
      } else {
        console.error("❌ Failed to get referral link:", response.data.message);
        toast.error("❌ Failed to get referral link");
      }
    } catch (error) {
      console.error("❌ Failed to get referral link:", error);
      console.error("❌ Error details:", error.response?.data);
      toast.error("❌ Failed to copy referral link", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          background: "linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)",
          color: "#fff",
          fontWeight: "bold",
          borderRadius: "10px",
          boxShadow: "0 4px 15px rgba(255, 77, 79, 0.3)"
        }
      });
    }
  };

  const applyReferralCode = async (e) => {
    e.preventDefault();
    
    // Enhanced validation with better user feedback
    if (!referralCode.trim()) {
      toast.error("⚠️ Please enter a referral code", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          background: "linear-gradient(135deg, #faad14 0%, #ffc53d 100%)",
          color: "#000",
          fontWeight: "bold",
          borderRadius: "10px",
          boxShadow: "0 4px 15px rgba(250, 173, 20, 0.3)"
        }
      });
      return;
    }

    try {
      console.log("🔗 Applying referral code:", referralCode.trim());
      const response = await api.post("/referrals/apply-code", 
        { referralCode: referralCode.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("📊 Apply referral code response:", response.data);

      if (response.data.success) {
        console.log("✅ Referral code applied successfully");
        toast.success("🎉 Referral code applied successfully!", {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: {
            background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
            color: "#fff",
            fontWeight: "bold",
            borderRadius: "10px",
            boxShadow: "0 4px 15px rgba(82, 196, 26, 0.3)"
          }
        });
        setReferralCode("");
        setShowApplyForm(false);
        // Refresh data immediately after applying code
        await fetchReferralData();
      } else {
        console.error("❌ Failed to apply referral code:", response.data.message);
        toast.error(`❌ ${response.data.message || "Failed to apply referral code"}`);
      }
    } catch (error) {
      console.error("❌ Apply referral code error:", error);
      console.error("❌ Error details:", error.response?.data);
      const errorMessage = error.response?.data?.message || "Failed to apply referral code";
      toast.error(`❌ ${errorMessage}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          background: "linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)",
          color: "#fff",
          fontWeight: "bold",
          borderRadius: "10px",
          boxShadow: "0 4px 15px rgba(255, 77, 79, 0.3)"
        }
      });
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className={styles.loadingContainer}>
          <div className="loading-spinner"></div>
          <p>Loading referral data...</p>
        </div>
        <Footer />
      </>
    );
  }

  // Prepare safe defaults for all dashboard data
  const safeData = {
    user: {
      totalReferrals: referralData?.user?.totalReferrals ?? 0,
      activeReferrals: referralData?.user?.activeReferrals ?? 0,
      totalCommissions: referralData?.user?.totalCommissions ?? 0,
      pendingCommissions: referralData?.user?.pendingCommissions ?? 0,
      referralCode: referralData?.user?.referralCode ?? "N/A",
      email: referralData?.user?.email ?? "",
      name: referralData?.user?.name ?? "",
    },
    directReferrals: referralData?.directReferrals ?? [],
    teamMembers: referralData?.teamMembers ?? [],
    commissionData: {
      breakdown: referralData?.commissionData?.breakdown ?? [],
    },
  };

  return (
    <>
      <Navbar />
      <main className={styles.referralsContainer}>
        <div className={styles.sectionHeader}>
          <div className={styles.headerContent}>
            <div>
              <h2 className={styles.sectionTitle}>Referral Program</h2>
              <p className={styles.sectionSubtitle}>Earn commissions by referring friends and family</p>
            </div>
            <button 
              onClick={refreshReferralData} 
              className={styles.refreshBtn} 
              disabled={refreshing}
              title="Refresh Referral Data"
            >
              {refreshing ? "🔄" : "🔄"}
            </button>
          </div>
        </div>

        <div className={styles.referralGrid}>
          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{safeData.user.totalReferrals}</div>
              <h3>Total Referrals</h3>
              <p className={styles.statDescription}>Direct referrals</p>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{safeData.user.activeReferrals}</div>
              <h3>Active Investors</h3>
              <p className={styles.statDescription}>Referrals with investments</p>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>${Number(safeData.user.totalCommissions).toFixed(2)}</div>
              <h3>Total Commissions</h3>
              <p className={styles.statDescription}>Earned from referrals</p>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>${Number(safeData.user.pendingCommissions).toFixed(2)}</div>
              <h3>Pending Commissions</h3>
              <p className={styles.statDescription}>Awaiting payout</p>
            </div>
          </div>

          {/* Referral Link Section */}
          <div className={styles.referralLinkSection}>
            <h3>Your Referral Link</h3>
            <div className={styles.referralCode}>
              <span>{safeData.user.referralCode}</span>
              <button onClick={copyReferralLink} className={styles.copyBtn} disabled={safeData.user.referralCode === "N/A"}>
                Copy Link
              </button>
            </div>
            <p className={styles.referralInfo}>
              Share this link with friends to earn commissions on their investments!
            </p>
          </div>

          {/* Commission Structure */}
          <div className={styles.commissionStructure}>
            <h3>Commission Structure</h3>
            <div className={styles.commissionLevels}>
              <div className={styles.level}>
                <span className={styles.levelNumber}>1st Level</span>
                <span className={styles.commissionRate}>10% Commission</span>
                <span className={styles.levelDescription}>Direct referrals</span>
              </div>
              <div className={styles.level}>
                <span className={styles.levelNumber}>2nd Level</span>
                <span className={styles.commissionRate}>5% Commission</span>
                <span className={styles.levelDescription}>Referrals of referrals</span>
              </div>
              <div className={styles.level}>
                <span className={styles.levelNumber}>3rd Level</span>
                <span className={styles.commissionRate}>3% Commission</span>
                <span className={styles.levelDescription}>Extended network</span>
              </div>
            </div>
          </div>

          {/* Apply Referral Code */}
          <div className={styles.applyReferralSection}>
            <h3>Apply Referral Code</h3>
            <button 
              onClick={() => setShowApplyForm(!showApplyForm)}
              className={styles.toggleBtn}
            >
              {showApplyForm ? "Cancel" : "Apply Code"}
            </button>
            
            {showApplyForm && (
              <form onSubmit={applyReferralCode} className={styles.applyForm}>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="Enter referral code"
                  className={styles.referralInput}
                />
                <button type="submit" className={styles.applyBtn}>
                  Apply Code
                </button>
              </form>
            )}
          </div>

          {/* Direct Referrals */}
          <div className={styles.directReferrals}>
            <h3>Your Direct Referrals ({safeData.directReferrals.length})</h3>
            {safeData.directReferrals.length > 0 ? (
              <div className={styles.referralsList}>
                {safeData.directReferrals.map((referral, index) => (
                  <div key={referral._id || index} className={styles.referralItem}>
                    <div className={styles.referralInfo}>
                      <span className={styles.referralName}>{referral.name}</span>
                      <span className={styles.referralEmail}>{referral.email}</span>
                      <span className={styles.referralDate}>
                        Joined: {referral.createdAt ? new Date(referral.createdAt).toLocaleDateString() : "-"}
                      </span>
                    </div>
                    <div className={styles.referralStatus}>
                      <span className={styles.walletBalance}>
                        Wallet: ${referral.walletBalance ? Number(referral.walletBalance).toFixed(2) : "0.00"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noReferrals}>No direct referrals yet. Share your link to start earning!</p>
            )}
          </div>

          {/* Team Members */}
          <div className={styles.teamMembers}>
            <h3>Your Team (All Levels) - {safeData.teamMembers.length} Members</h3>
            {safeData.teamMembers.length > 0 ? (
              <div className={styles.teamList}>
                {safeData.teamMembers.map((member, index) => (
                  <div key={member._id || index} className={styles.teamItem}>
                    <div className={styles.teamInfo}>
                      <span className={styles.memberName}>{member.name}</span>
                      <span className={styles.memberEmail}>{member.email}</span>
                      <span className={styles.memberLevel}>Level {member.level}</span>
                    </div>
                    <div className={styles.memberStats}>
                      <span className={styles.memberWallet}>
                        Wallet: ${member.walletBalance ? Number(member.walletBalance).toFixed(2) : "0.00"}
                      </span>
                      <span className={styles.memberDate}>
                        {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : "-"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noTeam}>No team members yet. Build your network!</p>
            )}
          </div>

          {/* Commission Breakdown */}
          {safeData.commissionData.breakdown.length > 0 && (
            <div className={styles.commissionBreakdown}>
              <h3>Commission Breakdown ({safeData.commissionData.breakdown.length} transactions)</h3>
              <div className={styles.breakdownList}>
                {safeData.commissionData.breakdown.map((item, index) => (
                  <div key={index} className={styles.breakdownItem}>
                    <div className={styles.breakdownInfo}>
                      <span className={styles.investorName}>{item.investor}</span>
                      <span className={styles.investmentAmount}>
                        Investment: ${item.investmentAmount ? Number(item.investmentAmount).toFixed(2) : "0.00"}
                      </span>
                    </div>
                    <div className={styles.breakdownCommission}>
                      <span className={styles.commissionRate}>
                        {item.commissionRate}% Commission
                      </span>
                      <span className={styles.commissionAmount}>
                        ${item.commission ? Number(item.commission).toFixed(2) : "0.00"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Referrals;
