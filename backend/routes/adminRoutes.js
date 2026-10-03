const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUsers,
  toggleUserStatus,
  getAdminJobs,
  getAdminApplications,
  getAdminCompanies,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.get('/jobs', getAdminJobs);
router.get('/applications', getAdminApplications);
router.get('/companies', getAdminCompanies);

module.exports = router;
