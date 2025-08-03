import axios from 'axios';

const API_BASE = `${process.env.REACT_APP_BACKEND_URL}/withdrawals`;

export const requestWithdrawal = async (data, token) => {
  return axios.post(API_BASE, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getMyWithdrawals = async (token) => {
  // User can only see their own withdrawals (filter on frontend)
  return axios.get(API_BASE, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getAllWithdrawals = async (token) => {
  // For admin
  return axios.get(API_BASE, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const updateWithdrawalStatus = async (id, status, adminNote, token) => {
  return axios.patch(`${API_BASE}/${id}`, { status, adminNote }, {
    headers: { Authorization: `Bearer ${token}` }
  });
}; 