import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Building,
  User,
  CheckCircle,
  AlertCircle,
  FileText,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const InterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await api.get('/interviews');
        if (res.data.success) {
          setInterviews(res.data.interviews);
        }
      } catch (err) {
        console.error('Failed to load interviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  if (loading) return <LoadingSpinner text="Retrieving your interview calendar..." size="lg" />;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          Your Scheduled Interviews ({interviews.length})
        </h2>
        <p className="text-xs text-slate-500">
          Review meeting invitations, video call links, and recruiter preparation guidelines
        </p>
      </div>

      {interviews.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Interviews Scheduled"
          description="Once recruiters review your application and shortlist you, interview sessions and meeting invitations will appear here."
          actionLabel="View Applications"
          onAction={() => (window.location.href = '/candidate/applications')}
        />
      ) : (
        <div className="space-y-4">
          {interviews.map((iv) => (
            <div
              key={iv._id}
              className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-base font-bold text-slate-900">
                      {iv.jobId?.title || 'Technical Interview Session'}
                    </h3>
                    <Badge variant={iv.status === 'Completed' ? 'success' : 'primary'}>
                      {iv.status}
                    </Badge>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 flex items-center">
                    <Building className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {iv.jobId?.companyId?.name || 'Company'}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-sm font-black text-slate-900 flex items-center sm:justify-end">
                    <Calendar className="w-4 h-4 mr-1 text-indigo-600" />
                    {iv.date}
                  </div>
                  <div className="text-xs text-slate-500 font-semibold flex items-center sm:justify-end mt-0.5">
                    <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {iv.time}
                  </div>
                </div>
              </div>

              {/* Mode & Link / Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    Interview Mode & Platform
                  </span>
                  <div className="flex items-center space-x-2 font-bold text-slate-800">
                    {iv.mode === 'Online' ? (
                      <>
                        <Video className="w-4 h-4 text-indigo-600" />
                        <span>Online (Google Meet / Video Conference)</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4 text-amber-600" />
                        <span>In-Person Physical Office</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    Meeting Destination / Address
                  </span>
                  {iv.mode === 'Online' && iv.meetingLink ? (
                    <a
                      href={iv.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-indigo-600 hover:underline flex items-center truncate"
                    >
                      <Video className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                      {iv.meetingLink}
                    </a>
                  ) : (
                    <span className="font-semibold text-slate-800">
                      {iv.location || 'Headquarters Conference Room'}
                    </span>
                  )}
                </div>
              </div>

              {/* Recruiter Notes */}
              {iv.notes && (
                <div className="p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-xs text-indigo-950">
                  <span className="font-bold block mb-1">Preparation Advice & Agenda:</span>
                  <p className="leading-relaxed text-indigo-900">{iv.notes}</p>
                </div>
              )}

              {/* Action Button */}
              {iv.mode === 'Online' && iv.meetingLink && iv.status === 'Scheduled' && (
                <div className="pt-2 flex justify-end">
                  <a
                    href={iv.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center space-x-2"
                  >
                    <Video className="w-4 h-4" />
                    <span>Join Video Meeting Now</span>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InterviewsPage;
