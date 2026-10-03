import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Send,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  ArrowRight,
  Filter,
  Eye,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const ApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get('/applications/candidate');
        if (res.data.success) {
          setApplications(res.data.applications);
        }
      } catch (err) {
        console.error('Failed to load candidate applications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const filteredApplications =
    statusFilter === 'All'
      ? applications
      : applications.filter((app) => app.status === statusFilter);

  if (loading) return <LoadingSpinner text="Retrieving your submitted applications..." size="lg" />;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Submitted Job Applications ({applications.length})
          </h2>
          <p className="text-xs text-slate-500">
            Track hiring status transitions, view interview schedules, and inspect AI match scores
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-2 text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 shadow-sm"
          >
            <option value="All">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <EmptyState
          icon={Send}
          title="No applications found"
          description="You have not submitted applications matching this status. Explore our job board to discover active roles."
          actionLabel="Explore Jobs"
          onAction={() => (window.location.href = '/candidate/jobs')}
        />
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => (
            <div
              key={app._id}
              className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    {app.jobId?.title || 'Engineering Role'}
                  </h3>
                  <Badge variant={app.status}>{app.status}</Badge>
                </div>

                <p className="text-xs font-medium text-slate-500 flex items-center space-x-3">
                  <span className="flex items-center text-slate-700 font-semibold">
                    <Building className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {app.jobId?.companyId?.name || 'Company'}
                  </span>
                  <span>•</span>
                  <span>Applied on {new Date(app.appliedAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-bold">{app.eligibilityStatus}</span>
                </p>

                {/* Matched skills pill row */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {app.matchedSkills?.slice(0, 4).map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-100"
                    >
                      ✓ {s}
                    </span>
                  ))}
                  {app.missingSkills?.length > 0 && (
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-semibold border border-amber-100">
                      +{app.missingSkills.length} missing
                    </span>
                  )}
                </div>
              </div>

              {/* Match & Details button */}
              <div className="flex items-center md:flex-col md:items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="text-left md:text-right">
                  <span className="text-2xl font-black text-slate-900">
                    {app.matchPercentage}%
                  </span>
                  <span className="text-[10px] text-slate-400 block -mt-1 font-semibold uppercase">
                    AI Match Score
                  </span>
                </div>

                <Link
                  to={`/candidate/applications/${app._id}`}
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 rounded-xl text-xs font-bold transition flex items-center shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5 mr-1" /> View Tracking Timeline
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage;
