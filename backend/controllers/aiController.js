const Resume = require('../models/Resume');
const Job = require('../models/Job');
const CandidateProfile = require('../models/CandidateProfile');
const AIAnalysis = require('../models/AIAnalysis');
const aiService = require('../services/aiService');
const { normalizeAIAnalysis } = require('../utils/aiNormalizer');

// @desc    Perform deep AI resume analysis on candidate's uploaded resume
// @route   POST /api/ai/analyze-resume
// @access  Private (Candidate)
const analyzeResumeEndpoint = async (req, res, next) => {
  try {
    const { resumeId, text } = req.body;
    let resume = null;

    if (resumeId) {
      resume = await Resume.findOne({ _id: resumeId, candidateId: req.user._id });
      if (!resume) {
        return res.status(404).json({ success: false, message: 'Specified resume not found or access denied.' });
      }
    } else {
      // Find candidate's latest resume
      resume = await Resume.findOne({ candidateId: req.user._id }).sort('-uploadedAt');
    }

    let resumeText = text || resume?.extractedText || '';

    if (!resumeText && !resume) {
      return res.status(400).json({
        success: false,
        message: 'No resume found. Please upload a resume before triggering AI analysis.',
      });
    }

    // Run deep career analysis
    const rawDeepAnalysis = await aiService.analyzeResumeDeep(resumeText, resume);
    const deepAnalysis = normalizeAIAnalysis(rawDeepAnalysis, resume);

    // Save or update AIAnalysis record in MongoDB
    let analysisRecord = null;
    if (resume) {
      analysisRecord = await AIAnalysis.findOne({ candidateId: req.user._id, resumeId: resume._id, jobId: null });
    }

    if (analysisRecord) {
      // Update existing record
      Object.assign(analysisRecord, {
        ...deepAnalysis,
        analyzedAt: new Date(),
      });
      await analysisRecord.save();
    } else {
      // Create new record
      analysisRecord = await AIAnalysis.create({
        candidateId: req.user._id,
        resumeId: resume ? resume._id : null,
        jobId: null,
        ...deepAnalysis,
        analyzedAt: new Date(),
      });
    }

    // Sync skills to CandidateProfile if available
    try {
      const profile = await CandidateProfile.findOne({ userId: req.user._id });
      if (profile) {
        const detected = [
          ...(deepAnalysis.technicalSkills?.programming || []),
          ...(deepAnalysis.technicalSkills?.frameworks || []),
          ...(deepAnalysis.technicalSkills?.databases || []),
        ];
        if (detected.length > 0) {
          profile.skills = Array.from(new Set([...(profile.skills || []), ...detected]));
          profile.profileCompletion = profile.calculateCompletion();
          await profile.save();
        }
      }
    } catch (profileErr) {
      console.warn('[AI Controller] Profile sync warning:', profileErr.message);
    }

    res.json({
      success: true,
      message: 'AI Resume Analysis completed successfully!',
      analysis: analysisRecord,
      resume,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get latest candidate resume analysis (without re-uploading)
// @route   GET /api/ai/resume-analysis
// @access  Private (Candidate)
const getLatestResumeAnalysis = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ candidateId: req.user._id }).sort('-uploadedAt');
    let analysis = await AIAnalysis.findOne({ candidateId: req.user._id, jobId: null }).sort('-createdAt');

    if (!resume && !analysis) {
      return res.json({
        success: true,
        resume: null,
        analysis: null,
        message: 'No resume uploaded yet. Please upload a resume to unlock AI analysis.',
      });
    }

    let normalizedAnalysis = null;
    if (analysis) {
      normalizedAnalysis = {
        ...analysis.toObject(),
        ...normalizeAIAnalysis(analysis.toObject(), resume),
      };
    }

    res.json({
      success: true,
      resume,
      analysis: normalizedAnalysis,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get specific analysis record by ID
// @route   GET /api/ai/resume-analysis/:id
// @access  Private (Candidate / Admin)
const getResumeAnalysisById = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role !== 'admin') {
      query.candidateId = req.user._id;
    }
    const analysis = await AIAnalysis.findById(req.params.id).populate('resumeId');
    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis record not found.' });
    }
    res.json({ success: true, analysis });
  } catch (error) {
    next(error);
  }
};

// @desc    Interactive Ask AI about my resume chat
// @route   POST /api/ai/resume-chat
// @access  Private (Candidate)
const resumeChatEndpoint = async (req, res, next) => {
  try {
    const { question, analysisId } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a question.' });
    }

    let analysis = null;
    if (analysisId) {
      analysis = await AIAnalysis.findOne({ _id: analysisId, candidateId: req.user._id });
    }
    if (!analysis) {
      analysis = await AIAnalysis.findOne({ candidateId: req.user._id, jobId: null }).sort('-createdAt');
    }

    const resume = await Resume.findOne({ candidateId: req.user._id }).sort('-uploadedAt');

    const answer = await aiService.chatAboutResume(
      question.trim(),
      analysis || {},
      resume?.extractedText || ''
    );

    if (analysis) {
      if (!analysis.chatHistory) analysis.chatHistory = [];
      analysis.chatHistory.push({ sender: 'user', text: question.trim(), timestamp: new Date() });
      analysis.chatHistory.push({ sender: 'ai', text: answer, timestamp: new Date() });
      // Keep last 30 messages
      if (analysis.chatHistory.length > 30) {
        analysis.chatHistory = analysis.chatHistory.slice(-30);
      }
      await analysis.save();
    }

    res.json({
      success: true,
      answer,
      chatHistory: analysis?.chatHistory || [
        { sender: 'user', text: question.trim(), timestamp: new Date() },
        { sender: 'ai', text: answer, timestamp: new Date() },
      ],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Match candidate resume to specific job
// @route   POST /api/ai/match-job
// @access  Private
const matchJobEndpoint = async (req, res, next) => {
  try {
    const { jobId } = req.body;
    if (!jobId) {
      return res.status(400).json({ success: false, message: 'Please provide jobId.' });
    }

    const job = await Job.findById(jobId).populate('companyId');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    const profile = await CandidateProfile.findOne({ userId: req.user._id }).populate('resumeId');
    const resume = await Resume.findOne({ candidateId: req.user._id }).sort('-uploadedAt');

    const candData = {
      skills: profile?.skills || resume?.extractedSkills || [],
      education: profile?.education || resume?.education || [],
      experience: profile?.experience || resume?.experience || [],
      headline: profile?.headline || '',
      preferredJobRoles: profile?.preferredJobRoles || [],
    };

    const matchAnalysis = await aiService.matchResumeToJob(candData, job);

    res.json({
      success: true,
      jobTitle: job.title,
      company: job.companyId?.name || '',
      analysis: matchAnalysis,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Analyze Skill Gap for a job
// @route   POST /api/ai/skill-gap
// @access  Private (Candidate)
const skillGapEndpoint = async (req, res, next) => {
  try {
    const { jobId } = req.body;
    if (!jobId) {
      return res.status(400).json({ success: false, message: 'Please provide jobId.' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    const profile = await CandidateProfile.findOne({ userId: req.user._id });
    const resume = await Resume.findOne({ candidateId: req.user._id }).sort('-uploadedAt');
    const candidateSkills = profile?.skills || resume?.extractedSkills || [];

    const gapAnalysis = await aiService.analyzeSkillGap(
      candidateSkills,
      [...(job.requiredSkills || []), ...(job.preferredSkills || [])],
      job.title
    );

    res.json({
      success: true,
      job: {
        id: job._id,
        title: job.title,
        requiredSkills: job.requiredSkills,
        preferredSkills: job.preferredSkills,
      },
      gapAnalysis,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate personalized learning roadmap
// @route   POST /api/ai/learning-roadmap
// @access  Private (Candidate)
const learningRoadmapEndpoint = async (req, res, next) => {
  try {
    const { missingSkills, targetRole, jobId } = req.body;
    let targetSkills = missingSkills || [];
    let role = targetRole || 'Software Engineer';

    if (jobId) {
      const job = await Job.findById(jobId);
      if (job) {
        role = job.title;
        const profile = await CandidateProfile.findOne({ userId: req.user._id });
        const { calculateJobMatch } = require('../utils/scoringEngine');
        const match = calculateJobMatch(profile || {}, job);
        targetSkills = match.missingSkills;
      }
    }

    const profile = await CandidateProfile.findOne({ userId: req.user._id });
    const currentSkills = profile?.skills || [];

    const result = await aiService.generateLearningRoadmap(currentSkills, targetSkills, role);

    res.json({
      success: true,
      targetRole: role,
      roadmap: result.roadmap,
      skillGaps: result.skillGaps,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI recommended jobs for candidate
// @route   GET /api/ai/recommended-jobs
// @access  Private (Candidate)
const recommendedJobsEndpoint = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findOne({ userId: req.user._id }).populate('resumeId');
    const activeJobs = await Job.find({ status: 'active' }).populate('companyId').limit(25);

    const candData = {
      skills: profile?.skills || [],
      education: profile?.education || [],
      experience: profile?.experience || [],
      headline: profile?.headline || '',
      preferredJobRoles: profile?.preferredJobRoles || [],
    };

    const recommendations = await aiService.recommendJobs(candData, activeJobs);

    res.json({
      success: true,
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeResumeEndpoint,
  getLatestResumeAnalysis,
  getResumeAnalysisById,
  resumeChatEndpoint,
  matchJobEndpoint,
  skillGapEndpoint,
  learningRoadmapEndpoint,
  recommendedJobsEndpoint,
};
