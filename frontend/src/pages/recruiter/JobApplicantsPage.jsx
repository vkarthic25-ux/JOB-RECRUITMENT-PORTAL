import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Filter,
  ArrowLeft,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  Sparkles,
  Download,
  Search,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ScheduleInterviewModal from '../../components/recruiter/ScheduleInterviewModal';

const JobApplicantsPage = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [eligibilityFilter, setEligibilityFilter] = useState('All');
  const [sortOption, setSortOption] = useState('match_desc');

  // Modal
  const [selectedAppForInterview, setSelectedAppForInterview] = useState(null);
  const { addToast } = useToast();

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/applications/job/${jobId}`);
      if (res.data.success) {
        setJob(res.data.job);
        setApplications(res.data.applications);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load job applicants.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const res = await api.put(`/applications/${appId}/status`, { status: newStatus });
      if (res.data.success) {
        addToast(`Candidate marked as ${newStatus}.`, 'success');
        setApplications(
          applications.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
        );
      }
    } catch (err) {
      addToast('Failed to update status.', 'error');
    }
  };

  // Filter & sort
  let filtered = applications.filter((app) => {
    if (statusFilter !== 'All' && app.status !== statusFilter) return false;
    if (eligibilityFilter !== 'All' && app.eligibilityStatus !== eligibilityFilter) return false;
    return true;
  });

  if (sortOption === 'match_desc') {
    filtered.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
  } else if (sortOption === 'match_asc') {
    filtered.sort((a, b) => (a.matchPercentage || 0) - (b.matchPercentage || 0));
  } else if (sortOption === 'newest') {
    filtered.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
  }

  if (loading) return <LoadingSpinner text="Retrieving applicant profiles and AI scores..." size="lg" />;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      <Link
        to="/recruiter/jobs"
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to My Posted Jobs
      </Link>

      {/* Header */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block mb-1">
            Applicant Screening Pipeline
          </span>
          <h2 className="text-xl font-black text-slate-900">
            {job?.title} ({applications.length} Candidates)
          </h2>
          <p className="text-xs text-slate-500">
            {job?.location} • Min {job?.experienceRequired} yrs exp • {job?.employmentType}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={eligibilityFilter}
            onChange={(e) => setEligibilityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
          >
            <option value="All">All Eligibility</option>
            <option value="Eligible">Eligible</option>
            <option value="Partially Eligible">Partially Eligible</option>
            <option value="Not Eligible">Not Eligible</option>
          </select>

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none"
          >
            <option value="match_desc">Highest AI Match</option>
            <option value="match_asc">Lowest AI Match</option>
            <option value="newest">Latest Submissions</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No applicants found"
          description="No candidate applications match your current status or eligibility filters."
          actionLabel="Reset Filters"
          onAction={() => {
            setStatusFilter('All');
            setEligibilityFilter('All');
          }}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-4 px-6">Candidate</th>
                  <th className="py-4 px-4">AI Match</th>
                  <th className="py-4 px-4">Eligibility</th>
                  <th className="py-4 px-4">Experience</th>
                  <th className="py-4 px-4">Key Skills</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Recruiter Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                          {app.candidateId?.name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{app.candidateId?.name}</p>
                          <p className="text-[10px] text-slate-400">{app.candidateId?.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded-full border ${
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

                    <td className="py-4 px-4">
                      <Badge variant={app.eligibilityStatus} size="sm">
                        {app.eligibilityStatus}
                      </Badge>
                    </td>

                    <td className="py-4 px-4 font-semibold text-slate-700">
                      {app.profile?.experience?.[0]?.years
                        ? `${app.profile.experience[0].years}+ yrs`
                        : '1-2 yrs'}
                    </td>

                    <td className="py-4 px-4 max-w-[200px]">
                      <div className="flex flex-wrap gap-1">
                        {app.matchedSkills?.slice(0, 3).map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-100 truncate"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <Badge variant={app.status} size="sm">
                        {app.status}
                      </Badge>
                    </td>

                    <td className="py-4 px-6 text-right space-x-1.5 whitespace-nowrap">
                      <Link
                        to={`/recruiter/candidate/${app._id}`}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition inline-flex items-center"
                        title="Review Full Profile & AI Breakdown"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> View
                      </Link>

                      {app.status !== 'Shortlisted' && app.status !== 'Selected' && (
                        <button
                          onClick={() => handleUpdateStatus(app._id, 'Shortlisted')}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg transition inline-flex items-center"
                          title="Shortlist Candidate"
                        >
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Shortlist
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedAppForInterview(app)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition inline-flex items-center shadow-sm"
                        title="Schedule Candidate Interview"
                      >
                        <Calendar className="w-3.5 h-3.5 mr-1" /> Interview
                      </button>

                      {app.status !== 'Rejected' && (
                        <button
                          onClick={() => handleUpdateStatus(app._id, 'Rejected')}
                          className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 font-bold rounded-lg transition"
                          title="Reject Application"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {selectedAppForInterview && (
        <ScheduleInterviewModal
          isOpen={!!selectedAppForInterview}
          onClose={() => setSelectedAppForInterview(null)}
          application={selectedAppForInterview}
          onScheduled={() => {
            fetchApplicants();
          }}
        />
      )}
    </div>
  );
};

export default JobApplicantsPage;
