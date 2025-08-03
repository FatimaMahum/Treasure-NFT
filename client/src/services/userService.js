import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/users`;

export const getAllUsers = (token) =>
  axios.get(`${API_URL}/`, {
    headers: { Authorization: `Bearer ${token}` },
  }); 