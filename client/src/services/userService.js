import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

export const getAllUsers = (token) =>
  axios.get(`${API_URL}/`, {
    headers: { Authorization: `Bearer ${token}` },
  }); 