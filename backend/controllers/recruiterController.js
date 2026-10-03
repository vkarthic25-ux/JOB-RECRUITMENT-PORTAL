const RecruiterProfile = require('../models/RecruiterProfile');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Interview = require('../models/Interview');

// @desc    Get recruiter profile & company
// @route   GET /api/recruiters/profile
// @access  Private (Recruiter)
const getProfile = async (req, res, next) => {
  try {
    let profile = await RecruiterProfile.findOne({ userId: req.user._id }).populate('companyId');
    if (!profile) {
      const company = await Company.findOne() || await Company.create({ name: 'Innovative Corp' });
      profile = await RecruiterProfile.create({
        userId: req.user._id,
        companyId: company._id,
        designation: 'Hiring Lead',
      });
      profile = await profile.populate('companyId');
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

// @desc    Update recruiter profile
// @route   PUT /api/recruiters/profile
// @access  Private (Recruiter)
const updateProfile = async (req, res, next) => {
  try {
    const { designation } = req.body;
    let profile = await RecruiterProfile.findOne({ userId: req.user._id });
    if (profile) {
      if (designation) profile.designation = designation;
      await profile.save();
    }
    res.json({ success: true, message: 'Recruiter profile updated.', profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Update recruiter company
// @route   PUT /api/recruiters/company
// @access  Private (Recruiter)
const updateCompany = async (req, res, next) => {
  try {
    const { name, description, website, industry, location, logo } = req.body;
    const profile = await RecruiterProfile.findOne({ userId: req.user._id });

    if (!profile || !profile.companyId) {
      return res.status(404).json({ success: false, message: 'Company not found for this recruiter.' });
    }

    const company = await Company.findById(profile.companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company record not found.' });
    }

    if (name) company.name = name;
    if (description !== undefined) company.description = description;
    if (website !== undefined) company.website = website;
    if (industry !== undefined) company.industry = industry;
    if (location !== undefined) company.location = location;
    if (logo !== undefined) company.logo = logo;

    await company.save();

    res.json({
      success: true,
      message: 'Company profile updated successfully.',
      company,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recruiter dashboard stats & analytics
// @route   GET /api/recruiters/dashboard
// @access  Private (Recruiter)
const getDashboardStats = async (req, res, next) => {
  try {
    const recruiterId = req.user._id;
    const jobs = await Job.find({ recruiterId }).populate('companyId');
    const jobIds = jobs.map((j) => j._id);

    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate('candidateId', 'name email phone location')
      .populate('jobId', 'title department')
      .sort('-appliedAt');

    const totalJobs = jobs.length;
    const activeJobs = jobs.filter((j) => j.status === 'active').length;
    const totalApplications = applications.length;
    const shortlisted = applications.filter((a) => a.status === 'Shortlisted').length;
    const interviews = applications.filter((a) => a.status === 'Interview Scheduled').length;
    const selected = applications.filter((a) => a.status === 'Selected').length;
    const rejected = applications.filter((a) => a.status === 'Rejected').length;

    // Applications per job chart data
    const applicationsPerJob = jobs.map((job) => {
      const count = applications.filter((a) => a.jobId && a.jobId._id.toString() === job._id.toString()).length;
      return {
        jobTitle: job.title.length > 18 ? job.title.slice(0, 18) + '...' : job.title,
        applications: count,
      };
    });

    // Match score distribution
    const highMatch = applications.filter((a) => a.matchPercentage >= 75).length;
    const mediumMatch = applications.filter((a) => a.matchPercentage >= 50 && a.matchPercentage < 75).length;
    const lowMatch = applications.filter((a) => a.matchPercentage < 50).length;

    const matchDistribution = [
      { name: 'High Fit (75%+)', value: highMatch, color: '#10b981' },
      { name: 'Moderate Fit (50-74%)', value: mediumMatch, color: '#6366f1' },
      { name: 'Low Fit (<50%)', value: lowMatch, color: '#f59e0b' },
    ];

    res.json({
      success: true,
      stats: {
        totalJobs,
        activeJobs,
        totalApplications,
        shortlisted,
        interviews,
        selected,
        rejected,
      },
      charts: {
        applicationsPerJob,
        matchDistribution,
      },
      recentApplicants: applications.slice(0, 6),
      recentJobs: jobs.slice(0, 5),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateCompany,
  getDashboardStats,
};
