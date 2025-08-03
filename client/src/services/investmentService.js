import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/investments`;

export const createInvestment = (investmentData, token) =>
  axios.post(`${API_URL}/`, investmentData, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getMyInvestments = (token) =>
  axios.get(`${API_URL}/user`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAllInvestments = (token) =>
  axios.get(`${API_URL}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
