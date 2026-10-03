const express = require('express');
const router = express.Router();
const {
  applyJob,
  getApplications,
  getCandidateApplications,
  getJobApplicants,
  getApplicationById,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', authorize('candidate'), applyJob);
router.get('/', getApplications);
router.get('/candidate', authorize('candidate'), getCandidateApplications);
router.get('/job/:jobId', authorize('recruiter', 'admin'), getJobApplicants);
router.get('/:id', getApplicationById);
router.put('/:id/status', authorize('recruiter', 'admin'), updateApplicationStatus);

module.exports = router;
