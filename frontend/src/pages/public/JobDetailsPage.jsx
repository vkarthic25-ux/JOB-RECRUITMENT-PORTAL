import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Building,
  MapPin,
  Calendar,
  Briefcase,
  DollarSign,
  GraduationCap,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Share2,
  Send,
  Loader2,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import MatchScoreCard from '../../components/candidate/MatchScoreCard';
import EligibilityCard from '../../components/candidate/EligibilityCard';
import SkillGapCard from '../../components/candidate/SkillGapCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isCandidate, isAuthenticated, quickLogin } = useAuth();
  const { addToast } = useToast();

  const [job, setJob] = useState(null);
  const [matchAnalysis, setMatchAnalysis] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/jobs/${id}`);
        if (res.data.success) {
          setJob(res.data.job);
          setMatchAnalysis(res.data.matchAnalysis);
          setHasApplied(res.data.hasApplied);
        }
      } catch (err) {
        addToast('Unable to load job details.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, isAuthenticated]);

  const handleApply = async () => {
    if (!isAuthenticated) {
      addToast('Please login as a candidate to apply for this job.', 'info');
      navigate('/login');
      return;
    }

    if (!isCandidate) {
      addToast('Only candidates can apply to job postings.', 'warning');
      return;
    }

    setApplying(true);
    try {
      const res = await api.post('/applications', { jobId: job._id });
      if (res.data.success) {
        setHasApplied(true);
        addToast('Application submitted successfully! Track progress in your dashboard.', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit application.', 'error');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading job details & AI analysis..." size="lg" />;
  if (!job) return <div className="p-8 text-center text-slate-500">Job not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <Link
        to="/jobs"
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Search
      </Link>

      {/* Hero Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0 font-bold text-xl shadow-sm">
            {job.companyId?.logo ? (
              <img
                src={job.companyId.logo}
                alt="Logo"
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              job.companyId?.name?.charAt(0) || 'C'
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h1 className="text-2xl font-black text-slate-950 tracking-tight">{job.title}</h1>
              <Badge variant="primary" size="sm">
                {job.employmentType}
              </Badge>
            </div>
            <p className="text-xs font-semibold text-slate-600 flex items-center space-x-3">
              <span className="flex items-center text-indigo-600 font-bold">
                <Building className="w-3.5 h-3.5 mr-1" /> {job.companyId?.name}
              </span>
              <span>•</span>
              <span className="flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" /> {job.location}
              </span>
              <span>•</span>
              <span className="flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" /> {job.experienceRequired}+ yrs exp
              </span>
            </p>
          </div>
        </div>

        {/* Action Button Group */}
        <div className="flex flex-wrap items-center gap-3">
          {hasApplied ? (
            <div className="inline-flex items-center px-6 py-3 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs">
              <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
              Applied for this Position
            </div>
          ) : (
            <button
              onClick={handleApply}
              disabled={applying}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/25 transition flex items-center space-x-2 disabled:opacity-50"
            >
              {applying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Application...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Apply Now</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Job Description & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Facts bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Salary Range</span>
              <span className="font-extrabold text-slate-900 text-sm">
                ${job.salaryRange?.min?.toLocaleString()} - ${job.salaryRange?.max?.toLocaleString()} / yr
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Education Qualification</span>
              <span className="font-bold text-slate-800">{job.qualification}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Application Deadline</span>
              <span className="font-bold text-slate-800">
                {new Date(job.applicationDeadline).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Role Overview & Purpose
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Key Responsibilities
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-700">
                {job.responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mr-2.5 mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills Required */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Required Technical Competencies
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills?.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 font-semibold text-xs border border-slate-200"
                >
                  {skill}
                </span>
              ))}
            </div>

            {job.preferredSkills && job.preferredSkills.length > 0 && (
              <div className="pt-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Nice-to-Have / Preferred Skills
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {job.preferredSkills.map((pref, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50/70 text-indigo-700 text-xs border border-indigo-100"
                    >
                      {pref}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Match, Eligibility & Skill Gap */}
        <div className="space-y-6">
          {isAuthenticated && matchAnalysis ? (
            <>
              {/* Explainable Match Card */}
              <MatchScoreCard matchAnalysis={matchAnalysis} />

              {/* Eligibility Checklist */}
              <EligibilityCard
                eligibilityStatus={matchAnalysis.eligibilityStatus}
                eligibilityReasons={matchAnalysis.eligibilityReasons}
              />

              {/* Skill Gap Component */}
              <SkillGapCard
                skillGaps={matchAnalysis.skillGaps}
                jobId={job._id}
                jobTitle={job.title}
              />
            </>
          ) : (
            <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 p-6 rounded-3xl text-white shadow-xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/10 mx-auto flex items-center justify-center text-indigo-300">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold">Unlock AI Match Analysis</h4>
              <p className="text-xs text-indigo-200/90 leading-relaxed">
                Log in as candidate to see your personalized match percentage, detailed skill gap analysis, and eligibility verification for this job.
              </p>
              <button
                onClick={() => quickLogin('candidate')}
                className="w-full py-2.5 bg-white text-indigo-950 font-bold text-xs rounded-xl shadow hover:bg-indigo-50 transition"
              >
                Sign in as Candidate
              </button>
            </div>
          )}

          {/* Company Brief Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm text-xs space-y-3">
            <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2">
              About {job.companyId?.name}
            </h4>
            <p className="text-slate-600 leading-relaxed">
              {job.companyId?.description || 'Leading technology and software engineering innovator.'}
            </p>
            <div className="pt-2 text-slate-500 space-y-1">
              <div>Industry: <span className="font-semibold text-slate-800">{job.companyId?.industry}</span></div>
              <div>Location: <span className="font-semibold text-slate-800">{job.companyId?.location}</span></div>
              {job.companyId?.website && (
                <div>
                  Website:{' '}
                  <a
                    href={job.companyId.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:underline font-semibold"
                  >
                    {job.companyId.website}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;
