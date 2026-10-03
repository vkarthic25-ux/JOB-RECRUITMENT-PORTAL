const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    matchPercentage: {
      type: Number,
      required: true,
      default: 0,
    },
    skillMatch: {
      type: Number,
      default: 0,
    },
    experienceMatch: {
      type: Number,
      default: 0,
    },
    educationMatch: {
      type: Number,
      default: 0,
    },
    roleMatch: {
      type: Number,
      default: 0,
    },
    eligibilityStatus: {
      type: String,
      enum: ['Eligible', 'Partially Eligible', 'Not Eligible'],
      default: 'Partially Eligible',
    },
    eligibilityReasons: [
      {
        type: String,
      },
    ],
    matchedSkills: [
      {
        type: String,
      },
    ],
    missingSkills: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: [
        'Applied',
        'Under Review',
        'Shortlisted',
        'Interview Scheduled',
        'Selected',
        'Rejected',
      ],
      default: 'Applied',
    },
    recruiterNotes: {
      type: String,
      default: '',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications by same candidate to same job
applicationSchema.index({ candidateId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
