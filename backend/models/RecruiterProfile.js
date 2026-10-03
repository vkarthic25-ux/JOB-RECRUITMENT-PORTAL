const mongoose = require('mongoose');

const recruiterProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    designation: {
      type: String,
      default: 'Technical Recruiter',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('RecruiterProfile', recruiterProfileSchema);
