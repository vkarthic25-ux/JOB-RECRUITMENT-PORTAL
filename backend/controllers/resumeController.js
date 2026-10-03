const path = require('path');
const fs = require('fs');
const Resume = require('../models/Resume');
const CandidateProfile = require('../models/CandidateProfile');
const AIAnalysis = require('../models/AIAnalysis');
const { extractTextFromPDF } = require('../utils/pdfParser');
const { extractTextFromDOCX } = require('../utils/docxParser');
const aiService = require('../services/aiService');
const { normalizeAreasToImprove } = require('../utils/aiNormalizer');

// @desc    Upload and parse resume (PDF or DOCX)
// @route   POST /api/resumes/upload
// @access  Private (Candidate)
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a resume file (PDF or DOCX).' });
    }

    const candidateId = req.user._id;
    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();

    // 1. Extract text
    let extractedText = '';
    if (fileExt === '.pdf') {
      extractedText = await extractTextFromPDF(filePath);
    } else if (fileExt === '.docx' || fileExt === '.doc') {
      extractedText = await extractTextFromDOCX(filePath);
    }

    // 2. AI & Structured Analysis
    const analysis = await aiService.analyzeResume(extractedText);

    // 3. Save Resume record
    const resume = await Resume.create({
      candidateId,
      fileName: req.file.originalname,
      filePath: `/uploads/${req.file.filename}`,
      fileType: fileExt.replace('.', ''),
      fileSize: req.file.size,
      extractedText: extractedText.slice(0, 15000),
      extractedSkills: analysis.skills || [],
      softSkills: analysis.softSkills || [],
      education: analysis.education || [],
      experience: analysis.experience || [],
      projects: analysis.projects || [],
      certifications: analysis.certifications || [],
      languages: analysis.languages || [],
      parsedData: analysis,
    });

    // 4. Update candidate profile automatically
    let profile = await CandidateProfile.findOne({ userId: candidateId });
    if (!profile) {
      profile = new CandidateProfile({ userId: candidateId });
    }

    profile.resumeId = resume._id;
    if (analysis.headline && (!profile.headline || profile.headline === 'Aspiring Professional')) {
      profile.headline = analysis.headline;
    }
    if (analysis.skills && analysis.skills.length > 0) {
      profile.skills = Array.from(new Set([...profile.skills, ...analysis.skills]));
    }
    if (analysis.softSkills && analysis.softSkills.length > 0) {
      profile.softSkills = Array.from(new Set([...profile.softSkills, ...analysis.softSkills]));
    }
    if ((!profile.education || profile.education.length === 0) && analysis.education.length > 0) {
      profile.education = analysis.education.map(e => ({
        degree: e.degree || 'Degree',
        institution: e.institution || 'University',
        startYear: '2020',
        endYear: e.year || '2024',
      }));
    }
    if ((!profile.experience || profile.experience.length === 0) && analysis.experience.length > 0) {
      profile.experience = analysis.experience.map(e => ({
        title: e.title || 'Developer',
        company: e.company || 'Company',
        description: e.description || '',
        years: 1,
      }));
    }
    if ((!profile.projects || profile.projects.length === 0) && analysis.projects.length > 0) {
      profile.projects = analysis.projects;
    }

    profile.profileCompletion = profile.calculateCompletion();
    await profile.save();

    // 5. Store Standalone AIAnalysis record for reference (guaranteed normalized)
    const normalizedAreas = normalizeAreasToImprove(analysis.areasToImprove);
    const savedAnalysis = await AIAnalysis.findOneAndUpdate(
      { candidateId, resumeId: resume._id, jobId: null },
      {
        candidateId,
        resumeId: resume._id,
        jobId: null,
        extractedSkills: analysis.skills,
        summary: analysis.summary,
        strengths: analysis.strengths,
        areasToImprove: normalizedAreas,
        recommendations: analysis.strengths || [],
        analyzedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({
      success: true,
      message: 'Resume uploaded and analyzed successfully!',
      resume,
      analysis: savedAnalysis,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get candidate's current resume
// @route   GET /api/resumes/current
// @access  Private (Candidate / Recruiter)
const getCandidateResume = async (req, res, next) => {
  try {
    const candidateId = req.query.candidateId || req.user._id;
    const resume = await Resume.findOne({ candidateId }).sort('-uploadedAt');

    if (!resume) {
      return res.status(404).json({ success: false, message: 'No resume found.' });
    }

    res.json({ success: true, resume });
  } catch (error) {
    next(error);
  }
};

// @desc    Get resume by ID
// @route   GET /api/resumes/:id
// @access  Private
const getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }
    res.json({ success: true, resume });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete resume
// @route   DELETE /api/resumes/:id
// @access  Private (Candidate)
const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    if (resume.candidateId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this resume.' });
    }

    // Try deleting physical file
    const absolutePath = path.join(__dirname, '..', resume.filePath);
    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
      } catch (e) {
        console.warn('Could not remove file from disk:', e.message);
      }
    }

    await Resume.findByIdAndDelete(req.params.id);

    // Reset profile link
    await CandidateProfile.updateOne(
      { userId: resume.candidateId },
      { $unset: { resumeId: 1 } }
    );

    res.json({ success: true, message: 'Resume removed successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Re-analyze existing resume
// @route   POST /api/resumes/:id/analyze
// @access  Private
const reAnalyzeResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    const analysis = await aiService.analyzeResume(resume.extractedText);
    resume.extractedSkills = analysis.skills || resume.extractedSkills;
    resume.softSkills = analysis.softSkills || resume.softSkills;
    resume.parsedData = analysis;
    await resume.save();

    res.json({
      success: true,
      message: 'Resume re-analyzed successfully.',
      analysis,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadResume,
  getCandidateResume,
  getResumeById,
  deleteResume,
  reAnalyzeResume,
};
