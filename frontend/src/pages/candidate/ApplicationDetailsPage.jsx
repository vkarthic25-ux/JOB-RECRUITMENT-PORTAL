import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  ArrowLeft,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  Video,
  MapPin,
  Sparkles,
  FileText,
  AlertCircle,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ApplicationDetailsPage = () => {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const res = await api.get(`/applications/${id}`);
        if (res.data.success) {
          setApplication(res.data.application);

          // If interview is scheduled, check interview details
          if (res.data.application.status === 'Interview Scheduled') {
            const ivRes = await api.get('/interviews');
            if (ivRes.data.success) {
              const matchedIv = ivRes.data.interviews.find(
                (iv) => iv.applicationId?._id === id || iv.applicationId === id
              );
              setInterview(matchedIv);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load application details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplication();
  }, [id]);

  if (loading) return <LoadingSpinner text="Retrieving application tracking details..." size="lg" />;
  if (!application) return <div className="p-8 text-center text-slate-500">Application not found.</div>;

  const PIPELINE_STEPS = [
    'Applied',
    'Under Review',
    'Shortlisted',
    'Interview Scheduled',
    application.status === 'Rejected' ? 'Rejected' : 'Selected',
  ];

  const currentStatusIndex = PIPELINE_STEPS.indexOf(application.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Back button */}
      <Link
        to="/candidate/applications"
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Applications List
      </Link>

      {/* Header Card */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <h2 className="text-xl font-black text-slate-900">{application.jobId?.title}</h2>
            <Badge variant={application.status}>{application.status}</Badge>
          </div>
          <p className="text-xs text-slate-500 flex items-center space-x-2">
            <span className="font-semibold text-indigo-600 flex items-center">
              <Building className="w-3.5 h-3.5 mr-1" /> {application.jobId?.companyId?.name}
            </span>
            <span>•</span>
            <span>Applied on {new Date(application.appliedAt).toLocaleDateString()}</span>
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-3xl font-extrabold text-emerald-600">
            {application.matchPercentage}%
          </span>
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
            Overall AI Compatibility
          </span>
        </div>
      </div>

      {/* Visual Tracking Pipeline Timeline */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
          Application Hiring Pipeline Status
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 relative">
          {PIPELINE_STEPS.map((step, idx) => {
            const isCompleted = idx <= currentStatusIndex && application.status !== 'Rejected';
            const isCurrent = step === application.status;
            const isRejected = step === 'Rejected' && application.status === 'Rejected';

            return (
              <div
                key={idx}
                className={`p-3 rounded-2xl border text-center relative transition-all ${
                  isRejected
                    ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold'
                    : isCurrent
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold shadow-sm'
                    : isCompleted
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full mx-auto mb-2 flex items-center justify-center text-xs font-bold ${
                    isRejected
                      ? 'bg-rose-600 text-white'
                      : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <div className="text-xs">{step}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interview Details if Scheduled */}
      {interview && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-6 rounded-3xl space-y-4">
          <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <span>Scheduled Interview Details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase block">Date & Time</span>
              <span className="font-extrabold text-slate-900 text-sm">
                {interview.date} at {interview.time}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase block">Mode</span>
              <span className="font-semibold text-slate-800">{interview.mode}</span>
            </div>
          </div>

          {interview.mode === 'Online' && interview.meetingLink && (
            <div className="pt-2">
              <a
                href={interview.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition"
              >
                <Video className="w-4 h-4 mr-2" /> Launch Google Meet Video Room
              </a>
            </div>
          )}

          {interview.notes && (
            <div className="p-3 bg-white/70 rounded-xl border border-emerald-100 text-xs text-slate-700">
              <span className="font-bold block text-slate-900 mb-1">Recruiter Notes:</span>
              {interview.notes}
            </div>
          )}
        </div>
      )}

      {/* Itemized Match Evaluation Summary */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 text-xs">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
          <Sparkles className="w-4 h-4 text-indigo-600 mr-2" />
          Application Evaluation Breakdown
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 p-3 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Skills Fit</span>
            <span className="text-base font-extrabold text-slate-900">{application.skillMatch}%</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Experience Fit</span>
            <span className="text-base font-extrabold text-slate-900">{application.experienceMatch}%</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Education Fit</span>
            <span className="text-base font-extrabold text-slate-900">{application.educationMatch}%</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Eligibility</span>
            <span className="text-sm font-bold text-emerald-700">{application.eligibilityStatus}</span>
          </div>
        </div>

        {/* Reasons checklist */}
        <div className="space-y-1.5 pt-2">
          {application.eligibilityReasons?.map((reason, idx) => (
            <div key={idx} className="p-2 rounded-lg bg-slate-50 text-slate-700 font-medium">
              {reason}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsPage;
