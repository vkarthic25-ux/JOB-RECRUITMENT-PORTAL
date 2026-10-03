import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Sparkles, BrainCircuit, CheckCircle, AlertTriangle, ArrowLeft, Send } from 'lucide-react';
import MatchScoreCard from '../../components/candidate/MatchScoreCard';
import EligibilityCard from '../../components/candidate/EligibilityCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const JobMatchAnalysisPage = () => {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');

  const [job, setJob] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatch = async () => {
      if (!jobId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const jobRes = await api.get(`/jobs/${jobId}`);
        if (jobRes.data.success) {
          setJob(jobRes.data.job);
          setAnalysis(jobRes.data.matchAnalysis);
        }
      } catch (err) {
        console.error('Failed to load job match analysis:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatch();
  }, [jobId]);

  if (loading) return <LoadingSpinner text="Computing explainable AI match scores..." size="lg" />;

  if (!job || !analysis) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
        <Sparkles className="w-10 h-10 text-indigo-600 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">Select a Job for AI Match Analysis</h3>
        <p className="text-xs text-slate-500">
          Browse open listings to compare your resume competencies against target job descriptions.
        </p>
        <Link
          to="/candidate/jobs"
          className="inline-block px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold"
        >
          Explore Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        to={`/jobs/${job._id}`}
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Job Details
      </Link>

      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block mb-1">
            Target Job Analysis
          </span>
          <h2 className="text-xl font-black text-slate-900">{job.title}</h2>
          <p className="text-xs text-slate-500">{job.companyId?.name} • {job.location}</p>
        </div>

        <Link
          to={`/jobs/${job._id}`}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          View Job & Apply
        </Link>
      </div>

      <MatchScoreCard matchAnalysis={analysis} />

      <EligibilityCard
        eligibilityStatus={analysis.eligibilityStatus}
        eligibilityReasons={analysis.eligibilityReasons}
      />
    </div>
  );
};

export default JobMatchAnalysisPage;
