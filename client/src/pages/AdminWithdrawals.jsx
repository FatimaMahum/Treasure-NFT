import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getAllWithdrawals, updateWithdrawalStatus } from "../services/withdrawalService";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "./AdminWithdrawals.module.css";

const AdminWithdrawals = () => {
  const { user, token } = useAuth();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());

  const fetchWithdrawals = async () => {
    try {
      console.log("🔄 Fetching withdrawal data...");
      setLoading(true);
      const res = await getAllWithdrawals(token);
      setWithdrawals(res.data.withdrawals || []);
      setLastUpdateTime(new Date());
      console.log(`✅ Found ${res.data.withdrawals?.length || 0} withdrawal requests`);
    } catch (err) {
      console.error("❌ Failed to fetch withdrawals:", err);
      setError("Failed to fetch withdrawals.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (user && user.role === "admin" && token) {
      fetchWithdrawals();
      
      // Remove auto-refresh interval
      // const interval = setInterval(fetchWithdrawals, 30000);
      // return () => clearInterval(interval);
    }
  }, [user, token]);

  const handleAction = async (id, status) => {
    setActionLoading(id + status);
    try {
      await updateWithdrawalStatus(id, status, "", token);
      // Refresh data immediately after action
      await fetchWithdrawals();
    } catch (err) {
      console.error("❌ Failed to update withdrawal status:", err);
      setError("Failed to update withdrawal status.");
    }
    setActionLoading("");
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchWithdrawals();
    setRefreshing(false);
  };

  if (!user || user.role !== "admin") {
    return <div className={styles.accessDenied}>Access denied.</div>;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className={styles.loadingContainer}>
          <div className="loading-spinner"></div>
          <p>Loading withdrawal data...</p>
        </div>
        <Footer />
      </>
    );
  }
  return (
    <>
      <Navbar />
      <div className={styles.withdrawalsSection}>
        <div className={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <div>
              <h2 className={styles.sectionTitle}>Withdrawal Requests</h2>
              <small style={{ color: '#999', fontSize: '0.8rem' }}>
                Last updated: {lastUpdateTime.toLocaleTimeString()}
              </small>
            </div>
            <button 
              onClick={refreshData} 
              className={styles.refreshBtn} 
              disabled={refreshing}
              title="Refresh Withdrawal Data"
            >
              {refreshing ? "🔄" : "🔄"}
            </button>
          </div>
          {loading ? (
            <div style={{ color: "#ffd700" }}>Loading...</div>
          ) : error ? (
            <div style={{ color: "#ff4d4f" }}>{error}</div>
          ) : (
            <div className={styles.tableContainer}>
              {withdrawals.length === 0 ? (
                <p style={{ color: "#ccc" }}>No withdrawal requests found.</p>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Amount ($)</th>
                      <th>Address</th>
                      <th>Network</th>
                      <th>Status</th>
                      <th>Requested At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map(w => (
                      <tr key={w._id}>
                        <td>{w.user?.name || "-"}</td>
                        <td>{w.amount}</td>
                        <td>{w.address}</td>
                        <td>{w.network}</td>
                        <td className={
                          w.status === 'approved' ? styles.statusApproved :
                          w.status === 'rejected' ? styles.statusRejected :
                          styles.statusPending
                        }>
                          {w.status.charAt(0).toUpperCase() + w.status.slice(1)}
                        </td>
                        <td>{new Date(w.createdAt).toLocaleString()}</td>
                        <td>
                          {w.status === 'pending' && (
                            <>
                              <button onClick={() => handleAction(w._id, 'approved')} disabled={actionLoading === w._id + 'approved'} className={`${styles.actionBtn} ${styles.actionApprove}`}>Approve</button>
                              <button onClick={() => handleAction(w._id, 'rejected')} disabled={actionLoading === w._id + 'rejected'} className={`${styles.actionBtn} ${styles.actionReject}`}>Reject</button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminWithdrawals; 