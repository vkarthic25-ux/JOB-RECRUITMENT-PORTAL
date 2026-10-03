import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Target, BookOpen, CheckCircle, AlertTriangle, ArrowRight, Code2, Sparkles } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const SkillGapAnalysisPage = () => {
  const [searchParams] = useSearchParams();
  const initialJobId = searchParams.get('jobId');

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(initialJobId || '');
  const [gapData, setGapData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load candidate jobs list to allow picking which job to analyze gaps for
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/jobs');
        if (res.data.success && res.data.jobs.length > 0) {
          setJobs(res.data.jobs);
          if (!selectedJobId) {
            setSelectedJobId(res.data.jobs[0]._id);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    if (!selectedJobId) return;

    const analyzeGaps = async () => {
      setLoading(true);
      try {
        const res = await api.post('/ai/skill-gap', { jobId: selectedJobId });
        if (res.data.success) {
          setGapData(res.data);
        }
      } catch (err) {
        console.error('Failed to analyze skill gap:', err);
      } finally {
        setLoading(false);
      }
    };
    analyzeGaps();
  }, [selectedJobId]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 border border-amber-200/80 p-6 sm:p-8 rounded-3xl space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
          <Target className="w-3.5 h-3.5 text-amber-700" />
          <span>AI Upskilling Diagnostic</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          AI Skill Gap Analysis
        </h2>
        <p className="text-xs sm:text-sm text-slate-600">
          Compare your active profile skills directly against market job requirements to identify missing capabilities.
        </p>

        {/* Job Selector Dropdown */}
        <div className="pt-4 max-w-md">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Select Target Position to Evaluate:
          </label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 shadow-sm"
          >
            {jobs.map((job) => (
              <option key={job._id} value={job._id}>
                {job.title} ({job.companyId?.name || 'Company'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Analyzing target skill matrices..." size="lg" />
      ) : gapData ? (
        <div className="space-y-6">
          {/* Matched vs Missing Skills overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center text-emerald-800">
                <CheckCircle className="w-4 h-4 text-emerald-600 mr-1.5" />
                Matched Skills ({gapData.gapAnalysis.matchedSkills?.length || 0})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {gapData.gapAnalysis.matchedSkills?.length > 0 ? (
                  gapData.gapAnalysis.matchedSkills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200"
                    >
                      ✓ {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No overlap detected yet</span>
                )}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 mr-1.5" />
                Missing Required Skills ({gapData.gapAnalysis.missingSkills?.length || 0})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {gapData.gapAnalysis.missingSkills?.length > 0 ? (
                  gapData.gapAnalysis.missingSkills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-lg border border-amber-200"
                    >
                      + {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-emerald-600 font-bold">100% Core Skill Coverage!</span>
                )}
              </div>
            </div>
          </div>

          {/* Deep dive breakdown for each missing skill */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Detailed Skill Acquisition Guidelines
              </h3>
              <Link
                to={`/candidate/learning-roadmap?jobId=${selectedJobId}`}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition flex items-center shadow-sm"
              >
                <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Launch Personalized Roadmap
              </Link>
            </div>

            {gapData.gapAnalysis.skillGaps?.map((gap, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <h4 className="text-base font-bold text-slate-900">{gap.skill}</h4>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                    {gap.importance} Priority
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  <span className="font-bold text-slate-800">Why it is required:</span> {gap.whyImportant}
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Required Level</span>
                    <span className="font-semibold text-slate-800">{gap.requiredLevel}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Status</span>
                    <span className="font-semibold text-amber-700">{gap.currentLevel}</span>
                  </div>
                </div>

                {gap.topics && gap.topics.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Curriculum Topics:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {gap.topics.map((t, tidx) => (
                        <span
                          key={tidx}
                          className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/60"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {gap.suggestedProject && (
                  <div className="text-xs bg-indigo-50/80 p-3 rounded-xl border border-indigo-100/70 text-indigo-900 flex items-start space-x-2.5">
                    <Code2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <span className="font-bold">Hands-On Practice Project:</span> {gap.suggestedProject}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SkillGapAnalysisPage;
