import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase,
  Users,
  CheckCircle2,
  Calendar,
  Sparkles,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  Eye,
  Building,
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/recruiters/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load recruiter stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner text="Compiling recruiter analytics and applicant queues..." size="lg" />;

  const stats = data?.stats || {};
  const charts = data?.charts || {};
  const recentApplicants = data?.recentApplicants || [];
  const recentJobs = data?.recentJobs || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Recruiter Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Find the right talent for your team.
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Welcome back{user?.name ? `, ${user.name}` : ''}. Managing recruitment pipeline across <span className="font-bold text-white">{stats.activeJobs || 0} active job postings</span>.
          </p>
        </div>

        <Link
          to="/recruiter/create-job"
          className="inline-flex items-center px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4 mr-2" /> Post New Job
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Active Jobs"
          value={stats.activeJobs || 0}
          subtitle={`Total: ${stats.totalJobs || 0}`}
          icon={Briefcase}
          color="indigo"
        />
        <StatCard
          title="Applicants"
          value={stats.totalApplications || 0}
          subtitle="All candidates"
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Shortlisted"
          value={stats.shortlisted || 0}
          subtitle="Passed screen"
          icon={CheckCircle2}
          color="amber"
        />
        <StatCard
          title="Interviews"
          value={stats.interviews || 0}
          subtitle="Scheduled rounds"
          icon={Calendar}
          color="cyan"
        />
        <StatCard
          title="Hired / Selected"
          value={stats.selected || 0}
          subtitle="Offers accepted"
          icon={TrendingUp}
          color="emerald"
        />
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications per Job Bar Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Applicant Volume by Job Title
          </h3>
          <div className="h-64 w-full">
            {charts.applicationsPerJob && charts.applicationsPerJob.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.applicationsPerJob}>
                  <XAxis dataKey="jobTitle" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="applications" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No job applicant data yet.
              </div>
            )}
          </div>
        </div>

        {/* Candidate Match Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Candidate AI Fit Distribution
          </h3>
          <div className="h-64 w-full">
            {charts.matchDistribution && charts.matchDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.matchDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {charts.matchDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No applicant score distribution yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Applicants Quick Table */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Recent Candidate Applications
            </h3>
            <p className="text-xs text-slate-500">Latest submissions awaiting recruiter evaluation</p>
          </div>
          <Link
            to="/recruiter/jobs"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center transition"
          >
            Manage Jobs & View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="pb-3">Candidate</th>
                <th className="pb-3">Role Applied</th>
                <th className="pb-3">AI Match %</th>
                <th className="pb-3">Eligibility</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {recentApplicants.map((app) => (
                <tr key={app._id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5">
                    <p className="font-bold text-slate-900">{app.candidateId?.name || 'Applicant'}</p>
                    <p className="text-[10px] text-slate-400">{app.candidateId?.email}</p>
                  </td>
                  <td className="py-3.5 font-semibold text-slate-800">
                    {app.jobId?.title || 'Job'}
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`font-black text-xs px-2 py-0.5 rounded-full border ${
                        app.matchPercentage >= 75
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : app.matchPercentage >= 50
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {app.matchPercentage}%
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span className="font-semibold text-slate-700">{app.eligibilityStatus}</span>
                  </td>
                  <td className="py-3.5">
                    <Badge variant={app.status} size="sm">{app.status}</Badge>
                  </td>
                  <td className="py-3.5 text-right">
                    <Link
                      to={`/recruiter/candidate/${app._id}`}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold rounded-lg text-xs transition inline-flex items-center"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
