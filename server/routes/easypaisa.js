import express from "express";
import { initiatePayment, easypaisaCallback } from "../controllers/easypaisaController.js";
const router = express.Router();

router.post("/pay", initiatePayment);
router.post("/callback", easypaisaCallback);

export default router; 