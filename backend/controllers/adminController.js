const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Interview = require('../models/Interview');

// @desc    Get admin dashboard stats & charts
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const candidates = await User.countDocuments({ role: 'candidate' });
    const recruiters = await User.countDocuments({ role: 'recruiter' });
    const companies = await Company.countDocuments();
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'active' });
    const totalApplications = await Application.countDocuments();
    const totalInterviews = await Interview.countDocuments();

    // Application status breakdown
    const appliedCount = await Application.countDocuments({ status: 'Applied' });
    const reviewCount = await Application.countDocuments({ status: 'Under Review' });
    const shortlistedCount = await Application.countDocuments({ status: 'Shortlisted' });
    const interviewCount = await Application.countDocuments({ status: 'Interview Scheduled' });
    const selectedCount = await Application.countDocuments({ status: 'Selected' });
    const rejectedCount = await Application.countDocuments({ status: 'Rejected' });

    const statusChart = [
      { name: 'Applied', value: appliedCount, color: '#3b82f6' },
      { name: 'Under Review', value: reviewCount, color: '#8b5cf6' },
      { name: 'Shortlisted', value: shortlistedCount, color: '#f59e0b' },
      { name: 'Interview', value: interviewCount, color: '#06b6d4' },
      { name: 'Selected', value: selectedCount, color: '#10b981' },
      { name: 'Rejected', value: rejectedCount, color: '#ef4444' },
    ];

    // Activity trend mock / timeline
    const activityTrend = [
      { month: 'Jan', candidates: 12, jobs: 4, applications: 25 },
      { month: 'Feb', candidates: 24, jobs: 8, applications: 48 },
      { month: 'Mar', candidates: 38, jobs: 14, applications: 76 },
      { month: 'Apr', candidates: 50, jobs: 20, applications: 110 },
      { month: 'May', candidates: 65, jobs: 26, applications: 155 },
      { month: 'Current', candidates, jobs: totalJobs, applications: totalApplications },
    ];

    res.json({
      success: true,
      stats: {
        totalUsers,
        candidates,
        recruiters,
        companies,
        totalJobs,
        activeJobs,
        totalApplications,
        totalInterviews,
      },
      charts: {
        statusChart,
        activityTrend,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with filtering
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;
    const query = {};

    if (role && role !== 'All') query.role = role;
    if (status && status !== 'All') query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).sort('-createdAt');
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user status (activate / disable)
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private (Admin)
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Don't disable admin itself
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot disable administrator account.' });
    }

    user.status = user.status === 'active' ? 'disabled' : 'active';
    await user.save();

    res.json({
      success: true,
      message: `User account has been ${user.status === 'active' ? 'activated' : 'disabled'}.`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs for Admin
// @route   GET /api/admin/jobs
// @access  Private (Admin)
const getAdminJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find()
      .populate('companyId')
      .populate('recruiterId', 'name email')
      .sort('-createdAt');
    res.json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications for Admin
// @route   GET /api/admin/applications
// @access  Private (Admin)
const getAdminApplications = async (req, res, next) => {
  try {
    const applications = await Application.find()
      .populate('candidateId', 'name email phone')
      .populate({
        path: 'jobId',
        populate: { path: 'companyId' },
      })
      .sort('-appliedAt');
    res.json({ success: true, count: applications.length, applications });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all companies for Admin
// @route   GET /api/admin/companies
// @access  Private (Admin)
const getAdminCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find().sort('-createdAt');
    res.json({ success: true, count: companies.length, companies });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  toggleUserStatus,
  getAdminJobs,
  getAdminApplications,
  getAdminCompanies,
};
