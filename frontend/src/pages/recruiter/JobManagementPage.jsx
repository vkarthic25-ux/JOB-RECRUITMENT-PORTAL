import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Briefcase,
  PlusCircle,
  Users,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Calendar,
  Building,
  ArrowRight,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const JobManagementPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs/recruiter/my-jobs');
      if (res.data.success) {
        setJobs(res.data.jobs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleToggleStatus = async (job) => {
    const nextStatus = job.status === 'active' ? 'closed' : 'active';
    try {
      const res = await api.put(`/jobs/${job._id}`, { status: nextStatus });
      if (res.data.success) {
        addToast(`Job status set to ${nextStatus}`, 'success');
        setJobs(jobs.map((j) => (j._id === job._id ? { ...j, status: nextStatus } : j)));
      }
    } catch (err) {
      addToast('Failed to update job status.', 'error');
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      const res = await api.delete(`/jobs/${id}`);
      if (res.data.success) {
        addToast('Job deleted successfully.', 'success');
        setJobs(jobs.filter((j) => j._id !== id));
      }
    } catch (err) {
      addToast('Failed to delete job.', 'error');
    }
  };

  if (loading) return <LoadingSpinner text="Loading your posted jobs..." size="lg" />;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Job Posting Management ({jobs.length})
          </h2>
          <p className="text-xs text-slate-500">
            Publish, edit, and review applicants across your enterprise positions
          </p>
        </div>

        <Link
          to="/recruiter/create-job"
          className="inline-flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/25 transition whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4 mr-1.5" /> Post New Position
        </Link>
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs posted yet"
          description="Create your first job listing to start receiving candidate applications with explainable AI match scores."
          actionLabel="Create Job Now"
          onAction={() => (window.location.href = '/recruiter/create-job')}
        />
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{job.title}</h3>
                  <Badge variant={job.status === 'active' ? 'success' : 'default'} size="sm">
                    {job.status === 'active' ? 'Active' : 'Closed'}
                  </Badge>
                  <span className="text-xs text-slate-400 font-semibold">• {job.department}</span>
                </div>

                <p className="text-xs text-slate-500 flex items-center space-x-3">
                  <span>{job.location} ({job.employmentType})</span>
                  <span>•</span>
                  <span>${job.salaryRange?.min?.toLocaleString()} - ${job.salaryRange?.max?.toLocaleString()}</span>
                  <span>•</span>
                  <span>Created {new Date(job.createdAt).toLocaleDateString()}</span>
                </p>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.requiredSkills?.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200/60"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Applicant pill & actions */}
              <div className="flex flex-wrap items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                <Link
                  to={`/recruiter/jobs/${job._id}/applicants`}
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition flex items-center shadow-sm"
                >
                  <Users className="w-4 h-4 mr-1.5" />
                  <span>{job.applicantCount || 0} Applicants</span>
                </Link>

                <button
                  onClick={() => handleToggleStatus(job)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                    job.status === 'active'
                      ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                      : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                  }`}
                  title="Toggle Active/Closed status"
                >
                  {job.status === 'active' ? 'Close Job' : 'Reactivate'}
                </button>

                <Link
                  to={`/recruiter/jobs/${job._id}/edit`}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition"
                  title="Edit Job"
                >
                  <Edit className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => handleDeleteJob(job._id)}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition"
                  title="Delete Job"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobManagementPage;
