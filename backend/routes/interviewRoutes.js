const express = require('express');
const router = express.Router();
const {
  scheduleInterview,
  getInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
} = require('../controllers/interviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', authorize('recruiter', 'admin'), scheduleInterview);
router.get('/', getInterviews);
router.get('/:id', getInterviewById);
router.put('/:id', authorize('recruiter', 'admin'), updateInterview);
router.delete('/:id', authorize('recruiter', 'admin'), deleteInterview);

module.exports = router;
