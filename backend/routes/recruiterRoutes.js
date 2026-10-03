const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  updateCompany,
  getDashboardStats,
} = require('../controllers/recruiterController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('recruiter', 'admin'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/company', updateCompany);
router.get('/dashboard', getDashboardStats);

module.exports = router;
