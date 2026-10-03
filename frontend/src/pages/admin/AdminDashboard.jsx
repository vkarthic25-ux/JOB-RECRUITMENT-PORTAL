import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Users,
  Building,
  Briefcase,
  Send,
  Calendar,
  Shield,
  CheckCircle,
  Activity,
  ArrowRight,
  TrendingUp,
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
} from 'recharts';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) return <LoadingSpinner text="Compiling platform-wide administration telemetry..." size="lg" />;

  const stats = data?.stats || {};
  const charts = data?.charts || {};

  return (
    <div className="space-y-6 pb-16">
      {/* Admin Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-bold mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Master Governance Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Platform Administration</h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Monitoring users, enterprise companies, job postings, and AI matching operations
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2 rounded-2xl text-xs font-bold text-emerald-400">
          <Activity className="w-4 h-4 animate-pulse text-emerald-400" />
          <span>System Healthy • Local DB Active</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers || 0}
          subtitle={`${stats.candidates || 0} candidates, ${stats.recruiters || 0} recruiters`}
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Companies"
          value={stats.companies || 0}
          subtitle="Registered employers"
          icon={Building}
          color="purple"
        />
        <StatCard
          title="Jobs Posted"
          value={stats.totalJobs || 0}
          subtitle={`${stats.activeJobs || 0} actively hiring`}
          icon={Briefcase}
          color="amber"
        />
        <StatCard
          title="Applications"
          value={stats.totalApplications || 0}
          subtitle={`${stats.totalInterviews || 0} interviews held`}
          icon={Send}
          color="emerald"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Trend */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center">
            <TrendingUp className="w-4 h-4 text-indigo-600 mr-2" />
            Platform Activity Trajectory
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.activityTrend || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="candidates" stroke="#6366f1" strokeWidth={2} name="Candidates" />
                <Line type="monotone" dataKey="applications" stroke="#10b981" strokeWidth={2} name="Applications" />
                <Line type="monotone" dataKey="jobs" stroke="#f59e0b" strokeWidth={2} name="Jobs" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown Pie */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center">
            <Activity className="w-4 h-4 text-purple-600 mr-2" />
            Applications by Pipeline Status
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.statusChart || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {(charts.statusChart || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Governance Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/admin/users"
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition text-xs flex items-center justify-between group"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Manage Users</p>
              <p className="text-slate-400 text-[11px]">Deactivate or inspect accounts</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition" />
        </Link>

        <Link
          to="/admin/jobs"
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition text-xs flex items-center justify-between group"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Moderate Jobs</p>
              <p className="text-slate-400 text-[11px]">Audit active listings</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 transition" />
        </Link>

        <Link
          to="/admin/applications"
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition text-xs flex items-center justify-between group"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900">View Applications</p>
              <p className="text-slate-400 text-[11px]">Inspect all matches & status</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition" />
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
