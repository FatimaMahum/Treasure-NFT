# Treasure NFT

**Treasure NFT** is a full-stack web application that simulates an NFT investment platform. It allows users to register, invest in NFT plans, earn daily returns, refer friends, and manage their wallet—all with a modern, easy-to-use interface.

---

## Project Overview

Treasure NFT  features:
- User registration, login, and password reset
- Admin-only dashboard and management routes
- Investment plans with daily automated returns
- Referral program for inviting friends
- Wallet management and transaction history
- Automated welcome emails on registration

---

## Project Structure

```
Treasure-NFT-3/
  client/      # React frontend (user interface)
  server/      # Node.js/Express backend (API, database, logic)
```

---

## Tech Stack

**Frontend:**
- React (with React Router, Context API)
- Axios
- React Toastify

**Backend:**
- Node.js, Express
- MongoDB (via Mongoose)
- JWT for authentication
- Nodemailer (Gmail, SendGrid, or Mailgun for emails)
- bcryptjs for password hashing
- node-cron for daily return automation

---

## Setup & Installation

### 1. Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- MongoDB (local or cloud)

### 2. Install Dependencies

**Frontend:**
```bash
cd client
npm install
```

**Backend:**
```bash
cd ../server
npm install
```



### 4. Start the Application

**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
cd ../client
npm start
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:5000](http://localhost:5000)

---

## Main Features (Implemented)

- **User Authentication:** Register, log in, and reset passwords securely (JWT-based).
- **Admin Dashboard:** Admin-only routes for managing users, plans, and investments.
- **Investment Plans:** Users can invest in plans and receive daily returns automatically.
- **Daily Returns:** Automated daily profit distribution to user wallets (via backend cron job).
- **Referral Program:** Users can refer friends and earn commissions.
- **Wallet Management:** Users can view wallet balance and transaction history.
- **Welcome Emails:** New users receive a branded welcome email upon registration.

---

## Security

- Passwords are securely hashed with bcryptjs.
- JWT tokens are used for authentication.
- Admin routes are protected and only accessible to admin users.
- Sensitive credentials are stored in environment variables.
- The React development proxy is used only for local development and is safe.

---

## Email Setup

- Supports Gmail (with App Password), SendGrid, and Mailgun.
- Add credentials to your `server/.env` file.
- Welcome emails are sent automatically on user registration.
- See `server/EMAIL_SETUP.md` and `server/TREASURE_NFT_EMAIL_SETUP.md` for details.

---



---

**Thank you for using Treasure NFT!** 