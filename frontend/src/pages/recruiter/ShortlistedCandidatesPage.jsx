import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Users, Calendar, Eye, Building, Sparkles } from 'lucide-react';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ScheduleInterviewModal from '../../components/recruiter/ScheduleInterviewModal';

const ShortlistedCandidatesPage = () => {
  const [shortlisted, setShortlisted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  const fetchShortlisted = async () => {
    setLoading(true);
    try {
      const res = await api.get('/jobs/recruiter/my-jobs');
      if (res.data.success) {
        const jobIds = res.data.jobs.map((j) => j._id);
        const appsPromises = jobIds.map((id) =>
          api.get(`/applications/job/${id}?status=Shortlisted`)
        );
        const appsResponses = await Promise.all(appsPromises);
        const allShortlisted = appsResponses.flatMap((r) => r.data.applications || []);
        setShortlisted(allShortlisted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShortlisted();
  }, []);

  if (loading) return <LoadingSpinner text="Retrieving shortlisted candidate pool..." size="lg" />;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          Shortlisted Candidates ({shortlisted.length})
        </h2>
        <p className="text-xs text-slate-500">
          Candidates who passed automated criteria and recruiter technical screening
        </p>
      </div>

      {shortlisted.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Shortlisted Candidates"
          description="Review your active job applicants and shortlist top candidates to prepare them for interview rounds."
          actionLabel="View Posted Jobs"
          onAction={() => (window.location.href = '/recruiter/jobs')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shortlisted.map((app) => (
            <div
              key={app._id}
              className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      {app.candidateId?.name?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{app.candidateId?.name}</h4>
                      <p className="text-xs text-slate-400">{app.candidateId?.email}</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-emerald-600 px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-200">
                    {app.matchPercentage}% Fit
                  </span>
                </div>

                <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Position Applied
                  </span>
                  <span className="font-bold text-slate-800">{app.jobId?.title}</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {app.matchedSkills?.slice(0, 4).map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-100"
                    >
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <Link
                  to={`/recruiter/candidate/${app._id}`}
                  className="font-bold text-slate-600 hover:text-slate-900 flex items-center"
                >
                  <Eye className="w-3.5 h-3.5 mr-1" /> View Profile
                </Link>

                <button
                  onClick={() => setSelectedApp(app)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition flex items-center"
                >
                  <Calendar className="w-3.5 h-3.5 mr-1.5" /> Schedule Interview
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedApp && (
        <ScheduleInterviewModal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          application={selectedApp}
          onScheduled={() => {
            fetchShortlisted();
          }}
        />
      )}
    </div>
  );
};

export default ShortlistedCandidatesPage;
