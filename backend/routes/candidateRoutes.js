const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getDashboardStats,
} = require('../controllers/candidateController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/profile', getProfile);
router.put('/profile', authorize('candidate'), updateProfile);
router.get('/dashboard', authorize('candidate'), getDashboardStats);

module.exports = router;
