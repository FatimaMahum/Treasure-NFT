import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getAllUsers } from "../services/userService";
import { getAllInvestments } from "../services/investmentService";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "./Admin.module.css";

const API_PLANS = `${process.env.REACT_APP_BACKEND_URL}/plans`;

const Admin = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInvestments: 0,
    totalInvestmentAmount: 0,
    activeInvestments: 0,
    totalPlans: 0
  });
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState({
    name: "",
    description: "",
    minAmount: "",
    maxAmount: "",
    dailyReturnRate: "",
    isActive: true
  });

  // Create axios instance
  console.log('🔍 REACT_APP_BACKEND_URL:', process.env.REACT_APP_BACKEND_URL);
  const api = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL
  });

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
      return;
    }
    fetchData();
  }, [user, token, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching admin data...");

      const [usersRes, investmentsRes, plansRes] = await Promise.all([
        api.get("/users", { headers: { Authorization: `Bearer ${token}` } }),
        api.get("/investments/all", { headers: { Authorization: `Bearer ${token}` } }),
        api.get("/plans")
      ]);

      console.log("📊 Users response:", usersRes.data);
      console.log("📊 Investments response:", investmentsRes.data);
      console.log("📊 Plans response:", plansRes.data);

      const usersData = usersRes.data?.users || usersRes.data || [];
      const investmentsData = investmentsRes.data?.investments || investmentsRes.data || [];
      const plansData = plansRes.data?.plans || plansRes.data || [];

      console.log("👥 Users data:", usersData.length, "users");
      console.log("💰 Investments data:", investmentsData.length, "investments");
      console.log("📋 Plans data:", plansData.length, "plans");

      setUsers(usersData);
      setInvestments(investmentsData);
      setPlans(plansData);

      // Calculate stats
      const newStats = {
        totalUsers: usersData.length,
        totalInvestments: investmentsData.length,
        totalInvestmentAmount: investmentsData.reduce((sum, inv) => sum + (inv.investedAmount || 0), 0),
        activeInvestments: investmentsData.filter(inv => inv.status === 'active').length,
        totalPlans: plansData.length
      };

      console.log("📊 Admin stats calculated:", newStats);
      setStats(newStats);

      console.log("✅ Admin data fetched successfully");

    } catch (error) {
      console.error("❌ Failed to fetch admin data:", error);
      console.error("❌ Error details:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);
      console.error("❌ Error message:", error.message);
      
      // Set empty arrays to prevent undefined errors
      setUsers([]);
      setInvestments([]);
      setPlans([]);
      setStats({
        totalUsers: 0,
        totalInvestments: 0,
        totalInvestmentAmount: 0,
        activeInvestments: 0,
        totalPlans: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Refresh plans data specifically
  const refreshPlans = async () => {
    try {
      const plansRes = await api.get("/plans");
      const plansData = plansRes.data?.plans || plansRes.data || [];
      setPlans(plansData);
      setStats(prev => ({ ...prev, totalPlans: plansData.length }));
    } catch (error) {
      console.error("Failed to refresh plans:", error);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchData();
    setLastUpdateTime(new Date());
    setRefreshing(false);
  };

  // Plan Management Functions
  const handlePlanSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const planData = {
        name: planForm.name,
        description: planForm.description,
        minAmount: Number(planForm.minAmount),
        maxAmount: Number(planForm.maxAmount),
        dailyReturnRate: Number(planForm.dailyReturnRate),
        isActive: planForm.isActive
      };

      if (editingPlan) {
        // Update existing plan
        await api.put(`/plans/${editingPlan._id}`, planData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Plan updated successfully!");
      } else {
        // Create new plan
        await api.post("/plans", planData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Plan created successfully!");
      }

      setShowPlanForm(false);
      setPlanForm({ name: "", description: "", minAmount: "", maxAmount: "", dailyReturnRate: "", isActive: true });
      setEditingPlan(null);
      
      // Refresh plans data
      await refreshPlans();
      
    } catch (error) {
      console.error("Plan operation failed:", error);
      toast.error(error.response?.data?.message || "Failed to save plan");
    } finally {
      setLoading(false);
    }
  };

  const deletePlan = async (planId) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;

    try {
      await api.delete(`/plans/${planId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Plan deleted successfully!");
      
      // Refresh plans data
      await refreshPlans();
      
    } catch (error) {
      console.error("Delete plan failed:", error);
      toast.error(error.response?.data?.message || "Failed to delete plan");
    }
  };

  const openEditPlan = (plan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name,
      description: plan.description,
      minAmount: plan.minAmount.toString(),
      maxAmount: plan.maxAmount.toString(),
      dailyReturnRate: plan.dailyReturnRate.toString(),
      isActive: plan.isActive
    });
    setShowPlanForm(true);
  };

  const openCreatePlan = () => {
    setEditingPlan(null);
    setPlanForm({ name: "", description: "", minAmount: "", maxAmount: "", dailyReturnRate: "", isActive: true });
    setShowPlanForm(true);
  };

  // Check if user is admin
  if (!user || user.role !== "admin") {
    return (
      <>
        <Navbar />
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
          color: "#ffd700",
          fontSize: "1.2rem"
        }}>
          <div>
            <h2>Access Denied</h2>
            <p>You need admin privileges to access this page.</p>
            <p style={{ fontSize: "0.9rem", color: "#999", marginTop: "0.5rem" }}>
              Current user: {user?.name || "Not logged in"} | Role: {user?.role || "None"}
            </p>
            <button 
              onClick={() => navigate("/login")}
              style={{
                background: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                color: "#000",
                cursor: "pointer",
                marginTop: "1rem"
              }}
            >
              Go to Login
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className={styles.loadingContainer}>
          <div className="loading-spinner"></div>
          <p>Loading admin data...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <section className={styles.adminSection}>
        <div className={styles.sectionContentWrapper}>
          <div className={styles.headerContent}>
            <div>
              <h2 className={styles.sectionTitle}>Admin Dashboard</h2>
              <p className={styles.sectionSubtitle}>Manage users, investments, and plans</p>
              <small style={{ color: '#999', fontSize: '0.8rem' }}>
                Last updated: {lastUpdateTime.toLocaleTimeString()}
              </small>
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button 
                onClick={refreshData} 
                className={styles.refreshBtn} 
                disabled={refreshing}
                title="Refresh Admin Data"
              >
                {refreshing ? "🔄" : "🔄"}
              </button>
             
               
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "2rem",
              color: "#ffd700"
            }}>
              <div className="loading-spinner"></div>
              <span style={{ marginLeft: "1rem" }}>Loading admin data...</span>
            </div>
          )}

          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.totalUsers}</div>
              <h3>Total Users</h3>
              <p className={styles.statDescription}>Registered users</p>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.totalInvestments}</div>
              <h3>Total Investments</h3>
              <p className={styles.statDescription}>All investments</p>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>${stats.totalInvestmentAmount.toFixed(2)}</div>
              <h3>Total Investment Amount</h3>
              <p className={styles.statDescription}>Total invested</p>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.activeInvestments}</div>
              <h3>Active Investments</h3>
              <p className={styles.statDescription}>Ongoing investments</p>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.totalPlans}</div>
              <h3>Investment Plans</h3>
              <p className={styles.statDescription}>Available plans</p>
            </div>
          </div>

         

          <div className={styles.adminGrid}>
            {/* Users Card */}
            <div className={styles.adminCard}>
              <h3 className={styles.cardTitle}>Users ({users.length})</h3>
              <div className={styles.tableContainer}>
                {users.length > 0 ? (
                  <table className={styles.adminTable}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>WhatsApp</th>
                        <th>Role</th>
                        <th>Wallet</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id}>
                          <td>{u.name}</td>
                          <td>{u.email}</td>
                          <td>{u.whatsapp}</td>
                          <td>{u.role}</td>
                          <td>${u.walletBalance ? Number(u.walletBalance).toFixed(2) : "0.00"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: "2rem", textAlign: "center", color: "#999" }}>
                    <p>No users found. Register some users to see them here.</p>
                    <small>Make sure you're logged in as an admin user.</small>
                  </div>
                )}
              </div>
              <div className={styles.cardGlow}></div>
            </div>

            {/* Investments Card */}
            <div className={styles.adminCard}>
              <h3 className={styles.cardTitle}>Investments ({investments.length})</h3>
              <div className={styles.tableContainer}>
                {investments.length > 0 ? (
                  <table className={styles.adminTable}>
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Plan</th>
                        <th>Amount</th>
                        <th>Returned</th>
                        <th>Daily</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {investments.map((inv) => (
                        <tr key={inv._id}>
                          <td>{inv.user?.name || "-"}</td>
                          <td>{inv.plan?.name || "-"}</td>
                          <td>${inv.investedAmount}</td>
                          <td>${inv.totalReturned}</td>
                          <td>${inv.dailyReturn}</td>
                          <td className={inv.isCompleted ? styles.completed : styles.active}>
                            {inv.isCompleted ? "Completed" : "Active"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: "2rem", textAlign: "center", color: "#999" }}>
                    <p>No investments found. Users need to make investments to see them here.</p>
                    <small>Investments will appear here once users start investing.</small>
                  </div>
                )}
              </div>
              <div className={styles.cardGlow}></div>
            </div>

            {/* Plans Card */}
            <div className={styles.adminCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 className={styles.cardTitle}>Plans ({plans.length})</h3>
                <button 
                  onClick={openCreatePlan}
                  style={{
                    background: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    color: "#000",
                    cursor: "pointer",
                    fontSize: "0.9rem"
                  }}
                >
                  ➕ Add Plan
                </button>
              </div>
              <div className={styles.tableContainer}>
                {plans.length > 0 ? (
                  <table className={styles.adminTable}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Amount Range</th>
                        <th>Daily Return Rate</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plans.map((plan) => (
                        <tr key={plan._id}>
                          <td>{plan.name}</td>
                          <td>{plan.description}</td>
                          <td>${plan.minAmount} - ${plan.maxAmount}</td>
                          <td>${plan.dailyReturnRate}</td>
                          <td className={plan.isActive ? styles.active : styles.inactive}>
                            {plan.isActive ? "Active" : "Inactive"}
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button
                                onClick={() => openEditPlan(plan)}
                                style={{
                                  padding: "6px 12px",
                                  background: "#ffd700",
                                  color: "#000",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontSize: "12px"
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deletePlan(plan._id)}
                                style={{
                                  padding: "6px 12px",
                                  background: "#dc3545",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontSize: "12px"
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: "2rem", textAlign: "center", color: "#999" }}>
                    <p>No investment plans found. Create some plans to see them here.</p>
                    <button 
                      onClick={async () => {
                        try {
                          const response = await api.post("/plans/create-sample", {}, { 
                            headers: { Authorization: `Bearer ${token}` } 
                          });
                          console.log("Sample plans created:", response.data);
                          await fetchData(); // Refresh data
                        } catch (error) {
                          console.error("Failed to create sample plans:", error);
                        }
                      }}
                      style={{
                        background: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
                        border: "none",
                        borderRadius: "8px",
                        padding: "10px 20px",
                        color: "#000",
                        cursor: "pointer",
                        marginTop: "1rem"
                      }}
                    >
                      Create Sample Plans
                    </button>
                  </div>
                )}
              </div>
              <div className={styles.cardGlow}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Plan Form Modal */}
      {showPlanForm && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.8)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(45, 45, 45, 0.95) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 215, 0, 0.2)",
            borderRadius: "20px",
            padding: "2rem",
            maxWidth: "500px",
            width: "90%",
            color: "#fff"
          }}>
            <h3 style={{ color: "#ffd700", marginBottom: "1.5rem", textAlign: "center" }}>
              {editingPlan ? "Edit Plan" : "Create New Plan"}
            </h3>
            
            <form onSubmit={handlePlanSubmit}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "#ffd700" }}>
                  Plan Name
                </label>
                <input
                  type="text"
                  value={planForm.name}
                  onChange={(e) => setPlanForm({...planForm, name: e.target.value})}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 215, 0, 0.3)",
                    background: "rgba(0, 0, 0, 0.3)",
                    color: "#fff"
                  }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "#ffd700" }}>
                  Plan Description
                </label>
                <input
                  type="text"
                  value={planForm.description}
                  onChange={(e) => setPlanForm({...planForm, description: e.target.value})}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 215, 0, 0.3)",
                    background: "rgba(0, 0, 0, 0.3)",
                    color: "#fff"
                  }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "#ffd700" }}>
                  Minimum Amount ($)
                </label>
                <input
                  type="number"
                  value={planForm.minAmount}
                  onChange={(e) => setPlanForm({...planForm, minAmount: e.target.value})}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 215, 0, 0.3)",
                    background: "rgba(0, 0, 0, 0.3)",
                    color: "#fff"
                  }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "#ffd700" }}>
                  Maximum Amount ($)
                </label>
                <input
                  type="number"
                  value={planForm.maxAmount}
                  onChange={(e) => setPlanForm({...planForm, maxAmount: e.target.value})}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 215, 0, 0.3)",
                    background: "rgba(0, 0, 0, 0.3)",
                    color: "#fff"
                  }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "#ffd700" }}>
                  Daily Return Rate ($)
                </label>
                <input
                  type="number"
                  value={planForm.dailyReturnRate}
                  onChange={(e) => setPlanForm({...planForm, dailyReturnRate: e.target.value})}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 215, 0, 0.3)",
                    background: "rgba(0, 0, 0, 0.3)",
                    color: "#fff"
                  }}
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "flex", alignItems: "center", color: "#ffd700" }}>
                  <input
                    type="checkbox"
                    checked={planForm.isActive}
                    onChange={(e) => setPlanForm({...planForm, isActive: e.target.checked})}
                    style={{ marginRight: "0.5rem" }}
                  />
                  Active Plan
                </label>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    background: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
                    border: "none",
                    borderRadius: "8px",
                    padding: "12px",
                    color: "#000",
                    cursor: "pointer",
                    fontWeight: "bold"
                  }}
                >
                  {editingPlan ? "Update Plan" : "Create Plan"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPlanForm(false)}
                  style={{
                    flex: 1,
                    background: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
                    border: "none",
                    borderRadius: "8px",
                    padding: "12px",
                    color: "#fff",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Admin;