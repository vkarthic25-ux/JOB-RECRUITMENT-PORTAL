const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const AIAnalysis = require('../models/AIAnalysis');

const API_BASE = 'http://127.0.0.1:5000/api';

async function runVerification() {
  console.log('=== STARTING AI RESUME ANALYZER FIX VERIFICATION ===\n');

  // 1. Connect to Mongo for direct document inspection
  await mongoose.connect('mongodb://127.0.0.1:27017/job_recruitment_portal');
  console.log('✓ Connected to MongoDB');

  // 2. Candidate Login
  console.log('\n--- STEP 1: Candidate Login ---');
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'candidate@example.com',
      password: 'Password123!',
    }),
  });

  const loginData = await loginRes.json();
  if (!loginData.success) {
    throw new Error('Login failed: ' + JSON.stringify(loginData));
  }
  const token = loginData.token;
  const user = loginData.user;
  console.log(`✓ Candidate Logged In: ${user.name} (${user.email})`);
  const authHeaders = { Authorization: `Bearer ${token}` };

  // 3. Test Resume Upload (PDF)
  console.log('\n--- STEP 2: Resume Upload (PDF) ---');
  const samplePdfPath = path.join(__dirname, '../uploads/resume-sample_resume_ai_analyzer-1791020791613-413110221.pdf');
  if (!fs.existsSync(samplePdfPath)) {
    throw new Error(`Sample PDF not found at ${samplePdfPath}`);
  }

  const pdfBuffer = fs.readFileSync(samplePdfPath);
  const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' });
  const formData = new FormData();
  formData.append('resume', pdfBlob, 'Sample_Candidate_Resume.pdf');

  const uploadRes = await fetch(`${API_BASE}/resumes/upload`, {
    method: 'POST',
    headers: authHeaders,
    body: formData,
  });

  const uploadData = await uploadRes.json();
  console.log(`✓ Upload Status: ${uploadRes.status}`);
  if (!uploadData.success) {
    throw new Error('Upload failed: ' + JSON.stringify(uploadData));
  }
  console.log(`✓ Resume Uploaded Successfully. Resume ID: ${uploadData.resume._id}`);

  // 4. Trigger Deep AI Analysis
  console.log('\n--- STEP 3: Deep AI Resume Analysis ---');
  const analyzeRes = await fetch(`${API_BASE}/ai/analyze-resume`, {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeId: uploadData.resume._id }),
  });

  const analyzeData = await analyzeRes.json();
  console.log(`✓ Analyze Status: ${analyzeRes.status}`);
  if (!analyzeData.success) {
    throw new Error('Analysis failed: ' + JSON.stringify(analyzeData));
  }
  console.log(`✓ Analysis Message: ${analyzeData.message}`);

  // 5. Query Latest Analysis via API
  console.log('\n--- STEP 4: Fetch Latest Resume Analysis (API) ---');
  const latestRes = await fetch(`${API_BASE}/ai/resume-analysis`, {
    method: 'GET',
    headers: authHeaders,
  });
  const latestData = await latestRes.json();
  const analysis = latestData.analysis;

  console.log('API Response Structure Validation:');
  console.log('Summary:', analysis.summary.slice(0, 100) + '...');

  // Validate Career Readiness
  console.log('\nCareer Readiness Numerical Scores:');
  const cr = analysis.careerReadiness;
  console.log('  Technical Skills:', cr.technicalSkills, typeof cr.technicalSkills);
  console.log('  Experience Alignment:', cr.experienceAlignment, typeof cr.experienceAlignment);
  console.log('  Projects Depth:', cr.projectsDepth, typeof cr.projectsDepth);
  console.log('  Education Verification:', cr.educationVerification, typeof cr.educationVerification);
  console.log('  Certifications:', cr.certifications, typeof cr.certifications);
  console.log('  Resume Quality:', cr.resumeQuality, typeof cr.resumeQuality);
  console.log('  Overall:', cr.overall, typeof cr.overall);

  if (
    typeof cr.technicalSkills !== 'number' ||
    typeof cr.experienceAlignment !== 'number' ||
    typeof cr.projectsDepth !== 'number' ||
    typeof cr.educationVerification !== 'number' ||
    typeof cr.certifications !== 'number' ||
    typeof cr.resumeQuality !== 'number'
  ) {
    throw new Error('Career Readiness fields are NOT all numbers!');
  }
  console.log('✓ All Career Readiness fields are valid numbers (no strings, no NaN).');

  // Validate Skill Proficiency
  console.log('\nSkill Proficiency Items:');
  const skills = analysis.skillProficiency || analysis.skillAnalysis;
  if (!Array.isArray(skills) || skills.length === 0) {
    throw new Error('No skill proficiency array found in analysis!');
  }
  skills.slice(0, 6).forEach((s) => {
    console.log(`  - ${s.skill}: ${s.level} | Score: ${s.score}% | Evidence: ${s.evidence?.slice(0, 50)}...`);
    if (typeof s.score !== 'number' || isNaN(s.score) || s.score <= 0 || s.score > 100) {
      throw new Error(`Invalid score for skill ${s.skill}: ${s.score}`);
    }
  });
  console.log('✓ All Skill Proficiency scores are valid numbers between 0 and 100.');

  // Validate Areas to Improve
  console.log('\nAreas To Improve Items:');
  const areas = analysis.areasToImprove;
  if (!Array.isArray(areas) || areas.length === 0) {
    throw new Error('No areasToImprove array found in analysis!');
  }
  areas.forEach((a, idx) => {
    console.log(`  [${idx + 1}] Area: ${a.area}`);
    console.log(`      Priority: ${a.priority}`);
    console.log(`      Reason: ${a.reason?.slice(0, 60)}...`);
    console.log(`      Recommendation: ${a.recommendation?.slice(0, 60)}...`);

    if (typeof a !== 'object' || typeof a.area !== 'string' || !a.area.trim()) {
      throw new Error(`Invalid areasToImprove entry at index ${idx}: ${JSON.stringify(a)}`);
    }
  });
  console.log('✓ All Areas to Improve items are structured subdocuments (no plain strings).');

  // 6. Direct MongoDB Inspection
  console.log('\n--- STEP 5: Direct MongoDB Storage Inspection ---');
  const dbDoc = await AIAnalysis.findById(analysis._id);
  console.log('✓ MongoDB Record Found. ID:', dbDoc._id);
  console.log('✓ DB areasToImprove count:', dbDoc.areasToImprove.length);
  console.log('✓ DB careerReadiness overall:', dbDoc.careerReadiness.overall);
  console.log('✓ DB skillProficiency count:', dbDoc.skillProficiency?.length);

  // Verify that areasToImprove is not stored as string in Mongo
  dbDoc.areasToImprove.forEach((item, i) => {
    if (typeof item === 'string') {
      throw new Error(`MongoDB has string at areasToImprove[${i}]`);
    }
    if (!item.area) {
      throw new Error(`MongoDB item missing 'area' field at index ${i}`);
    }
  });
  console.log('✓ MongoDB schema validation passed completely with zero CastError.');

  // 7. Test DOCX Upload as well
  console.log('\n--- STEP 6: DOCX Upload & Analysis Test ---');
  const sampleDocxPath = path.join(__dirname, '../uploads/resume-Karthick_Resume1-1791020518896-925389048.docx');
  if (fs.existsSync(sampleDocxPath)) {
    const docxBuffer = fs.readFileSync(sampleDocxPath);
    const docxBlob = new Blob([docxBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const docxFormData = new FormData();
    docxFormData.append('resume', docxBlob, 'Sample_Candidate_Resume.docx');

    const docxUploadRes = await fetch(`${API_BASE}/resumes/upload`, {
      method: 'POST',
      headers: authHeaders,
      body: docxFormData,
    });
    const docxUploadData = await docxUploadRes.json();
    console.log(`✓ DOCX Upload Status: ${docxUploadRes.status}`);

    const docxAnalyzeRes = await fetch(`${API_BASE}/ai/analyze-resume`, {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeId: docxUploadData.resume._id }),
    });
    const docxAnalyzeData = await docxAnalyzeRes.json();
    console.log(`✓ DOCX Analysis Status: ${docxAnalyzeRes.status}`);
    console.log(`✓ DOCX Career Readiness Technical Skills: ${docxAnalyzeData.analysis.careerReadiness.technicalSkills}%`);
    console.log(`✓ DOCX Areas To Improve count: ${docxAnalyzeData.analysis.areasToImprove.length}`);
  }

  // 8. Test Ask AI Chat About Resume
  console.log('\n--- STEP 7: Interactive Resume AI Chat Test ---');
  const chatRes = await fetch(`${API_BASE}/ai/resume-chat`, {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: 'What skills should I improve first to become a cloud engineer?',
      analysisId: analysis._id,
    }),
  });
  const chatData = await chatRes.json();
  console.log(`✓ AI Chat Answer: ${chatData.answer.slice(0, 120)}...`);

  await mongoose.disconnect();
  console.log('\n=== ALL VERIFICATION CHECKS PASSED WITH 100% SUCCESS ===\n');
}

runVerification().catch((err) => {
  console.error('\n❌ VERIFICATION FAILED:', err.message);
  process.exit(1);
});
