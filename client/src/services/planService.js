import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/plans`;

// Get all plans (public or protected depending on backend)
export const getPlans = () => axios.get(API_URL);

// Create a new plan (protected route with token)
export const createPlan = (planData, token) =>
  axios.post(API_URL, planData, {
    headers: { Authorization: `Bearer ${token}` },
  });
