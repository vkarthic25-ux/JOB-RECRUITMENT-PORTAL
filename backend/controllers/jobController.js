const Job = require('../models/Job');
const Company = require('../models/Company');
const RecruiterProfile = require('../models/RecruiterProfile');
const CandidateProfile = require('../models/CandidateProfile');
const Application = require('../models/Application');
const { calculateJobMatch } = require('../utils/scoringEngine');
const { checkEligibility } = require('../utils/eligibilityEngine');
const aiService = require('../services/aiService');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to optionally get candidate from token if present in public routes
const getOptionalCandidate = async (req) => {
  try {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'talent_ai_super_secret_jwt_key_2026_recruitment');
      const user = await User.findById(decoded.id);
      if (user && user.role === 'candidate') {
        const profile = await CandidateProfile.findOne({ userId: user._id }).populate('resumeId');
        return { user, profile };
      }
    }
  } catch (e) {
    // Guest user
  }
  return null;
};

// @desc    Get all jobs with search, filters & optional candidate match scoring
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res, next) => {
  try {
    const {
      search,
      location,
      employmentType,
      experienceRequired,
      skills,
      minSalary,
      sort,
    } = req.query;

    const query = { status: 'active' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { requiredSkills: { $regex: search, $options: 'i' } },
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (employmentType && employmentType !== 'All') {
      query.employmentType = employmentType;
    }

    if (experienceRequired !== undefined && experienceRequired !== '') {
      query.experienceRequired = { $lte: Number(experienceRequired) };
    }

    if (minSalary) {
      query['salaryRange.min'] = { $gte: Number(minSalary) };
    }

    if (skills) {
      const skillArr = skills.split(',').map(s => s.trim());
      query.requiredSkills = { $in: skillArr };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'salary_high') sortOption = { 'salaryRange.max': -1 };
    if (sort === 'salary_low') sortOption = { 'salaryRange.min': 1 };
    if (sort === 'experience_low') sortOption = { experienceRequired: 1 };

    let jobs = await Job.find(query)
      .populate('companyId')
      .populate('recruiterId', 'name email')
      .sort(sortOption);

    // If a candidate is logged in, attach live match calculation
    const candidateContext = await getOptionalCandidate(req);
    let enrichedJobs = jobs.map((j) => j.toObject());

    if (candidateContext && candidateContext.profile) {
      const candData = {
        skills: candidateContext.profile.skills || [],
        education: candidateContext.profile.education || [],
        experience: candidateContext.profile.experience || [],
        headline: candidateContext.profile.headline || '',
        preferredJobRoles: candidateContext.profile.preferredJobRoles || [],
      };

      enrichedJobs = enrichedJobs.map((job) => {
        const match = calculateJobMatch(candData, job);
        const elig = checkEligibility(candData, job);
        return {
          ...job,
          matchPercentage: match.overallMatch,
          skillMatch: match.skillMatch,
          experienceMatch: match.experienceMatch,
          educationMatch: match.educationMatch,
          roleMatch: match.roleMatch,
          eligibilityStatus: elig.status,
          matchedSkills: match.matchedSkills,
          missingSkills: match.missingSkills,
        };
      });

      if (sort === 'match' || sort === 'relevance') {
        enrichedJobs.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
      }
    }

    res.json({
      success: true,
      count: enrichedJobs.length,
      jobs: enrichedJobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job by ID with AI analysis for logged-in candidate
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('companyId')
      .populate('recruiterId', 'name email');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    let matchAnalysis = null;
    let hasApplied = false;
    let application = null;

    const candidateContext = await getOptionalCandidate(req);
    if (candidateContext) {
      const candidateId = candidateContext.user._id;
      // Check existing application
      application = await Application.findOne({ candidateId, jobId: job._id });
      hasApplied = !!application;

      // Calculate in-depth match
      const candData = {
        skills: candidateContext.profile?.skills || [],
        education: candidateContext.profile?.education || [],
        experience: candidateContext.profile?.experience || [],
        headline: candidateContext.profile?.headline || '',
        preferredJobRoles: candidateContext.profile?.preferredJobRoles || [],
      };

      matchAnalysis = await aiService.matchResumeToJob(candData, job);
    }

    res.json({
      success: true,
      job,
      matchAnalysis,
      hasApplied,
      applicationId: application ? application._id : null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new job posting
// @route   POST /api/jobs
// @access  Private (Recruiter)
const createJob = async (req, res, next) => {
  try {
    const recruiterId = req.user._id;
    const recruiterProfile = await RecruiterProfile.findOne({ userId: recruiterId });

    if (!recruiterProfile || !recruiterProfile.companyId) {
      return res.status(400).json({ success: false, message: 'Please associate a company with your recruiter profile before posting jobs.' });
    }

    const {
      title,
      department,
      description,
      responsibilities,
      requiredSkills,
      preferredSkills,
      qualification,
      experienceRequired,
      location,
      employmentType,
      salaryRange,
      applicationDeadline,
      status,
    } = req.body;

    if (!title || !description || !requiredSkills || requiredSkills.length === 0 || !location) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields (title, description, required skills, location).' });
    }

    const job = await Job.create({
      recruiterId,
      companyId: recruiterProfile.companyId,
      title,
      department: department || 'Engineering',
      description,
      responsibilities: Array.isArray(responsibilities) ? responsibilities : (responsibilities ? responsibilities.split('\n').filter(Boolean) : []),
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : requiredSkills.split(',').map((s) => s.trim()),
      preferredSkills: Array.isArray(preferredSkills) ? preferredSkills : (preferredSkills ? preferredSkills.split(',').map((s) => s.trim()) : []),
      qualification: qualification || "Bachelor's Degree in Computer Science or related",
      experienceRequired: experienceRequired !== undefined ? Number(experienceRequired) : 0,
      location,
      employmentType: employmentType || 'Full-time',
      salaryRange: salaryRange || { min: 70000, max: 130000, currency: 'USD' },
      applicationDeadline: applicationDeadline || new Date(+new Date() + 30 * 24 * 60 * 60 * 1000),
      status: status || 'active',
    });

    const populatedJob = await Job.findById(job._id).populate('companyId');

    res.status(201).json({
      success: true,
      message: 'Job posted successfully!',
      job: populatedJob,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update existing job posting
// @route   PUT /api/jobs/:id
// @access  Private (Recruiter / Admin)
const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    if (job.recruiterId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this job.' });
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('companyId');

    res.json({
      success: true,
      message: 'Job updated successfully.',
      job: updatedJob,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete job posting
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter / Admin)
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    if (job.recruiterId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this job.' });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Job deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recruiter's posted jobs
// @route   GET /api/jobs/recruiter/my-jobs
// @access  Private (Recruiter)
const getRecruiterJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user._id })
      .populate('companyId')
      .sort('-createdAt');

    const jobIds = jobs.map((j) => j._id);
    const applications = await Application.find({ jobId: { $in: jobIds } });

    const jobsWithCounts = jobs.map((job) => {
      const appCount = applications.filter((a) => a.jobId.toString() === job._id.toString()).length;
      return {
        ...job.toObject(),
        applicantCount: appCount,
      };
    });

    res.json({
      success: true,
      jobs: jobsWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getRecruiterJobs,
};
