"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { toast } from "react-toastify"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import styles from "./Invest.module.css"

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL
});

const Invest = () => {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);
  const [investmentAmount, setInvestmentAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [walletBalance, setWalletBalance] = useState(0)
  const [balanceError, setBalanceError] = useState("")
  const [plans, setPlans] = useState([])
  const [plansLoading, setPlansLoading] = useState(true)

  useEffect(() => {
    fetchPlans()
    if (user && token) {
      fetchWalletBalance()
    }
  }, [user, token])

  const fetchPlans = async () => {
    try {
      setPlansLoading(true)
      const response = await api.get("/plans")
      const fetchedPlans = response.data.plans || response.data || []
      
      // Transform plans to match the expected format
      const transformedPlans = fetchedPlans.map(plan => ({
        id: plan._id,
        name: plan.name,
        price: `$${plan.minAmount} - $${plan.maxAmount}`,
        rate: plan.dailyReturnRate / 100, // Convert to decimal
        duration: "30 Days",
        features: [
          `Daily Profit: ${plan.dailyReturnRate}%`,
          "Principal Return: Yes",
          "24/7 Support"
        ],
        gradientClass: getGradientClass(plan.name),
        btnClass: getBtnClass(plan.name),
        min: plan.minAmount,
        max: plan.maxAmount,
        dailyReturnRate: plan.dailyReturnRate,
        description: plan.description
      }))
      
      setPlans(transformedPlans)
    } catch (error) {
      console.error("Failed to fetch plans:", error)
      // Fallback to default plans if API fails
      setPlans(getDefaultPlans())
    } finally {
      setPlansLoading(false)
    }
  }

  const getGradientClass = (planName) => {
    if (planName.toLowerCase().includes('bronze')) return styles.bronzeGradient
    if (planName.toLowerCase().includes('silver')) return styles.silverGradient
    if (planName.toLowerCase().includes('gold')) return styles.goldGradient
    return styles.bronzeGradient // default
  }

  const getBtnClass = (planName) => {
    if (planName.toLowerCase().includes('bronze')) return styles.bronzeBtn
    if (planName.toLowerCase().includes('silver')) return styles.silverBtn
    if (planName.toLowerCase().includes('gold')) return styles.goldBtn
    return styles.bronzeBtn // default
  }

  const getDefaultPlans = () => [
    {
      id: "bronze",
      name: "Bronze Plan",
      price: "$30 - $49",
      rate: 0.03,
      duration: "30 Days",
      features: ["Daily Profit: 3%", "Principal Return: Yes", "24/7 Support"],
      gradientClass: styles.bronzeGradient,
      btnClass: styles.bronzeBtn,
      min: 10,
      max: 49,
    },
    {
      id: "silver",
      name: "Silver Plan",
      price: "$50 - $99",
      rate: 0.05,
      duration: "30 Days",
      features: ["Daily Profit: 5%", "Principal Return: Yes", "24/7 Support", "Priority Withdrawals"],
      gradientClass: styles.silverGradient,
      btnClass: styles.silverBtn,
      min: 50,
      max: 99,
    },
    {
      id: "gold",
      name: "Gold Plan",
      price: "$100+",
      rate: 0.08,
      duration: "30 Days",
      features: [
        "Daily Profit: 8%",
        "Principal Return: Yes",
        "24/7 VIP Support",
        "Instant Withdrawals",
        "Bonus 5% Referral Commission",
      ],
      gradientClass: styles.goldGradient,
      btnClass: styles.goldBtn,
      min: 100,
      max: Number.POSITIVE_INFINITY,
    },
  ]

  // Fetch wallet balance when component mounts
  useEffect(() => {
    if (user && token) {
      fetchWalletBalance()
    }
  }, [user, token])

  const fetchWalletBalance = async () => {
    try {
      console.log("💰 Fetching wallet balance...");
      const response = await api.get("/payments/wallet/balance", {
        headers: { Authorization: `Bearer ${token}` }
      })
      const newBalance = response.data.walletBalance || 0;
      console.log("💰 Wallet balance updated:", newBalance);
      setWalletBalance(newBalance)
    } catch (error) {
      console.error("❌ Failed to fetch wallet balance:", error)
      setWalletBalance(0)
    }
  }

  const handleInvestClick = (plan) => {
    if (!user) {
      toast.info("Please login to invest")
      navigate("/login")
      return
    }
    
    setSelectedPlan(plan)
    setShowModal(true)
    setInvestmentAmount("")
    setBalanceError("")
  }

  const calculateDailyProfit = () => {
    if (!investmentAmount || !selectedPlan) return "$0.00"
    const amount = Number.parseFloat(investmentAmount)
    const rate = selectedPlan.rate
    return `$${(amount * rate).toFixed(2)}`
  }

  // Check if wallet has sufficient balance
  const checkWalletBalance = () => {
    const amount = Number.parseFloat(investmentAmount)
    if (amount > walletBalance) {
      setBalanceError(`Insufficient balance. You need $${(amount - walletBalance).toFixed(2)} more.`)
      return false
    } else {
      setBalanceError("")
      return true
    }
  }

  // Handle investment amount change
  const handleAmountChange = (e) => {
    setInvestmentAmount(e.target.value)
    checkWalletBalance()
  }

  const handleInvestment = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const amount = Number.parseFloat(investmentAmount)

      if (amount < selectedPlan.min || (selectedPlan.max !== Number.POSITIVE_INFINITY && amount > selectedPlan.max)) {
        toast.error(
          `Investment amount must be between $${selectedPlan.min} and ${selectedPlan.max === Number.POSITIVE_INFINITY ? "∞" : `$${selectedPlan.max}`}`
        )
        setLoading(false)
        return
      }

      // Check wallet balance
      if (!checkWalletBalance()) {
        setLoading(false)
        return
      }

      // Complete the investment immediately using wallet balance
      await completeWalletInvestment(amount, selectedPlan.id)

    } catch (error) {
      console.error("Investment error:", error)
      toast.error(error.response?.data?.message || "Investment failed")
    }

    setLoading(false)
  }

  const completeWalletInvestment = async (amount, planId) => {
    try {
      console.log("💰 Creating investment:", { amount, planId });
      const response = await api.post("/investments/create", {
        amount,
        planId,
        paymentMethod: "usdt_trc20"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      console.log("📊 Investment response:", response.data);

      if (response.data.success) {
        toast.success(`Successfully invested $${amount.toFixed(2)}! Start earning now.`)
        setShowModal(false)
        setInvestmentAmount("")
        
        // Refresh wallet balance immediately
        await fetchWalletBalance()
        
        // Update wallet balance display
        if (response.data.updatedWalletBalance !== undefined) {
          setWalletBalance(response.data.updatedWalletBalance)
          console.log("💰 Updated wallet balance:", response.data.updatedWalletBalance);
        }
        
        // Navigate to dashboard to show updated stats
        setTimeout(() => {
          navigate("/dashboard")
        }, 1500)
      } else {
        toast.error(response.data.message || "Failed to complete investment")
      }
    } catch (error) {
      console.error("❌ Investment error:", error);
      toast.error(error.response?.data?.message || "Failed to complete investment")
    }
  }

  return (
    <>
      <Navbar />
      <main className={`${styles.investContainer} fade-in`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Investment Plans</h2>
          <p className={styles.sectionSubtitle}>Choose a plan that fits your investment goals</p>
          {user && (
            <div className={styles.walletInfo}>
              <span>Wallet Balance: ${walletBalance.toFixed(2)}</span>
            </div>
          )}
          <button 
            onClick={fetchPlans}
            style={{
              background: "#ffd700",
              color: "#000",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              marginTop: "10px"
            }}
          >
            🔄 Refresh Plans
          </button>
        </div>

        <div className={styles.plansGrid}>
          {plansLoading ? (
            <p>Loading investment plans...</p>
          ) : plans.length === 0 ? (
            <p>No investment plans available. Please check back later.</p>
          ) : (
            plans.map((plan, index) => (
              <div key={plan.id} className={`${styles.planCard} slide-up`} style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={`${styles.planHeader} ${plan.gradientClass}`}>
                  <h3 className={styles.planName}>{plan.name}</h3>
                  <div className={styles.planPrice}>{plan.price}</div>
                </div>

                <ul className={styles.planFeatures}>
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex}>✓ {feature}</li>
                  ))}
                </ul>

                <div className={styles.planActions}>
                  <button onClick={() => handleInvestClick(plan)} className={`${styles.investBtn} ${plan.btnClass}`}>
                    Invest Now
                  </button>
                </div>
                <div className={styles.cardGlow}></div>
              </div>
            ))
          )}
        </div>

        {/* Investment Modal */}
        {showModal && selectedPlan && (
          <div className={styles.investmentModal} onClick={() => setShowModal(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Make Investment</h3>
                <button onClick={() => setShowModal(false)} className={styles.closeModal} title="Close">
                  ✕
                </button>
              </div>

              <form onSubmit={handleInvestment}>
                <div className={styles.formGroup}>
                  <label htmlFor="investmentAmount">Amount ($)</label>
                  <input
                    type="number"
                    id="investmentAmount"
                    value={investmentAmount}
                    onChange={handleAmountChange}
                    min={selectedPlan?.min}
                    max={selectedPlan?.max === Number.POSITIVE_INFINITY ? undefined : selectedPlan?.max}
                    placeholder={`${selectedPlan?.min} - ${selectedPlan?.max === Number.POSITIVE_INFINITY ? "∞" : selectedPlan?.max}`}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="plan">Plan</label>
                  <input type="text" id="plan" value={selectedPlan?.name || ""} readOnly />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="expectedDaily">Expected Daily Profit</label>
                  <input type="text" id="expectedDaily" value={`${calculateDailyProfit()} per day`} readOnly />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="paymentMethod">Payment Method</label>
                  <div className={styles.paymentMethodDisplay}>
                    <span>USDT TRC20</span>
                    <small>Payment will be deducted from your wallet balance</small>
                  </div>
                </div>

                {/* Balance Error Message */}
                {balanceError && (
                  <div className={styles.balanceError}>
                    <span className={styles.errorIcon}>⚠️</span>
                    {balanceError}
                  </div>
                )}

                <button 
                  type="submit" 
                  className={styles.confirmBtn} 
                  disabled={loading || balanceError}
                >
                  {loading ? <span className="loading-spinner"></span> : "Confirm Investment"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}

export default Invest
