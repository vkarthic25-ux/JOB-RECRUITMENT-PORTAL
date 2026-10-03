const mongoose = require('mongoose');

const aiAnalysisSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      default: null,
    },
    summary: {
      type: String,
      default: '',
    },
    careerReadiness: {
      overall: { type: Number, min: 0, max: 100, default: 75 },
      technicalSkills: { type: Number, min: 0, max: 100, default: 75 },
      experienceAlignment: { type: Number, min: 0, max: 100, default: 70 },
      projectsDepth: { type: Number, min: 0, max: 100, default: 80 },
      educationVerification: { type: Number, min: 0, max: 100, default: 85 },
      certifications: { type: Number, min: 0, max: 100, default: 60 },
      resumeQuality: { type: Number, min: 0, max: 100, default: 75 },
      explanation: { type: String, default: '' },
      // Compatibility aliases
      experience: { type: Number, min: 0, max: 100 },
      projects: { type: Number, min: 0, max: 100 },
      education: { type: Number, min: 0, max: 100 },
    },
    skillProficiency: [
      {
        skill: { type: String, required: true },
        level: { type: String, default: 'Intermediate' },
        score: { type: Number, min: 0, max: 100, default: 70 },
        evidence: { type: String, default: '' },
      },
    ],
    skillAnalysis: [
      {
        skill: String,
        level: { type: String, default: 'Intermediate' },
        percentage: { type: Number, min: 0, max: 100, default: 70 },
        score: { type: Number, min: 0, max: 100, default: 70 },
        category: String,
        evidence: String,
      },
    ],
    technicalSkills: {
      programming: [{ type: String }],
      frameworks: [{ type: String }],
      databases: [{ type: String }],
      cloudDevOps: [{ type: String }],
      tools: [{ type: String }],
    },
    softSkills: [{ type: String }],
    strongestSkills: [
      {
        title: String,
        reason: String,
      },
    ],
    areasToImprove: [
      {
        area: { type: String, required: true },
        priority: { type: String, default: 'Medium' },
        reason: { type: String, default: '' },
        recommendation: { type: String, default: '' },
        // Compatibility fields
        skill: String,
        suggestion: String,
        currentEvidence: String,
      },
    ],
    skillsToLearn: {
      highPriority: [
        {
          skill: String,
          whyLearn: String,
          relationToCurrent: String,
          whatToLearnFirst: String,
        },
      ],
      mediumPriority: [
        {
          skill: String,
          whyLearn: String,
          relationToCurrent: String,
          whatToLearnFirst: String,
        },
      ],
      optional: [
        {
          skill: String,
          whyLearn: String,
          relationToCurrent: String,
          whatToLearnFirst: String,
        },
      ],
    },
    skillGaps: {
      currentSkills: [{ type: String }],
      toDevelop: [{ type: String }],
      targetAreas: [{ type: String }],
    },
    careerAreas: [
      {
        area: String,
        reason: String,
        matchFit: String,
      },
    ],
    resumeQuality: [
      {
        item: String,
        status: { type: String, enum: ['Good', 'Needs Improvement'], default: 'Good' },
        feedback: String,
      },
    ],
    missingInformation: [{ type: String }],
    projectAnalysis: [
      {
        projectName: String,
        technologies: [{ type: String }],
        demonstratedSkills: [{ type: String }],
        potentialImprovement: String,
      },
    ],
    certificationAnalysis: {
      detected: [{ type: String }],
      recommendations: [
        {
          current: String,
          potential: String,
          reason: String,
        },
      ],
    },
    learningRoadmap: [
      {
        phase: String,
        title: String,
        topics: [{ type: String }],
        outcome: String,
      },
    ],
    thirtyDayPlan: {
      skills: [{ type: String }],
      practiceTopics: [{ type: String }],
      projectSuggestion: String,
    },
    sixtyDayPlan: {
      skills: [{ type: String }],
      practiceTopics: [{ type: String }],
      projectSuggestion: String,
    },
    ninetyDayPlan: {
      skills: [{ type: String }],
      practiceTopics: [{ type: String }],
      projectSuggestion: String,
    },
    projectRecommendations: [
      {
        title: String,
        description: String,
        skillsLearned: [{ type: String }],
        difficulty: { type: String, default: 'Intermediate' },
        expectedOutcome: String,
      },
    ],
    interviewTopics: [
      {
        category: String,
        topics: [{ type: String }],
      },
    ],
    chatHistory: [
      {
        sender: { type: String, enum: ['user', 'ai'], default: 'user' },
        text: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    // Legacy compatibility fields
    extractedSkills: [{ type: String }],
    matchedSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    matchPercentage: { type: Number, default: 0 },
    skillMatch: { type: Number, default: 0 },
    experienceMatch: { type: Number, default: 0 },
    educationMatch: { type: Number, default: 0 },
    roleMatch: { type: Number, default: 0 },
    eligibility: { type: String, default: 'Eligible' },
    eligibilityReasons: [{ type: String }],
    strengths: [{ type: String }],
    recommendations: [{ type: String }],
    analyzedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AIAnalysis', aiAnalysisSchema);
