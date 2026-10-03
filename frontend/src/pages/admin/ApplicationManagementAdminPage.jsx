import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Send, Search, Filter, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';

const ApplicationManagementAdminPage = () => {
  const { showToast } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/applications');
      if (res.data.success) {
        setApplications(res.data.applications);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch applications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const filteredApps = applications.filter((app) => {
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    if (!matchesStatus) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const candName = app.candidateId?.name?.toLowerCase().includes(q);
    const candEmail = app.candidateId?.email?.toLowerCase().includes(q);
    const jobTitle = app.jobId?.title?.toLowerCase().includes(q);
    const compName = app.jobId?.companyId?.name?.toLowerCase().includes(q);
    return candName || candEmail || jobTitle || compName;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Send className="w-8 h-8 text-indigo-600" />
            <span>Applications Oversight</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Global pipeline of candidate applications and AI matching analytics
          </p>
        </div>
        <button
          onClick={fetchApplications}
          className="inline-flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition shadow-sm"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate, job, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

      {/* Applications Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving platform application pipelines..." />
      ) : filteredApps.length === 0 ? (
        <EmptyState
          title="No applications found"
          description="Try modifying your status filter or search parameters."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Candidate</th>
                  <th className="py-3.5 px-4 sm:px-6">Job Position</th>
                  <th className="py-3.5 px-4 sm:px-6">AI Match %</th>
                  <th className="py-3.5 px-4 sm:px-6">Eligibility</th>
                  <th className="py-3.5 px-4 sm:px-6">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Applied Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredApps.map((app) => {
                  const statusVariant =
                    app.status === 'Selected'
                      ? 'success'
                      : app.status === 'Shortlisted'
                      ? 'warning'
                      : app.status === 'Interview Scheduled'
                      ? 'info'
                      : app.status === 'Rejected'
                      ? 'danger'
                      : 'neutral';

                  const eligVariant =
                    app.eligibilityStatus === 'Eligible'
                      ? 'success'
                      : app.eligibilityStatus === 'Partially Eligible'
                      ? 'warning'
                      : 'danger';

                  return (
                    <tr key={app._id} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="font-bold text-slate-900">
                          {app.candidateId?.name || 'Candidate'}
                        </div>
                        <div className="text-xs text-slate-400">
                          {app.candidateId?.email || 'N/A'}
                        </div>
                      </td>
                      <td className="py-4 px-4 sm:px-6">
                        <div className="font-semibold text-slate-800 text-xs">
                          {app.jobId?.title || 'Job Position'}
                        </div>
                        <div className="text-[11px] text-indigo-600 font-medium">
                          {app.jobId?.companyId?.name || 'Company'}
                        </div>
                      </td>
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`font-black text-sm ${
                              app.matchPercentage >= 75
                                ? 'text-emerald-600'
                                : app.matchPercentage >= 50
                                ? 'text-amber-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {app.matchPercentage || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 sm:px-6">
                        <Badge variant={eligVariant} size="sm">
                          {app.eligibilityStatus || 'Under Evaluation'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 sm:px-6">
                        <Badge variant={statusVariant} size="sm">
                          {app.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-xs text-slate-500 text-right">
                        {formatDate(app.appliedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationManagementAdminPage;
