const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a job title'],
      trim: true,
    },
    department: {
      type: String,
      default: 'Engineering',
    },
    description: {
      type: String,
      required: [true, 'Please provide job description'],
    },
    responsibilities: [
      {
        type: String,
      },
    ],
    requiredSkills: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    preferredSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    qualification: {
      type: String,
      default: "Bachelor's Degree in Computer Science or related field",
    },
    experienceRequired: {
      type: Number,
      required: true,
      default: 0,
    },
    location: {
      type: String,
      required: [true, 'Please provide job location'],
    },
    employmentType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
      default: 'Full-time',
    },
    salaryRange: {
      min: { type: Number, default: 60000 },
      max: { type: Number, default: 120000 },
      currency: { type: String, default: 'USD' },
    },
    applicationDeadline: {
      type: Date,
      default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'draft'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Search index on title, skills, description
jobSchema.index({ title: 'text', description: 'text', requiredSkills: 'text' });

module.exports = mongoose.model('Job', jobSchema);
