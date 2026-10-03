import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  CheckCircle,
  XCircle,
  Building,
  User,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const InterviewManagementPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchInterviews = async () => {
    try {
      const res = await api.get('/interviews');
      if (res.data.success) {
        setInterviews(res.data.interviews);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.put(`/interviews/${id}`, { status });
      if (res.data.success) {
        addToast(`Interview status set to ${status}.`, 'success');
        setInterviews(
          interviews.map((iv) => (iv._id === id ? { ...iv, status } : iv))
        );
      }
    } catch (err) {
      addToast('Failed to update interview.', 'error');
    }
  };

  if (loading) return <LoadingSpinner text="Retrieving interview schedule..." size="lg" />;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          Recruitment Interview Schedule ({interviews.length})
        </h2>
        <p className="text-xs text-slate-500">
          Manage live candidate rounds, update interview results, and launch video conference links
        </p>
      </div>

      {interviews.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Interviews Scheduled"
          description="Schedule interviews directly from the Job Applicants list or Shortlisted Candidates pool."
          actionLabel="View Applicants"
          onAction={() => (window.location.href = '/recruiter/jobs')}
        />
      ) : (
        <div className="space-y-4">
          {interviews.map((iv) => (
            <div
              key={iv._id}
              className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    {iv.candidateId?.name || 'Candidate'}
                  </h3>
                  <Badge variant={iv.status === 'Completed' ? 'success' : iv.status === 'Cancelled' ? 'danger' : 'primary'}>
                    {iv.status}
                  </Badge>
                  <span className="text-xs text-slate-400 font-semibold">
                    for {iv.jobId?.title || 'Position'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center font-bold text-slate-700">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-indigo-600" /> {iv.date}
                  </span>
                  <span>•</span>
                  <span className="flex items-center font-bold text-slate-700">
                    <Clock className="w-3.5 h-3.5 mr-1 text-indigo-600" /> {iv.time}
                  </span>
                  <span>•</span>
                  <span>{iv.mode}</span>
                  {iv.mode === 'Online' && iv.meetingLink && (
                    <>
                      <span>•</span>
                      <a
                        href={iv.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 font-bold hover:underline flex items-center"
                      >
                        <Video className="w-3.5 h-3.5 mr-1" /> Open Meeting Link
                      </a>
                    </>
                  )}
                </div>

                {iv.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-800">Recruiter Notes:</span> {iv.notes}
                  </p>
                )}
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center space-x-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                {iv.status === 'Scheduled' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(iv._id, 'Completed')}
                      className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition"
                    >
                      Mark Completed ✓
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(iv._id, 'Cancelled')}
                      className="px-3 py-2 text-rose-600 hover:bg-rose-50 font-bold text-xs rounded-xl border border-rose-200 transition"
                    >
                      Cancel Round
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InterviewManagementPage;
