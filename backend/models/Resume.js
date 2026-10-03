const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'docx', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      required: true,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    extractedText: {
      type: String,
      default: '',
    },
    extractedSkills: [
      {
        type: String,
      },
    ],
    softSkills: [
      {
        type: String,
      },
    ],
    education: [
      {
        degree: String,
        institution: String,
        year: String,
      },
    ],
    experience: [
      {
        title: String,
        company: String,
        duration: String,
        description: String,
      },
    ],
    projects: [
      {
        title: String,
        description: String,
        technologies: [String],
      },
    ],
    certifications: [
      {
        name: String,
        issuer: String,
      },
    ],
    languages: [
      {
        type: String,
      },
    ],
    parsedData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Resume', resumeSchema);
