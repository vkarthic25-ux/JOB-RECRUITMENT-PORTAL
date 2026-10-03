const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    date: {
      type: String,
      required: [true, 'Please provide interview date (YYYY-MM-DD)'],
    },
    time: {
      type: String,
      required: [true, 'Please provide interview time (e.g. 10:00 AM)'],
    },
    mode: {
      type: String,
      enum: ['Online', 'Offline'],
      default: 'Online',
    },
    meetingLink: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Interview', interviewSchema);
