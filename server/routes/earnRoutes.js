import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getAds,
  watchAd,
  getUserWatchedAds,
  createAd,
  getAllAds,
  updateAd,
  deleteAd
} from '../controllers/earnController.js';

const router = express.Router();

// Public routes (for logged-in users)
router.get('/ads', protect, getAds);
router.post('/watch-ad', protect, watchAd);
router.get('/watched-ads', protect, getUserWatchedAds);

// Admin routes
router.get('/admin/ads', protect, admin, getAllAds);
router.post('/admin/ads', protect, admin, createAd);
router.put('/admin/ads/:id', protect, admin, updateAd);
router.delete('/admin/ads/:id', protect, admin, deleteAd);

export default router; 