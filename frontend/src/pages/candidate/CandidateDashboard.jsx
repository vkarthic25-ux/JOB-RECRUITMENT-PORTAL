import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase,
  FileCheck,
  Send,
  Calendar,
  Sparkles,
  BrainCircuit,
  ArrowRight,
  TrendingUp,
  Target,
  BookOpen,
  CheckCircle2,
  Clock,
  Video,
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import ProgressBar from '../../components/common/ProgressBar';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CandidateDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/candidates/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner text="Compiling your candidate dashboard..." size="lg" />;

  const stats = data?.stats || {};
  const recentApplications = data?.recentApplications || [];
  const upcomingInterviews = data?.upcomingInterviews || [];
  const recommendedJobs = data?.recommendedJobs || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Candidate Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            Welcome back{user?.name ? `, ${user.name}` : ''}!
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
            Discover opportunities that match your skills and career goals. You have <span className="font-bold text-white">{stats.totalApplications || 0}</span> submitted applications and <span className="font-bold text-emerald-300">{stats.upcomingInterviews || 0}</span> upcoming interviews.
          </p>
        </div>

        {/* Profile Completion Widget */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 min-w-[200px] text-xs">
          <div className="flex justify-between items-center mb-1.5 font-bold">
            <span>Profile Completion</span>
            <span className="text-emerald-300">{stats.profileCompletion}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden mb-2">
            <div
              className="bg-emerald-400 h-2 rounded-full transition-all duration-700"
              style={{ width: `${stats.profileCompletion}%` }}
            />
          </div>
          <Link
            to="/candidate/profile"
            className="text-[11px] text-indigo-200 hover:text-white flex items-center transition"
          >
            Complete profile details <ArrowRight className="w-3 h-3 ml-1" />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Applied"
          value={stats.totalApplications || 0}
          subtitle="Positions submitted"
          icon={Send}
          color="indigo"
        />
        <StatCard
          title="Under Review"
          value={stats.underReview || 0}
          subtitle="Screening in progress"
          icon={Clock}
          color="purple"
        />
        <StatCard
          title="Shortlisted"
          value={stats.shortlisted || 0}
          subtitle="Passed initial filters"
          icon={CheckCircle2}
          color="amber"
        />
        <StatCard
          title="Interviews"
          value={stats.upcomingInterviews || 0}
          subtitle="Upcoming rounds"
          icon={Calendar}
          color="emerald"
        />
      </div>

      {/* AI Resume Analyzer & Career Skill Advisor Feature Highlight */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-indigo-800/60">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-bold">
            <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
            <span>Dedicated Candidate AI Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            AI Resume Analyzer & Career Skill Advisor
          </h2>
          <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
            Get an in-depth career readiness score, breakdown of technical strengths, detected skill gaps, potential career areas, and a personalized 30/60/90 day learning plan directly from your resume.
          </p>
        </div>
        <Link
          to="/candidate/ai-analysis"
          className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-white text-indigo-950 hover:bg-indigo-50 font-bold text-xs transition shadow-lg shrink-0"
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Launch AI Resume Analyzer</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {/* Main Grid: Recommended Jobs & Upcoming Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: AI Recommended Jobs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <Sparkles className="w-4 h-4 text-indigo-600 mr-2" />
                AI Recommended Jobs For You
              </h3>
              <p className="text-xs text-slate-500">Ranked by algorithm based on your extracted skills</p>
            </div>
            <Link
              to="/candidate/jobs"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center transition"
            >
              Browse All <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="space-y-3">
            {recommendedJobs.length > 0 ? (
              recommendedJobs.map(({ job, matchPercentage, eligibilityStatus, whyMatched }, idx) => (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-200 transition group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
                        {job.title}
                      </h4>
                      <Badge variant={eligibilityStatus} size="sm">
                        {eligibilityStatus}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-500 mb-2">
                      {job.companyId?.name} • {job.location} • ${job.salaryRange?.min?.toLocaleString()} - ${job.salaryRange?.max?.toLocaleString()}
                    </p>

                    <div className="flex items-center space-x-2 text-xs text-indigo-700 bg-indigo-50/70 px-2.5 py-1 rounded-lg w-fit">
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      <span>{whyMatched}</span>
                    </div>
                  </div>

                  <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-2">
                    <div className="text-right">
                      <span className="text-xl font-black text-emerald-600">
                        {matchPercentage}%
                      </span>
                      <span className="text-[10px] text-slate-400 block -mt-1 font-semibold">
                        Match Score
                      </span>
                    </div>

                    <Link
                      to={`/jobs/${job._id}`}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition"
                    >
                      View & Apply
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
                Upload your resume to activate personalized job match recommendations.
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Interviews & Resume Quick Actions */}
        <div className="space-y-6">
          {/* Upcoming Interviews Widget */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <Calendar className="w-4 h-4 text-emerald-600 mr-2" />
                Upcoming Interviews
              </h3>
              <Link to="/candidate/interviews" className="text-xs text-indigo-600 font-semibold hover:underline">
                View All
              </Link>
            </div>

            {upcomingInterviews.length > 0 ? (
              <div className="space-y-3">
                {upcomingInterviews.map((iv, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/40 text-xs">
                    <p className="font-bold text-slate-900">{iv.jobId?.title || 'Technical Interview'}</p>
                    <p className="text-slate-500 text-[11px]">{iv.jobId?.companyId?.name || 'Company'}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-100 text-slate-600">
                      <span className="font-semibold">{iv.date} • {iv.time}</span>
                      {iv.mode === 'Online' && iv.meetingLink && (
                        <a
                          href={iv.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-700 font-bold hover:underline flex items-center"
                        >
                          <Video className="w-3 h-3 mr-1" /> Join Call
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">
                No interviews scheduled currently. Keep applying to open positions!
              </p>
            )}
          </div>

          {/* Quick AI Skill Roadmap Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 text-xs space-y-3">
            <div className="flex items-center space-x-2 text-indigo-900 font-bold">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Personalized Learning Roadmap</span>
            </div>
            <p className="text-indigo-800 leading-relaxed text-[11px]">
              Review your customized learning roadmap generated from top employer skill gaps to increase your match percentage.
            </p>
            <Link
              to="/candidate/learning-roadmap"
              className="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
            >
              Open Learning Roadmap <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
