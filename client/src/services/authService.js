import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

export const register = (userData) => axios.post(`${API_URL}/register`, userData);
export const login = (credentials) => axios.post(`${API_URL}/login`, credentials);

export const apiRegister = async ({ name, email, password, whatsapp, referralCode }) => {
  console.log("apiRegister called with:", { name, email, whatsapp, referralCode });
  const response = await axios.post(`${API_URL}/register`, {
    name,
    email,
    password,
    whatsapp,
    referralCode
  });
  console.log("apiRegister response:", response);
  return response; // Return full response object
};
