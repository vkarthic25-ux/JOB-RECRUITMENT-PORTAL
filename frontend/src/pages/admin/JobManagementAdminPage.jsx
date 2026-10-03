import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Briefcase, Search, Filter, RefreshCw, ExternalLink, Calendar, MapPin } from 'lucide-react';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';

const JobManagementAdminPage = () => {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/jobs');
      if (res.data.success) {
        setJobs(res.data.jobs);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch jobs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchesStatus = statusFilter === 'All' || job.status === statusFilter;
    if (!matchesStatus) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const titleMatch = job.title?.toLowerCase().includes(q);
    const compMatch = job.companyId?.name?.toLowerCase().includes(q);
    const locMatch = job.location?.toLowerCase().includes(q);
    return titleMatch || compMatch || locMatch;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Briefcase className="w-8 h-8 text-indigo-600" />
            <span>Job Requisitions Registry</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Global repository of job opportunities posted across all enterprise recruiters
          </p>
        </div>
        <button
          onClick={fetchJobs}
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
            placeholder="Search by job title, company, or location..."
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
            <option value="All">All Jobs</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Jobs Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving platform job listings..." />
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          title="No jobs found"
          description="Adjust your search criteria or filter to locate job postings."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Job Role & Company</th>
                  <th className="py-3.5 px-4 sm:px-6">Posted By</th>
                  <th className="py-3.5 px-4 sm:px-6">Location & Type</th>
                  <th className="py-3.5 px-4 sm:px-6">Status</th>
                  <th className="py-3.5 px-4 sm:px-6">Deadline</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredJobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="font-bold text-slate-900">{job.title}</div>
                      <div className="text-xs text-indigo-600 font-medium">
                        {job.companyId?.name || 'Enterprise'}
                      </div>
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <div className="font-semibold text-slate-800 text-xs">
                        {job.recruiterId?.name || 'Recruiter'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {job.recruiterId?.email || ''}
                      </div>
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center space-x-1.5 text-xs text-slate-700">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{job.location}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">{job.employmentType}</div>
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <Badge variant={job.status === 'active' ? 'success' : 'neutral'} size="sm">
                        {job.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-xs text-slate-500">
                      {formatDate(job.applicationDeadline)}
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <Link
                        to={`/jobs/${job._id}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-lg text-xs font-bold transition"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobManagementAdminPage;
