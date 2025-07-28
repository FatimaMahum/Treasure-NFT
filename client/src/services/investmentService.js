import axios from 'axios';

const API_URL = 'http://localhost:5000/api/investments';

export const createInvestment = (investmentData, token) =>
  axios.post(`${API_URL}/`, investmentData, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getMyInvestments = (token) =>
  axios.get(`${API_URL}/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAllInvestments = (token) =>
  axios.get(`${API_URL}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
