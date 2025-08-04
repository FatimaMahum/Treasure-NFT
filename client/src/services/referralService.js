import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/referrals`;

// Get referral dashboard data
export const getReferralDashboard = (token) =>
  axios.get(`${API_URL}/dashboard`, {
    headers: { Authorization: `Bearer ${token}` }
  });

// Apply referral code
export const applyReferralCode = (referralCode, token) =>
  axios.post(`${API_URL}/apply-code`, 
    { referralCode },
    { headers: { Authorization: `Bearer ${token}` } }
  );

// Get referral link
export const getReferralLink = (token) =>
  axios.get(`${API_URL}/link`, {
    headers: { Authorization: `Bearer ${token}` }
  }); 