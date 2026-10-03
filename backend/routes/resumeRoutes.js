const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const {
  uploadResume,
  getCandidateResume,
  getResumeById,
  deleteResume,
  reAnalyzeResume,
} = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/upload', upload.single('resume'), uploadResume);
router.get('/current', getCandidateResume);
router.get('/:id', getResumeById);
router.delete('/:id', deleteResume);
router.post('/:id/analyze', reAnalyzeResume);

module.exports = router;
