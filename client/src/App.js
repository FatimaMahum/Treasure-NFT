// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Invest from './pages/Invest';
import FAQ from './pages/FAQ';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Referrals from './pages/Referrals';
import PaymentGateway from './pages/PaymentGateway';
import WalletTopUp from './pages/WalletTopUp';
import ForgotPassword from './pages/ForgotPassword';
import AdminWithdrawals from './pages/AdminWithdrawals';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="appWrapper">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/invest" element={<Invest />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/referrals" element={<Referrals />} />
            <Route path="/payment-gateway" element={<PaymentGateway />} />
            <Route path="/wallet-topup" element={<WalletTopUp />} />
            <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
