const Interview = require('../models/Interview');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Notification = require('../models/Notification');

// @desc    Schedule new interview (Recruiter)
// @route   POST /api/interviews
// @access  Private (Recruiter)
const scheduleInterview = async (req, res, next) => {
  try {
    const { applicationId, date, time, mode, meetingLink, location, notes } = req.body;
    const recruiterId = req.user._id;

    if (!applicationId || !date || !time) {
      return res.status(400).json({ success: false, message: 'Please provide applicationId, date, and time.' });
    }

    const application = await Application.findById(applicationId).populate('jobId');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const interview = await Interview.create({
      applicationId,
      candidateId: application.candidateId,
      recruiterId,
      jobId: application.jobId._id,
      date,
      time,
      mode: mode || 'Online',
      meetingLink: meetingLink || '',
      location: location || '',
      notes: notes || '',
      status: 'Scheduled',
    });

    // Update application status to Interview Scheduled
    application.status = 'Interview Scheduled';
    await application.save();

    // Create Notification for candidate
    await Notification.create({
      userId: application.candidateId,
      title: '📅 Interview Scheduled!',
      message: `An interview has been scheduled for '${application.jobId.title}' on ${date} at ${time} (${mode || 'Online'}).`,
      type: 'interview',
      link: `/candidate/interviews`,
    });

    res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully and candidate notified.',
      interview,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get interviews for logged-in user (Candidate or Recruiter)
// @route   GET /api/interviews
// @access  Private
const getInterviews = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let query = {};

    if (req.user.role === 'candidate') {
      query.candidateId = userId;
    } else if (req.user.role === 'recruiter') {
      query.recruiterId = userId;
    }

    const interviews = await Interview.find(query)
      .populate('candidateId', 'name email phone location')
      .populate('recruiterId', 'name email')
      .populate({
        path: 'jobId',
        populate: { path: 'companyId' },
      })
      .sort({ date: 1, time: 1 });

    res.json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single interview details
// @route   GET /api/interviews/:id
// @access  Private
const getInterviewById = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('candidateId', 'name email phone')
      .populate('recruiterId', 'name email')
      .populate({
        path: 'jobId',
        populate: { path: 'companyId' },
      })
      .populate('applicationId');

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found.' });
    }

    res.json({ success: true, interview });
  } catch (error) {
    next(error);
  }
};

// @desc    Update interview status or details
// @route   PUT /api/interviews/:id
// @access  Private (Recruiter / Admin)
const updateInterview = async (req, res, next) => {
  try {
    const { status, date, time, meetingLink, location, notes } = req.body;
    const interview = await Interview.findById(req.params.id).populate('jobId');

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found.' });
    }

    if (status) interview.status = status;
    if (date) interview.date = date;
    if (time) interview.time = time;
    if (meetingLink !== undefined) interview.meetingLink = meetingLink;
    if (location !== undefined) interview.location = location;
    if (notes !== undefined) interview.notes = notes;

    await interview.save();

    // If cancelled or changed, notify candidate
    if (status === 'Cancelled') {
      await Notification.create({
        userId: interview.candidateId,
        title: 'Interview Cancelled',
        message: `Your interview for '${interview.jobId?.title || 'Job'}' has been cancelled by the recruiter.`,
        type: 'interview',
        link: '/candidate/interviews',
      });
    }

    res.json({
      success: true,
      message: 'Interview updated successfully.',
      interview,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete/Cancel interview
// @route   DELETE /api/interviews/:id
// @access  Private (Recruiter / Admin)
const deleteInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found.' });
    }

    await Interview.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Interview deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  scheduleInterview,
  getInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
};
