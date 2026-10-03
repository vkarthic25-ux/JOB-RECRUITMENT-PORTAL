const mongoose = require('mongoose');
const Application = require('../models/Application');
const Job = require('../models/Job');
const CandidateProfile = require('../models/CandidateProfile');
const Resume = require('../models/Resume');
const Notification = require('../models/Notification');
const { calculateJobMatch } = require('../utils/scoringEngine');
const { checkEligibility } = require('../utils/eligibilityEngine');

// @desc    Candidate applies to a job
// @route   POST /api/applications
// @access  Private (Candidate)
const applyJob = async (req, res, next) => {
  try {
    const { jobId } = req.body;
    const candidateId = req.user._id;

    if (!jobId) {
      return res.status(400).json({ success: false, message: 'Please provide jobId.' });
    }

    const job = await Job.findById(jobId).populate('companyId');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found.' });
    }

    if (job.status !== 'active') {
      return res.status(400).json({ success: false, message: 'This job posting is no longer active.' });
    }

    // Check duplicate application
    const existing = await Application.findOne({ candidateId, jobId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this position. Check your applications page to track status.',
      });
    }

    // Fetch candidate profile & resume
    const profile = await CandidateProfile.findOne({ userId: candidateId }).populate('resumeId');
    const resume = await Resume.findOne({ candidateId }).sort('-uploadedAt');

    if (!resume && (!profile || profile.skills.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your profile or upload a resume before applying for jobs.',
      });
    }

    const candData = {
      skills: profile?.skills || resume?.extractedSkills || [],
      education: profile?.education || resume?.education || [],
      experience: profile?.experience || resume?.experience || [],
      headline: profile?.headline || '',
      preferredJobRoles: profile?.preferredJobRoles || [],
    };

    // Calculate match & eligibility
    const match = calculateJobMatch(candData, job);
    const eligibility = checkEligibility(candData, job);

    const application = await Application.create({
      candidateId,
      jobId,
      resumeId: resume ? resume._id : (profile?.resumeId?._id || null),
      matchPercentage: match.overallMatch,
      skillMatch: match.skillMatch,
      experienceMatch: match.experienceMatch,
      educationMatch: match.educationMatch,
      roleMatch: match.roleMatch,
      eligibilityStatus: eligibility.status,
      eligibilityReasons: eligibility.reasons,
      matchedSkills: match.matchedSkills,
      missingSkills: match.missingSkills,
      status: 'Applied',
    });

    // Notify Recruiter
    await Notification.create({
      userId: job.recruiterId,
      title: 'New Applicant Received',
      message: `${req.user.name} applied for '${job.title}' with a ${match.overallMatch}% AI match score.`,
      type: 'application',
      link: `/recruiter/jobs/${job._id}/applicants`,
    });

    // Notify Candidate confirmation
    await Notification.create({
      userId: candidateId,
      title: 'Application Submitted',
      message: `Your application for '${job.title}' at ${job.companyId?.name || 'Company'} was submitted successfully.`,
      type: 'application',
      link: `/candidate/applications`,
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get applications for logged-in candidate
// @route   GET /api/applications/candidate
// @access  Private (Candidate)
const getCandidateApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ candidateId: req.user._id })
      .populate({
        path: 'jobId',
        populate: { path: 'companyId' },
      })
      .populate('resumeId')
      .sort('-appliedAt');

    res.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get applicants for a specific job (Recruiter)
// @route   GET /api/applications/job/:jobId
// @access  Private (Recruiter / Admin)
const getJobApplicants = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { status, eligibility, minMatch, sort } = req.query;

    const job = await Job.findById(jobId).populate('companyId');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    const filter = { jobId };
    if (status && status !== 'All') filter.status = status;
    if (eligibility && eligibility !== 'All') filter.eligibilityStatus = eligibility;
    if (minMatch) filter.matchPercentage = { $gte: Number(minMatch) };

    let sortQuery = { matchPercentage: -1 };
    if (sort === 'oldest') sortQuery = { appliedAt: 1 };
    if (sort === 'newest') sortQuery = { appliedAt: -1 };
    if (sort === 'match_asc') sortQuery = { matchPercentage: 1 };

    const applications = await Application.find(filter)
      .populate('candidateId', 'name email phone location')
      .populate('resumeId')
      .sort(sortQuery);

    // Fetch candidate profiles to enrich details
    const candidateIds = applications.map((a) => a.candidateId?._id);
    const profiles = await CandidateProfile.find({ userId: { $in: candidateIds } });

    const enrichedApplications = applications.map((app) => {
      const candProfile = profiles.find(
        (p) => p.userId.toString() === app.candidateId?._id.toString()
      );
      return {
        ...app.toObject(),
        profile: candProfile || null,
      };
    });

    res.json({
      success: true,
      job,
      count: enrichedApplications.length,
      applications: enrichedApplications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get application by ID
// @route   GET /api/applications/:id
// @access  Private
const getApplicationById = async (req, res, next) => {
  try {
    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing application ID.' });
    }

    const application = await Application.findById(req.params.id)
      .populate('candidateId', 'name email phone location')
      .populate({
        path: 'jobId',
        populate: { path: 'companyId' },
      })
      .populate('resumeId');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const profile = await CandidateProfile.findOne({ userId: application.candidateId._id });

    res.json({
      success: true,
      application,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status (Recruiter)
// @route   PUT /api/applications/:id/status
// @access  Private (Recruiter / Admin)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const validStatuses = [
      'Applied',
      'Under Review',
      'Shortlisted',
      'Interview Scheduled',
      'Selected',
      'Rejected',
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid application status provided.' });
    }

    const application = await Application.findById(req.params.id)
      .populate('jobId')
      .populate('candidateId');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    application.status = status;
    if (notes !== undefined) application.recruiterNotes = notes;
    await application.save();

    // Create notification for candidate
    let notifTitle = `Application Status Update`;
    let notifMsg = `Your application status for '${application.jobId?.title || 'Job'}' was updated to: ${status}.`;

    if (status === 'Shortlisted') {
      notifTitle = '🎉 Congratulations! You have been Shortlisted!';
      notifMsg = `Great news! You have been shortlisted for '${application.jobId?.title || 'Position'}'. The hiring team will reach out shortly for interview scheduling.`;
    } else if (status === 'Selected') {
      notifTitle = '🌟 Offer / Selection Update!';
      notifMsg = `Congratulations! You have been selected for '${application.jobId?.title || 'Position'}'.`;
    }

    await Notification.create({
      userId: application.candidateId._id,
      title: notifTitle,
      message: notifMsg,
      type: 'application',
      link: `/candidate/applications`,
    });

    res.json({
      success: true,
      message: `Application status updated to ${status}.`,
      application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get applications based on role
// @route   GET /api/applications
// @access  Private
const getApplications = async (req, res, next) => {
  try {
    if (req.user.role === 'candidate') {
      const applications = await Application.find({ candidateId: req.user._id })
        .populate({ path: 'jobId', populate: { path: 'companyId' } })
        .populate('resumeId')
        .sort('-appliedAt');
      return res.json({ success: true, count: applications.length, applications });
    }

    if (req.user.role === 'recruiter') {
      const jobs = await Job.find({ recruiterId: req.user._id });
      const jobIds = jobs.map((j) => j._id);
      const applications = await Application.find({ jobId: { $in: jobIds } })
        .populate('candidateId', 'name email phone location')
        .populate({ path: 'jobId', populate: { path: 'companyId' } })
        .populate('resumeId')
        .sort('-appliedAt');
      return res.json({ success: true, count: applications.length, applications });
    }

    // Admin
    const applications = await Application.find()
      .populate('candidateId', 'name email phone location')
      .populate({ path: 'jobId', populate: { path: 'companyId' } })
      .populate('resumeId')
      .sort('-appliedAt');
    return res.json({ success: true, count: applications.length, applications });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyJob,
  getApplications,
  getCandidateApplications,
  getJobApplicants,
  getApplicationById,
  updateApplicationStatus,
};
