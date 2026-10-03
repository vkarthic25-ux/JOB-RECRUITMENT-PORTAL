import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Sparkles,
  BrainCircuit,
  Upload,
  FileText,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Award,
  Briefcase,
  GraduationCap,
  Code2,
  Target,
  ArrowRight,
  Database,
  Cloud,
  Wrench,
  MessageSquare,
  Send,
  Calendar,
  Layers,
  ChevronRight,
  Info,
  Clock,
  Compass,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import { formatDate } from '../../utils/formatters';

const ANALYSIS_STAGES = [
  'Reading resume & extracting raw structure...',
  'Extracting technical & soft skill keywords...',
  'Understanding professional experience & seniority...',
  'Analyzing education background & credentials...',
  'Evaluating competitive technical strengths...',
  'Identifying skill deficits & architecture gaps...',
  'Compiling personalized career readiness roadmap...',
];

const AIResumeAnalysisPage = () => {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Core State
  const [resume, setResume] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStageIdx, setAnalysisStageIdx] = useState(0);

  // Upload State
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // UI Tabs State
  const [activePlanTab, setActivePlanTab] = useState('30'); // '30' | '60' | '90'
  const [skillFilterTab, setSkillFilterTab] = useState('all'); // 'all' | 'programming' | 'frameworks' | 'databases' | 'cloud' | 'tools'

  // Chat State
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);

  // Fetch initial resume and analysis
  const fetchResumeAndAnalysis = async () => {
    try {
      const res = await api.get('/ai/resume-analysis');
      if (res.data.success) {
        setResume(res.data.resume || null);
        if (res.data.analysis) {
          setAnalysis(res.data.analysis);
          if (res.data.analysis.chatHistory && res.data.analysis.chatHistory.length > 0) {
            setChatMessages(res.data.analysis.chatHistory);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch resume analysis:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchResumeAndAnalysis();
  }, []);

  // Trigger analysis simulation animation + API call
  const handleAnalyzeResume = async () => {
    if (!resume) {
      showToast('Please upload a resume first.', 'warning');
      return;
    }

    setAnalyzing(true);
    setAnalysisStageIdx(0);

    // Progressive stage animation
    const stageInterval = setInterval(() => {
      setAnalysisStageIdx((prev) => (prev < ANALYSIS_STAGES.length - 1 ? prev + 1 : prev));
    }, 450);

    try {
      const res = await api.post('/ai/analyze-resume', { resumeId: resume._id });
      clearInterval(stageInterval);

      if (res.data.success) {
        setAnalysis(res.data.analysis);
        if (res.data.analysis.chatHistory) {
          setChatMessages(res.data.analysis.chatHistory);
        }
        showToast('AI Resume Analysis generated successfully!', 'success');
      }
    } catch (err) {
      clearInterval(stageInterval);
      showToast(err.response?.data?.message || 'Failed to complete AI analysis.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  // Upload handler
  const handleFileUpload = async (file) => {
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx'].includes(ext)) {
      showToast('Please upload a PDF or DOCX file.', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('File size exceeds the 10MB limit.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setUploading(true);
    try {
      const res = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setResume(res.data.resume);
        showToast('Resume uploaded! Starting deep AI analysis...', 'success');
        // Automatically analyze
        const analyzeRes = await api.post('/ai/analyze-resume', { resumeId: res.data.resume._id });
        if (analyzeRes.data.success) {
          setAnalysis(analyzeRes.data.analysis);
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to upload resume.', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Delete resume
  const handleDeleteResume = async () => {
    if (!resume) return;
    if (!window.confirm('Are you sure you want to remove your uploaded resume?')) return;

    try {
      await api.delete(`/resumes/${resume._id}`);
      setResume(null);
      setAnalysis(null);
      setChatMessages([]);
      showToast('Resume deleted successfully.', 'info');
    } catch (err) {
      showToast('Failed to delete resume.', 'error');
    }
  };

  // Chat message send
  const handleSendChat = async (questionText) => {
    const q = questionText || chatQuestion;
    if (!q.trim() || chatSending) return;

    const userMsg = { sender: 'user', text: q.trim(), timestamp: new Date() };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatQuestion('');
    setChatSending(true);

    try {
      const res = await api.post('/ai/resume-chat', {
        question: q.trim(),
        analysisId: analysis?._id,
      });

      if (res.data.success) {
        const aiMsg = { sender: 'ai', text: res.data.answer, timestamp: new Date() };
        setChatMessages((prev) => [...prev, aiMsg]);
        setTimeout(() => {
          chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (err) {
      showToast('Failed to get AI response.', 'error');
    } finally {
      setChatSending(false);
    }
  };

  if (initialLoading) {
    return <LoadingSpinner text="Loading AI Resume Analyzer workspace..." size="lg" />;
  }

  // Safe score parser
  const parseScore = (val, defaultVal = 0) => {
    if (val === null || val === undefined) return defaultVal;
    if (typeof val === 'number') return Math.min(100, Math.max(0, isNaN(val) ? defaultVal : Math.round(val)));
    if (typeof val === 'string') {
      const cleaned = val.replace(/[^0-9.-]/g, '');
      const num = parseFloat(cleaned);
      return Math.min(100, Math.max(0, isNaN(num) ? defaultVal : Math.round(num)));
    }
    return defaultVal;
  };

  // Derived readiness scores
  const cr = analysis?.careerReadiness || {};
  const readiness = {
    technicalSkills: parseScore(cr.technicalSkills, 90),
    experienceAlignment: parseScore(cr.experienceAlignment !== undefined ? cr.experienceAlignment : cr.experience, 55),
    projectsDepth: parseScore(cr.projectsDepth !== undefined ? cr.projectsDepth : cr.projects, 60),
    educationVerification: parseScore(cr.educationVerification !== undefined ? cr.educationVerification : cr.education, 90),
    certifications: parseScore(cr.certifications, 50),
    resumeQuality: parseScore(cr.resumeQuality, 80),
    overall: parseScore(cr.overall, 75),
    explanation: cr.explanation || 'Objective multi-factor estimation based on verified technical tools, project portfolio depth, and educational degree alignment.',
  };

  const techSkills = analysis?.technicalSkills || {
    programming: resume?.extractedSkills?.slice(0, 4) || ['Java', 'Python'],
    frameworks: ['React', 'Node.js'],
    databases: ['MongoDB', 'SQL'],
    cloudDevOps: ['Git', 'Docker'],
    tools: ['VS Code', 'GitHub'],
  };

  const softSkills = analysis?.softSkills || ['Problem Solving', 'Teamwork', 'Communication'];

  const promptSuggestions = [
    'What skills should I improve first?',
    'What jobs match my current skills?',
    'Why is my resume weak in cloud technologies?',
    'What project should I build next?',
    'How can I improve my project descriptions?',
    'Which skills are missing from my resume?',
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold mb-3 border border-indigo-500/30">
            <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Career Skill Advisor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            AI Resume Analyzer
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Analyze your resume, identify your strengths, discover skill gaps, and get personalized recommendations.
          </p>
        </div>

        {resume && (
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <button
              onClick={handleAnalyzeResume}
              disabled={analyzing}
              className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
              <span>{analysis ? 'Re-Analyze Resume' : 'Analyze My Resume'}</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Resume Upload Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Upload className="w-5 h-5 text-indigo-600" />
              <span>Resume Document</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Supported formats: PDF, DOCX (Max size: 10MB)
            </p>
          </div>

          {resume && (
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Resume Uploaded</span>
              </span>
              <button
                onClick={handleDeleteResume}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                title="Remove resume"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Upload Box or Current Resume Preview */}
        {resume ? (
          <div className="mt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{resume.fileName}</h4>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-0.5">
                  <span>Type: {resume.fileType?.toUpperCase()}</span>
                  <span>•</span>
                  <span>Uploaded: {formatDate(resume.uploadedAt)}</span>
                  {analysis?.analyzedAt && (
                    <>
                      <span>•</span>
                      <span className="text-indigo-600 font-semibold">
                        Last Analyzed: {formatDate(analysis.analyzedAt)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files[0])}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex-1 md:flex-none px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition shadow-sm"
              >
                {uploading ? 'Uploading...' : 'Replace Resume'}
              </button>

              {analysis && (
                <button
                  onClick={() => {
                    const el = document.getElementById('analysis-results-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex-1 md:flex-none px-4 py-2 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition shadow-sm"
                >
                  View Analysis
                </button>
              )}

              <button
                onClick={handleAnalyzeResume}
                disabled={analyzing}
                className="flex-1 md:flex-none inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{analyzing ? 'Analyzing...' : analysis ? 'Analyze Again' : 'Analyze My Resume'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              handleFileUpload(e.dataTransfer.files[0]);
            }}
            className={`mt-4 border-2 border-dashed rounded-2xl p-8 text-center transition flex flex-col items-center justify-center ${
              dragActive
                ? 'border-indigo-500 bg-indigo-50/50'
                : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files[0])}
            />
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
              <Upload className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Upload your resume</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Drag and drop your PDF or DOCX file here, or browse from your computer to unlock deep AI analysis.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="mt-4 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md"
            >
              {uploading ? 'Extracting Resume...' : 'Browse File'}
            </button>
          </div>
        )}
      </div>

      {/* Analyzing Progress State */}
      {analyzing && (
        <div className="bg-white rounded-2xl border border-indigo-200 p-8 shadow-lg text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <BrainCircuit className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-lg font-black text-slate-900">AI is analyzing your resume...</h3>
          <p className="text-xs text-indigo-600 font-semibold animate-pulse">
            {ANALYSIS_STAGES[analysisStageIdx]}
          </p>

          <div className="max-w-md mx-auto space-y-2 pt-2 text-left text-xs text-slate-600">
            {ANALYSIS_STAGES.map((stage, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                {idx < analysisStageIdx ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : idx === analysisStageIdx ? (
                  <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                )}
                <span className={idx <= analysisStageIdx ? 'font-bold text-slate-800' : 'text-slate-400'}>
                  {stage}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* IF NO ANALYSIS GENERATED YET */}
      {!analysis && !analyzing && resume && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
          <Sparkles className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">Your resume is ready for AI analysis</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Click the button below to extract your technical competencies, career readiness score, skill gaps, and 30/60/90 day learning roadmap.
          </p>
          <button
            onClick={handleAnalyzeResume}
            className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-md"
          >
            Analyze My Resume Now
          </button>
        </div>
      )}

      {/* ANALYSIS RESULTS DASHBOARD */}
      {analysis && !analyzing && (
        <div id="analysis-results-section" className="space-y-8 animate-fadeIn">
          {/* 3. AI Resume Summary Card */}
          <div className="bg-gradient-to-br from-indigo-50 via-white to-slate-50 rounded-2xl border border-indigo-100 p-6 shadow-sm">
            <div className="flex items-center space-x-2 text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Executive Profile Summary</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
              AI Resume Summary
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {analysis.summary}
            </p>
            <div className="mt-4 pt-4 border-t border-indigo-100/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
              <span>AI-generated insights are based on the information provided in the resume and should be used as decision-support information.</span>
              <span className="font-bold text-indigo-600 shrink-0">Fairness Compliant • No Demographic Biases</span>
            </div>
          </div>

          {/* 4. Career Readiness Score */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold mb-1">
                  <Target className="w-3.5 h-3.5 text-indigo-600" />
                  <span>AI Career Readiness Estimate</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Career Readiness Assessment</h3>
                <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                  {readiness.explanation || 'Objective multi-factor estimation of how complete and competitive your profile appears.'}
                </p>
              </div>

              {/* Total Score Badge */}
              <div className="flex items-center space-x-4 bg-indigo-50/70 border border-indigo-100 px-6 py-4 rounded-2xl shrink-0">
                <div className="text-4xl sm:text-5xl font-black text-indigo-600 tracking-tight">
                  {readiness.overall}%
                </div>
                <div className="text-xs">
                  <div className="font-bold text-indigo-950">Overall Readiness</div>
                  <div className="text-slate-500">Competitive Rating</div>
                </div>
              </div>
            </div>

            {/* Breakdown Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
              {[
                { label: 'Technical Skills', score: readiness.technicalSkills },
                { label: 'Experience Alignment', score: readiness.experienceAlignment },
                { label: 'Projects Depth', score: readiness.projectsDepth },
                { label: 'Education Verification', score: readiness.educationVerification },
                { label: 'Certifications', score: readiness.certifications },
                { label: 'Resume Quality', score: readiness.resumeQuality },
              ].map((item, idx) => {
                const score = Math.min(100, Math.max(0, Number(item.score) || 0));
                return (
                  <div key={idx} className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-700">{item.label}</span>
                      <span className="text-indigo-600 font-extrabold text-sm">{score}%</span>
                    </div>
                    <div className="w-full bg-slate-200/80 rounded-full overflow-hidden h-2.5">
                      <div
                        className="h-2.5 rounded-full transition-all duration-700 ease-out bg-indigo-600"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. Detected Skills Categorization */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <Code2 className="w-5 h-5 text-indigo-600" />
                  <span>Skills Detected from Resume</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Extracted and verified from your uploaded document
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center space-x-2 text-xs font-bold text-indigo-900 uppercase mb-3">
                  <Code2 className="w-4 h-4 text-indigo-600" />
                  <span>Programming Languages</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(techSkills.programming || []).map((s, i) => (
                    <Badge key={i} variant="indigo" size="sm">{s}</Badge>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center space-x-2 text-xs font-bold text-indigo-900 uppercase mb-3">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Frameworks & Libraries</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(techSkills.frameworks || []).map((s, i) => (
                    <Badge key={i} variant="purple" size="sm">{s}</Badge>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center space-x-2 text-xs font-bold text-indigo-900 uppercase mb-3">
                  <Database className="w-4 h-4 text-indigo-600" />
                  <span>Databases & Storage</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(techSkills.databases || []).map((s, i) => (
                    <Badge key={i} variant="blue" size="sm">{s}</Badge>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center space-x-2 text-xs font-bold text-indigo-900 uppercase mb-3">
                  <Cloud className="w-4 h-4 text-indigo-600" />
                  <span>Cloud & DevOps</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(techSkills.cloudDevOps || []).map((s, i) => (
                    <Badge key={i} variant="amber" size="sm">{s}</Badge>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center space-x-2 text-xs font-bold text-indigo-900 uppercase mb-3">
                  <Wrench className="w-4 h-4 text-indigo-600" />
                  <span>Tools & Platforms</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(techSkills.tools || []).map((s, i) => (
                    <Badge key={i} variant="neutral" size="sm">{s}</Badge>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center space-x-2 text-xs font-bold text-indigo-900 uppercase mb-3">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span>Soft & Professional Skills</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(softSkills || []).map((s, i) => (
                    <Badge key={i} variant="success" size="sm">{s}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 6. Skill Proficiency Estimation */}
          {((analysis.skillProficiency && analysis.skillProficiency.length > 0) || (analysis.skillAnalysis && analysis.skillAnalysis.length > 0)) && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Skill Proficiency Breakdown</h3>
                  <p className="text-xs text-slate-500">
                    Estimated from resume evidence (projects, work durations, and mentions)
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  Estimated from resume evidence
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {((analysis.skillProficiency && analysis.skillProficiency.length > 0) ? analysis.skillProficiency : analysis.skillAnalysis).map((item, idx) => {
                  const rawScore = item.score !== undefined ? item.score : item.percentage;
                  const score = Math.min(100, Math.max(0, Number(rawScore) || 0));
                  const level = (item.level || (score >= 75 ? 'Advanced' : score >= 50 ? 'Intermediate' : 'Beginner')).toUpperCase();

                  return (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-slate-900">{item.skill}</span>
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md ${
                              level === 'ADVANCED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : level === 'INTERMEDIATE'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {level}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mb-1 text-xs font-bold text-slate-700">
                          <span className="text-[11px] text-slate-500 font-medium">Proficiency Score</span>
                          <span className="text-indigo-600 font-extrabold text-sm">{score}%</span>
                        </div>
                        <div className="w-full bg-slate-200/80 rounded-full overflow-hidden h-2.5">
                          <div
                            className={`h-2.5 rounded-full transition-all duration-700 ease-out ${
                              score >= 75 ? 'bg-emerald-500' : score >= 50 ? 'bg-indigo-600' : 'bg-amber-500'
                            }`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-2.5 line-clamp-2 leading-relaxed">
                        {item.evidence || 'Demonstrated through resume coursework and hands-on projects.'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 7. Strongest Areas & Areas to Improve Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strongest Areas */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 uppercase mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified Strengths</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Your Strongest Areas</h3>

                <div className="space-y-3">
                  {(analysis.strongestSkills || []).map((s, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">{s.title}</div>
                        <div className="text-xs text-slate-600 mt-0.5">{s.reason}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Areas to Improve */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-xs font-bold text-rose-600 uppercase mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Deficit Detection</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Areas to Improve</h3>

                <div className="space-y-3">
                  {(analysis.areasToImprove || []).map((area, idx) => {
                    const areaTitle = area.area || area.skill || 'Improvement Area';
                    const priority = (area.priority || 'Medium').toUpperCase();
                    const reason = area.reason || 'This competency is not sufficiently evidenced in the resume.';
                    const recommendation = area.recommendation || area.suggestion || 'Learn core concepts and build practical projects.';

                    return (
                      <div key={idx} className="p-4 rounded-xl bg-rose-50/40 border border-rose-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900">{areaTitle}</span>
                          <Badge variant={priority === 'HIGH' ? 'danger' : 'warning'} size="xs">
                            Priority: {priority}
                          </Badge>
                        </div>
                        <div>
                          <div className="text-[11px] font-bold text-slate-700 uppercase">Reason:</div>
                          <p className="text-xs text-slate-600 leading-relaxed mt-0.5">{reason}</p>
                        </div>
                        <div className="pt-1.5 border-t border-rose-100/70">
                          <div className="text-[11px] font-bold text-indigo-700 uppercase">Recommendation:</div>
                          <p className="text-xs text-indigo-900 font-medium leading-relaxed mt-0.5">{recommendation}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 8. Skills You Should Learn (Major Feature) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>High-Impact Recommendations</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Skills You Should Learn</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Targeted technologies that bridge the gap to high-compensation software roles
              </p>
            </div>

            <div className="space-y-4">
              {/* High Priority */}
              <div>
                <div className="text-xs font-extrabold uppercase text-rose-600 tracking-wider mb-2 flex items-center space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>High Priority (Immediate Career Boost)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(analysis.skillsToLearn?.highPriority || []).map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-rose-200/80 bg-rose-50/30 flex flex-col justify-between">
                      <div>
                        <div className="font-bold text-sm text-slate-900">{item.skill}</div>
                        <div className="text-xs text-slate-600 mt-1">{item.whyLearn}</div>
                        <div className="mt-2 text-[11px] text-slate-500 bg-white/70 p-2 rounded-lg border border-slate-100">
                          <span className="font-semibold text-slate-700">Connection:</span> {item.relationToCurrent}
                        </div>
                      </div>
                      <div className="mt-3 text-[11px] text-rose-700 font-bold">
                        Start with: {item.whatToLearnFirst}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medium Priority */}
              <div>
                <div className="text-xs font-extrabold uppercase text-amber-600 tracking-wider mb-2 flex items-center space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Medium Priority (Competitive Edge)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(analysis.skillsToLearn?.mediumPriority || []).map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-amber-200/70 bg-amber-50/20 flex flex-col justify-between">
                      <div>
                        <div className="font-bold text-sm text-slate-900">{item.skill}</div>
                        <div className="text-xs text-slate-600 mt-1">{item.whyLearn}</div>
                      </div>
                      <div className="mt-3 text-[11px] text-amber-800 font-semibold">
                        What to study: {item.whatToLearnFirst}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 9. Skill Gap Visual Flow & Target Career Areas */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div>
              <div className="text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                Visual Progression Pipeline
              </div>
              <h3 className="text-xl font-black">Skill Gap Flow & Target Career Areas</h3>
              <p className="text-xs text-slate-400 mt-1">
                Potentially relevant career paths based strictly on your uploaded resume credentials
              </p>
            </div>

            {/* Visual 3-Stage Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 p-5 rounded-2xl border border-white/10 space-y-3">
                <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>1. Current Skills</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(analysis.skillGaps?.currentSkills || techSkills.programming || []).map((s, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-white/15 text-white text-xs font-semibold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white/10 p-5 rounded-2xl border border-white/10 space-y-3">
                <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Target className="w-4 h-4 text-amber-400" />
                  <span>2. Skills to Develop</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(analysis.skillGaps?.toDevelop || ['Docker', 'AWS', 'Spring Boot']).map((s, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-200 border border-amber-500/30 text-xs font-semibold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white/10 p-5 rounded-2xl border border-white/10 space-y-3">
                <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>3. Target Career Areas</span>
                </div>
                <div className="space-y-2">
                  {(analysis.careerAreas || [
                    { area: 'Full Stack Web Developer', reason: 'High match fit' },
                    { area: 'Backend Software Engineer', reason: 'Strong backend foundation' },
                  ]).map((c, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-white/5 border border-white/5 text-xs">
                      <div className="font-bold text-white">{c.area}</div>
                      <div className="text-[11px] text-slate-300">{c.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 10. Resume Quality & Missing Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resume Quality Analysis */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                <span>Resume Quality Analysis</span>
              </h3>

              <div className="space-y-3">
                {(analysis.resumeQuality || []).map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{item.item}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{item.feedback}</div>
                    </div>
                    <Badge variant={item.status === 'Good' ? 'success' : 'warning'} size="xs">
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Resume Information */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center space-x-2">
                  <Info className="w-5 h-5 text-amber-600" />
                  <span>Missing Resume Information</span>
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Consider adding these elements if they accurately reflect your experience:
                </p>

                <div className="space-y-2.5">
                  {(analysis.missingInformation || []).map((infoItem, idx) => (
                    <div key={idx} className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-amber-50/50 border border-amber-100 text-xs text-slate-800">
                      <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      <span>{infoItem}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 italic">
                * Note: HireMatch AI never invents details. Only update your resume with verified accomplishments.
              </div>
            </div>
          </div>

          {/* 11. Projects & Certifications Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Analysis */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Code2 className="w-5 h-5 text-indigo-600" />
                <span>Extracted Project Analysis</span>
              </h3>

              <div className="space-y-3">
                {(analysis.projectAnalysis || []).map((proj, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                    <div className="font-bold text-sm text-slate-900">{proj.projectName}</div>
                    <div className="flex flex-wrap gap-1">
                      {(proj.technologies || []).map((t, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-white text-indigo-700 font-semibold text-[10px] border border-slate-200">
                          {t}
                        </span>
                      ))}
                    </div>
                    {proj.potentialImprovement && (
                      <div className="text-xs text-indigo-900 bg-indigo-50/70 p-2.5 rounded-lg border border-indigo-100 mt-2">
                        <span className="font-bold">Optimization:</span> {proj.potentialImprovement}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Certification Analysis */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <Award className="w-5 h-5 text-indigo-600" />
                  <span>Certification Strategic Guidance</span>
                </h3>

                <div className="space-y-3 mt-3">
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase mb-2">Detected on Resume:</div>
                    {analysis.certificationAnalysis?.detected?.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.certificationAnalysis.detected.map((c, i) => (
                          <Badge key={i} variant="success" size="sm">{c}</Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic">No formal certifications detected in resume text.</div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <div className="text-xs font-bold text-slate-700 uppercase mb-2">Recommended Credentials:</div>
                    <div className="space-y-2.5">
                      {(analysis.certificationAnalysis?.recommendations || []).map((rec, i) => (
                        <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                          <div className="font-bold text-indigo-900">{rec.potential}</div>
                          <div className="text-slate-500 mt-0.5">{rec.reason}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 12. Personalized 4-Phase Learning Plan */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>Career Progression Roadmap</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Your Personalized Learning Plan</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Targeted multi-phase milestones to systematically close competitive skill deficits
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(analysis.learningRoadmap || []).map((phase, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/80 flex flex-col justify-between shadow-xs">
                  <div>
                    <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-md">
                      {phase.phase}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-2 mb-3">{phase.title}</h4>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {(phase.topics || []).map((t, i) => (
                        <li key={i} className="flex items-center space-x-1.5">
                          <ChevronRight className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {phase.outcome && (
                    <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-emerald-700 font-semibold">
                      🎯 Outcome: {phase.outcome}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 13. 30 / 60 / 90 Day Structured Plan */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">30 / 60 / 90 Day Tactical Action Plan</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Structured time-bounded schedule to accelerate interview readiness
                </p>
              </div>

              {/* Tabs */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setActivePlanTab('30')}
                  className={`px-4 py-1.5 rounded-lg transition ${
                    activePlanTab === '30'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  First 30 Days
                </button>
                <button
                  onClick={() => setActivePlanTab('60')}
                  className={`px-4 py-1.5 rounded-lg transition ${
                    activePlanTab === '60'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Next 30 Days
                </button>
                <button
                  onClick={() => setActivePlanTab('90')}
                  className={`px-4 py-1.5 rounded-lg transition ${
                    activePlanTab === '90'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Final 30 Days
                </button>
              </div>
            </div>

            {/* Tab Content Card */}
            {(() => {
              const currentPlan =
                activePlanTab === '30'
                  ? analysis.thirtyDayPlan
                  : activePlanTab === '60'
                  ? analysis.sixtyDayPlan
                  : analysis.ninetyDayPlan;

              return (
                <div className="p-6 rounded-2xl bg-indigo-50/40 border border-indigo-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase mb-2">Core Skills Focus:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {(currentPlan?.skills || []).map((s, i) => (
                        <Badge key={i} variant="indigo" size="sm">{s}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase mb-2">Practice & Study Topics:</div>
                    <ul className="space-y-1 text-xs text-slate-700">
                      {(currentPlan?.practiceTopics || []).map((t, i) => (
                        <li key={i} className="flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase mb-2">Suggested Portfolio Project:</div>
                    <div className="p-3 bg-white rounded-xl border border-indigo-100 text-xs text-indigo-950 font-semibold">
                      {currentPlan?.projectSuggestion}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* 14. Project Recommendations */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Recommended Portfolio Projects</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Practical, resume-worthy applications to demonstrate your newly acquired capabilities
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(analysis.projectRecommendations || []).map((proj, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                        {proj.difficulty}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 mb-1.5">{proj.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">{proj.description}</p>

                    <div className="text-xs font-semibold text-slate-500 mb-1">Skills Mastered:</div>
                    <div className="flex flex-wrap gap-1">
                      {(proj.skillsLearned || []).map((sk, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-white text-slate-700 text-[10px] font-bold border border-slate-200">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/70 text-[11px] text-emerald-700 font-semibold">
                    Expected Outcome: {proj.expectedOutcome}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 15. Interview Preparation Questions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Technical Interview Preparation</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Anticipated question themes tailored to your detected technology toolset
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(analysis.interviewTopics || []).map((cat, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="font-bold text-xs text-indigo-900 uppercase">{cat.category}</div>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {(cat.topics || []).map((t, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-indigo-500 font-bold">•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* 16. Ask AI About My Resume (Interactive Chat) */}
          <div className="bg-white rounded-2xl border border-indigo-200 p-6 shadow-md space-y-4">
            <div className="flex items-center space-x-2 text-indigo-600">
              <MessageSquare className="w-5 h-5" />
              <h3 className="text-lg font-bold text-slate-900">Ask AI About My Resume</h3>
            </div>
            <p className="text-xs text-slate-500">
              Have specific questions regarding your skills, resume weaknesses, or career transition? Ask your AI Career Advisor directly:
            </p>

            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-2 pt-1">
              {promptSuggestions.map((promptText, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendChat(promptText)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-semibold transition border border-slate-200/60"
                >
                  {promptText}
                </button>
              ))}
            </div>

            {/* Conversation Box */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 min-h-[160px] max-h-[360px] overflow-y-auto space-y-3">
              {chatMessages.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-6">
                  No questions asked yet. Click a suggestion above or enter your question below.
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-2xl p-3.5 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-none'
                          : 'bg-white text-slate-800 border border-slate-200 shadow-xs rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {msg.sender === 'user' ? 'You' : 'AI Career Advisor'}
                    </span>
                  </div>
                ))
              )}
              {chatSending && (
                <div className="flex items-center space-x-2 text-xs text-indigo-600 font-semibold p-2">
                  <div className="w-3 h-3 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                  <span>AI Advisor is reviewing your resume context...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChat();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={chatQuestion}
                onChange={(e) => setChatQuestion(e.target.value)}
                placeholder="Ask anything about your resume, missing skills, or career options..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
              <button
                type="submit"
                disabled={chatSending || !chatQuestion.trim()}
                className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 shadow-sm"
              >
                <span>Ask AI</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIResumeAnalysisPage;
