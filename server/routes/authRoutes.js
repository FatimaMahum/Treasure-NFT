import express from "express"
import { register, login, checkAvailability, forgotPassword, verifyResetCode, resetPassword } from "../controllers/authController.js"

const router = express.Router()

// Auth routes
router.post("/register", register)
router.post("/login", login)
router.get("/check-availability", checkAvailability)

// Forgot password routes
router.post("/forgot-password", forgotPassword)
router.post("/verify-reset-code", verifyResetCode)
router.post("/reset-password", resetPassword)

export default router
