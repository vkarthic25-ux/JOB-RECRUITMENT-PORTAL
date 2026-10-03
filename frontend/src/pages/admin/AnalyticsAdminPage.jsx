import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Users,
  Briefcase,
  Send,
  Calendar,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';

const AnalyticsAdminPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner text="Aggregating platform metrics and recruitment data..." size="lg" />;

  const stats = data?.stats || {};
  const charts = data?.charts || {};
  const statusChart = charts.statusChart || [];
  const activityTrend = charts.activityTrend || [];

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
          <BarChart3 className="w-8 h-8 text-indigo-600" />
          <span>Platform Intelligence & Analytics</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          High-level metrics on candidate talent acquisition, job requisition velocity, and matching efficiency
        </p>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Candidate Community"
          value={stats.candidates || 0}
          subtitle="Registered talent profiles"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Enterprise Recruiters"
          value={stats.recruiters || 0}
          subtitle="Active talent scouts"
          icon={ShieldCheck}
          color="purple"
        />
        <StatCard
          title="Active Requisitions"
          value={stats.activeJobs || 0}
          subtitle={`Out of ${stats.totalJobs || 0} total jobs`}
          icon={Briefcase}
          color="amber"
        />
        <StatCard
          title="Total Applications"
          value={stats.totalApplications || 0}
          subtitle={`${stats.totalInterviews || 0} interviews held`}
          icon={Send}
          color="emerald"
        />
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth & Hiring Velocity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Platform Trajectory</h2>
              <p className="text-xs text-slate-500">Candidates, jobs, and applications timeline</p>
            </div>
            <TrendingUp className="w-5 h-5 text-indigo-500" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="candidates"
                  name="Candidates"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="applications"
                  name="Applications"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="jobs"
                  name="Jobs"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Application Funnel Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Application Pipeline Funnel</h2>
                <p className="text-xs text-slate-500">Distribution across hiring workflow stages</p>
              </div>
              <PieIcon className="w-5 h-5 text-indigo-500" />
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChart}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
            <div className="bg-slate-50 p-2.5 rounded-xl">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Shortlist Rate</div>
              <div className="text-sm font-black text-amber-600 mt-0.5">
                {stats.totalApplications > 0
                  ? Math.round(
                      ((statusChart.find((s) => s.name === 'Shortlisted')?.value || 0) /
                        stats.totalApplications) *
                        100
                    )
                  : 0}
                %
              </div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Interview Rate</div>
              <div className="text-sm font-black text-indigo-600 mt-0.5">
                {stats.totalApplications > 0
                  ? Math.round(
                      ((statusChart.find((s) => s.name === 'Interview')?.value || 0) /
                        stats.totalApplications) *
                        100
                    )
                  : 0}
                %
              </div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Selection Rate</div>
              <div className="text-sm font-black text-emerald-600 mt-0.5">
                {stats.totalApplications > 0
                  ? Math.round(
                      ((statusChart.find((s) => s.name === 'Selected')?.value || 0) /
                        stats.totalApplications) *
                        100
                    )
                  : 0}
                %
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Decision Support & Architecture Compliance Card */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Architecture Compliance Note</span>
          </div>
          <h3 className="text-lg font-bold">Explainable AI Matching Architecture</h3>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            All AI-derived candidate match scores strictly conform to deterministic, non-discriminatory multi-criteria weighting: 50% Skill overlap, 20% Experience alignment, 15% Educational qualification, and 15% Role relevance. AI serves strictly as transparent decision support.
          </p>
        </div>
        <div className="shrink-0 flex items-center space-x-3 bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-xs font-semibold">
          <span>Weighted Deterministic Engine Active</span>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsAdminPage;
