import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  Calendar,
  Sparkles,
  Info,
  GraduationCap,
  Briefcase,
  Code2,
  FolderGit2,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import MatchScoreCard from '../../components/candidate/MatchScoreCard';
import EligibilityCard from '../../components/candidate/EligibilityCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ScheduleInterviewModal from '../../components/recruiter/ScheduleInterviewModal';

const CandidateDetailsPage = () => {
  const { id } = useParams(); // Application ID
  const [application, setApplication] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const { addToast } = useToast();

  const fetchDetails = async () => {
    try {
      const res = await api.get(`/applications/${id}`);
      if (res.data.success) {
        setApplication(res.data.application);
        setProfile(res.data.profile);
      }
    } catch (err) {
      addToast('Failed to load candidate application.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleUpdateStatus = async (newStatus) => {
    try {
      const res = await api.put(`/applications/${id}/status`, { status: newStatus });
      if (res.data.success) {
        addToast(`Candidate status updated to ${newStatus}.`, 'success');
        setApplication({ ...application, status: newStatus });
      }
    } catch (err) {
      addToast('Failed to update status.', 'error');
    }
  };

  if (loading) return <LoadingSpinner text="Retrieving candidate portfolio and AI scores..." size="lg" />;
  if (!application) return <div className="p-8 text-center text-slate-500">Applicant not found.</div>;

  const candidate = application.candidateId;
  const job = application.jobId;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      <Link
        to={`/recruiter/jobs/${job?._id}/applicants`}
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Applicants
      </Link>

      {/* Mandatory Recruiter AI Disclaimer Banner */}
      <div className="bg-indigo-50/90 border border-indigo-200/80 p-4 rounded-2xl flex items-start space-x-3 text-xs text-indigo-950">
        <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Recruiter Decision Support Notice: </span>
          AI-generated matching is decision support only. Recruiters should independently review candidate information before making hiring decisions.
        </div>
      </div>

      {/* Candidate Top Card & Hiring Decision Actions */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md">
            {candidate?.name?.charAt(0) || 'C'}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-black text-slate-900">{candidate?.name}</h2>
              <Badge variant={application.status}>{application.status}</Badge>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Applied for <span className="font-bold text-slate-800">{job?.title}</span> • {new Date(application.appliedAt).toLocaleDateString()}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
              <span className="flex items-center"><Mail className="w-3.5 h-3.5 mr-1" /> {candidate?.email}</span>
              {candidate?.phone && <span className="flex items-center"><Phone className="w-3.5 h-3.5 mr-1" /> {candidate?.phone}</span>}
              {candidate?.location && <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" /> {candidate?.location}</span>}
            </div>
          </div>
        </div>

        {/* Decision Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleUpdateStatus('Shortlisted')}
            className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold transition flex items-center border border-amber-200"
          >
            <CheckCircle className="w-4 h-4 mr-1.5" /> Shortlist
          </button>
          <button
            onClick={() => setInterviewModalOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center shadow-sm"
          >
            <Calendar className="w-4 h-4 mr-1.5" /> Schedule Interview
          </button>
          <button
            onClick={() => handleUpdateStatus('Selected')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center shadow-sm"
          >
            Select Candidate
          </button>
          <button
            onClick={() => handleUpdateStatus('Rejected')}
            className="px-3 py-2.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition"
          >
            Reject
          </button>
        </div>
      </div>

      {/* Grid: AI Analysis Breakdown & Detailed Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: AI Matching & Eligibility */}
        <div className="space-y-6">
          <MatchScoreCard
            matchAnalysis={{
              matchPercentage: application.matchPercentage,
              skillMatch: application.skillMatch,
              experienceMatch: application.experienceMatch,
              educationMatch: application.educationMatch,
              roleMatch: application.roleMatch,
              matchedSkills: application.matchedSkills,
              missingSkills: application.missingSkills,
              whyMatched: `Calculated from skills fit (${application.skillMatch}%), experience fit (${application.experienceMatch}%), and degree requirements.`,
            }}
          />

          <EligibilityCard
            eligibilityStatus={application.eligibilityStatus}
            eligibilityReasons={application.eligibilityReasons}
          />
        </div>

        {/* Right: Candidate Profile & Experience Details */}
        <div className="space-y-6">
          {/* Headline & Bio */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Professional Summary
            </h3>
            <p className="font-semibold text-indigo-700">{profile?.headline || 'Candidate'}</p>
            <p className="text-slate-600 leading-relaxed">
              {profile?.bio || 'Candidate profile on HireMatch AI platform.'}
            </p>
          </div>

          {/* Education */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
              <GraduationCap className="w-4 h-4 text-indigo-600 mr-2" /> Education Credentials
            </h3>
            {profile?.education && profile.education.length > 0 ? (
              profile.education.map((edu, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl">
                  <p className="font-bold text-slate-900">{edu.degree}</p>
                  <p className="text-slate-500">{edu.institution} {edu.endYear ? `(${edu.endYear})` : ''}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-400">No education entries recorded.</p>
            )}
          </div>

          {/* Work Experience */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
              <Briefcase className="w-4 h-4 text-indigo-600 mr-2" /> Professional Experience
            </h3>
            {profile?.experience && profile.experience.length > 0 ? (
              profile.experience.map((exp, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{exp.title}</span>
                    <span className="text-indigo-600">{exp.years || 1} yrs</span>
                  </div>
                  <p className="text-slate-500">{exp.company}</p>
                  {exp.description && <p className="text-slate-600 pt-1">{exp.description}</p>}
                </div>
              ))
            ) : (
              <p className="text-slate-400">No experience records attached.</p>
            )}
          </div>

          {/* Projects */}
          {profile?.projects && profile.projects.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-3 text-xs">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
                <FolderGit2 className="w-4 h-4 text-indigo-600 mr-2" /> Featured Projects
              </h3>
              {profile.projects.map((proj, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <p className="font-bold text-slate-900">{proj.title}</p>
                  <p className="text-slate-600">{proj.description}</p>
                  {proj.technologies && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {proj.technologies.map((t, tidx) => (
                        <span key={tidx} className="px-2 py-0.5 rounded bg-white text-[10px] text-slate-700 border">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Schedule Interview Modal */}
      {interviewModalOpen && (
        <ScheduleInterviewModal
          isOpen={interviewModalOpen}
          onClose={() => setInterviewModalOpen(false)}
          application={application}
          onScheduled={() => {
            fetchDetails();
          }}
        />
      )}
    </div>
  );
};

export default CandidateDetailsPage;
