import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import planRoutes from './routes/planRoutes.js';
import investmentRoutes from './routes/investmentRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import easypaisaRoutes from './routes/easypaisa.js';
import referralRoutes from './routes/referralRoutes.js';
import cryptoRoutes from './routes/cryptoRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import emailValidationRoutes from './routes/emailValidationRoutes.js';
import withdrawalRoutes from './routes/withdrawalRoutes.js';
import './cron/dailyReturn.js';

dotenv.config();
const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// Test route to verify server is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/easypaisa', easypaisaRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/crypto', cryptoRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/email-validation', emailValidationRoutes);
app.use('/api/withdrawals', withdrawalRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
