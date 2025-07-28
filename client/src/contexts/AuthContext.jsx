"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin, register as apiRegister } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")) || null);
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await apiLogin({ email, password });

      const { token, user } = res.data;

      setToken(token);
      setUser(user);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      return { success: true, message: res.data.message || "Login successful!" };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async ({ name, email, password, whatsapp, referralCode }) => {
    console.log("AuthContext register called with:", { name, email, whatsapp, referralCode });
    try {
      console.log("Calling apiRegister...");
      const response = await apiRegister({ name, email, password, whatsapp, referralCode });
      console.log("AuthContext register response:", response);
      console.log("Response data:", response.data);
      const result = { success: true, message: response.data?.message || "Registered successfully!" };
      console.log("Returning result:", result);
      return result;
    } catch (err) {
      console.error("AuthContext register error:", err);
      console.error("Error response:", err.response);
      const result = { success: false, message: err.response?.data?.message || "Registration failed" };
      console.log("Returning error result:", result);
      return result;
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken("");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
