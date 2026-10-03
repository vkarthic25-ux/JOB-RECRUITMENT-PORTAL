const mongoose = require('mongoose');

const candidateProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    headline: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    education: [
      {
        degree: { type: String, required: true },
        institution: { type: String, required: true },
        fieldOfStudy: { type: String, default: '' },
        startYear: { type: String, default: '' },
        endYear: { type: String, default: '' },
        grade: { type: String, default: '' },
      },
    ],
    experience: [
      {
        title: { type: String, required: true },
        company: { type: String, required: true },
        location: { type: String, default: '' },
        startDate: { type: String, default: '' },
        endDate: { type: String, default: '' },
        current: { type: Boolean, default: false },
        description: { type: String, default: '' },
        years: { type: Number, default: 1 },
      },
    ],
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    softSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    certifications: [
      {
        name: { type: String, required: true },
        issuer: { type: String, default: '' },
        issueDate: { type: String, default: '' },
        credentialUrl: { type: String, default: '' },
      },
    ],
    projects: [
      {
        title: { type: String, required: true },
        description: { type: String, default: '' },
        technologies: [{ type: String }],
        link: { type: String, default: '' },
      },
    ],
    languages: [
      {
        type: String,
        trim: true,
      },
    ],
    preferredJobRoles: [
      {
        type: String,
        trim: true,
      },
    ],
    preferredLocations: [
      {
        type: String,
        trim: true,
      },
    ],
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      default: null,
    },
    profileCompletion: {
      type: Number,
      default: 20,
    },
  },
  {
    timestamps: true,
  }
);

// Method to calculate profile completion
candidateProfileSchema.methods.calculateCompletion = function () {
  let score = 20; // Base user registered
  if (this.headline) score += 10;
  if (this.education && this.education.length > 0) score += 15;
  if (this.experience && this.experience.length > 0) score += 15;
  if (this.skills && this.skills.length > 0) score += 15;
  if (this.projects && this.projects.length > 0) score += 10;
  if (this.certifications && this.certifications.length > 0) score += 5;
  if (this.resumeId) score += 10;
  return Math.min(score, 100);
};

module.exports = mongoose.model('CandidateProfile', candidateProfileSchema);
