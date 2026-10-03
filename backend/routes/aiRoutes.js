const express = require('express');
const router = express.Router();
const {
  analyzeResumeEndpoint,
  getLatestResumeAnalysis,
  getResumeAnalysisById,
  resumeChatEndpoint,
  matchJobEndpoint,
  skillGapEndpoint,
  learningRoadmapEndpoint,
  recommendedJobsEndpoint,
} = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Standalone AI Resume Analyzer & Career Skill Advisor
router.post('/analyze-resume', authorize('candidate'), analyzeResumeEndpoint);
router.get('/resume-analysis', authorize('candidate'), getLatestResumeAnalysis);
router.get('/resume-analysis/:id', authorize('candidate', 'admin'), getResumeAnalysisById);
router.post('/resume-chat', authorize('candidate'), resumeChatEndpoint);

// Job Matching, Gap Analysis & Roadmaps
router.post('/match-job', matchJobEndpoint);
router.post('/skill-gap', authorize('candidate'), skillGapEndpoint);
router.post('/learning-roadmap', authorize('candidate'), learningRoadmapEndpoint);
router.get('/recommended-jobs', authorize('candidate'), recommendedJobsEndpoint);

module.exports = router;
