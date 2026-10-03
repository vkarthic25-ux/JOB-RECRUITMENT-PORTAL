const User = require('../models/User');
const CandidateProfile = require('../models/CandidateProfile');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const aiService = require('../services/aiService');

// @desc    Get candidate profile
// @route   GET /api/candidates/profile
// @access  Private (Candidate)
const getProfile = async (req, res, next) => {
  try {
    let profile = await CandidateProfile.findOne({ userId: req.user._id }).populate('resumeId');
    if (!profile) {
      profile = await CandidateProfile.create({
        userId: req.user._id,
        headline: 'Software Developer',
        skills: [],
      });
    }

    res.json({
      success: true,
      profile,
      user: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        location: req.user.location,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update candidate profile
// @route   PUT /api/candidates/profile
// @access  Private (Candidate)
const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      location,
      headline,
      bio,
      education,
      experience,
      skills,
      softSkills,
      certifications,
      projects,
      languages,
      preferredJobRoles,
      preferredLocations,
    } = req.body;

    // Update User model fields
    if (name || phone !== undefined || location !== undefined) {
      await User.findByIdAndUpdate(req.user._id, {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(location !== undefined && { location }),
      });
    }

    let profile = await CandidateProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = new CandidateProfile({ userId: req.user._id });
    }

    if (headline !== undefined) profile.headline = headline;
    if (bio !== undefined) profile.bio = bio;
    if (education !== undefined) profile.education = education;
    if (experience !== undefined) profile.experience = experience;
    if (skills !== undefined) profile.skills = skills;
    if (softSkills !== undefined) profile.softSkills = softSkills;
    if (certifications !== undefined) profile.certifications = certifications;
    if (projects !== undefined) profile.projects = projects;
    if (languages !== undefined) profile.languages = languages;
    if (preferredJobRoles !== undefined) profile.preferredJobRoles = preferredJobRoles;
    if (preferredLocations !== undefined) profile.preferredLocations = preferredLocations;

    profile.profileCompletion = profile.calculateCompletion();
    await profile.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get candidate dashboard statistics
// @route   GET /api/candidates/dashboard
// @access  Private (Candidate)
const getDashboardStats = async (req, res, next) => {
  try {
    const candidateId = req.user._id;

    const profile = await CandidateProfile.findOne({ userId: candidateId }).populate('resumeId');
    const applications = await Application.find({ candidateId }).populate({
      path: 'jobId',
      populate: { path: 'companyId' },
    });

    const totalApplications = applications.length;
    const underReview = applications.filter((a) => a.status === 'Under Review').length;
    const shortlisted = applications.filter((a) => a.status === 'Shortlisted').length;
    const selected = applications.filter((a) => a.status === 'Selected').length;

    const interviews = await Interview.find({
      candidateId,
      status: 'Scheduled',
    }).populate({
      path: 'jobId',
      populate: { path: 'companyId' },
    }).populate('recruiterId', 'name email');

    // Fetch active jobs for quick recommendation
    const activeJobs = await Job.find({ status: 'active' }).populate('companyId').limit(15);
    const candidateSkills = profile ? profile.skills : [];
    const recommendedJobs = await aiService.recommendJobs(
      { skills: candidateSkills, education: profile?.education || [], experience: profile?.experience || [] },
      activeJobs
    );

    res.json({
      success: true,
      stats: {
        totalApplications,
        underReview,
        shortlisted,
        selected,
        upcomingInterviews: interviews.length,
        profileCompletion: profile ? profile.profileCompletion : 20,
        hasResume: !!profile?.resumeId,
        resumeName: profile?.resumeId?.fileName || null,
      },
      recentApplications: applications.slice(0, 5),
      upcomingInterviews: interviews.slice(0, 3),
      recommendedJobs: recommendedJobs.slice(0, 4),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getDashboardStats,
};
