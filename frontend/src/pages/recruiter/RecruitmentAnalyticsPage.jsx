import React, { useState, useEffect } from 'react';
import api from '../../services/api';
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
  CartesianGrid,
} from 'recharts';
import { TrendingUp, Users, Award, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const RecruitmentAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/recruiters/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner text="Compiling recruitment analytics..." size="lg" />;

  const stats = data?.stats || {};
  const charts = data?.charts || {};

  // Pipeline conversion funnel data
  const funnelData = [
    { stage: 'Total Applied', count: stats.totalApplications || 0, fill: '#6366f1' },
    { stage: 'Shortlisted', count: stats.shortlisted || 0, fill: '#f59e0b' },
    { stage: 'Interviewed', count: stats.interviews || 0, fill: '#06b6d4' },
    { stage: 'Offers Accepted', count: stats.selected || 0, fill: '#10b981' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          Recruitment Metrics & Pipeline Intelligence
        </h2>
        <p className="text-xs text-slate-500">
          Analyze conversion funnels, job demand, and candidate competency distribution
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Conversion Rate"
          value={stats.totalApplications > 0 ? `${Math.round((stats.selected / stats.totalApplications) * 100)}%` : '0%'}
          subtitle="Applied to Hired"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Screening Rate"
          value={stats.totalApplications > 0 ? `${Math.round((stats.shortlisted / stats.totalApplications) * 100)}%` : '0%'}
          subtitle="Shortlisted Ratio"
          icon={CheckCircle2}
          color="indigo"
        />
        <StatCard
          title="Interview Ratio"
          value={stats.shortlisted > 0 ? `${Math.round((stats.interviews / stats.shortlisted) * 100)}%` : '0%'}
          subtitle="Interviews per Shortlist"
          icon={Calendar}
          color="cyan"
        />
        <StatCard
          title="Active Openings"
          value={stats.activeJobs || 0}
          subtitle="In-flight listings"
          icon={Award}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel conversion bar chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Hiring Pipeline Conversion Funnel
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 11 }} width={110} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Candidate AI Fit Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Candidate AI Fit Breakdown
          </h3>
          <div className="h-64 w-full">
            {charts.matchDistribution && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.matchDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {charts.matchDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruitmentAnalyticsPage;
