import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Save, Loader2, Plus } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const EditJobPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [experienceRequired, setExperienceRequired] = useState(0);
  const [qualification, setQualification] = useState('');
  const [minSalary, setMinSalary] = useState(0);
  const [maxSalary, setMaxSalary] = useState(0);
  const [description, setDescription] = useState('');
  const [responsibilitiesText, setResponsibilitiesText] = useState('');
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [preferredSkills, setPreferredSkills] = useState([]);
  const [newRequiredSkill, setNewRequiredSkill] = useState('');
  const [newPreferredSkill, setNewPreferredSkill] = useState('');
  const [status, setStatus] = useState('active');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${id}`);
        if (res.data.success) {
          const j = res.data.job;
          setTitle(j.title);
          setDepartment(j.department || 'Engineering');
          setLocation(j.location);
          setEmploymentType(j.employmentType || 'Full-time');
          setExperienceRequired(j.experienceRequired || 0);
          setQualification(j.qualification || '');
          setMinSalary(j.salaryRange?.min || 0);
          setMaxSalary(j.salaryRange?.max || 0);
          setDescription(j.description || '');
          setResponsibilitiesText((j.responsibilities || []).join('\n'));
          setRequiredSkills(j.requiredSkills || []);
          setPreferredSkills(j.preferredSkills || []);
          setStatus(j.status || 'active');
        }
      } catch (err) {
        addToast('Failed to load job details.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const responsibilities = responsibilitiesText.split('\n').map((r) => r.trim()).filter(Boolean);
      const res = await api.put(`/jobs/${id}`, {
        title,
        department,
        location,
        employmentType,
        experienceRequired: Number(experienceRequired),
        qualification,
        salaryRange: { min: Number(minSalary), max: Number(maxSalary), currency: 'USD' },
        description,
        responsibilities,
        requiredSkills,
        preferredSkills,
        status,
      });

      if (res.data.success) {
        addToast('Job posting updated successfully!', 'success');
        navigate('/recruiter/jobs');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update job.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Retrieving job posting data..." size="lg" />;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <Link
        to="/recruiter/jobs"
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to My Jobs
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Edit Job Posting</h2>
          <p className="text-xs text-slate-500">Update job requirements, description, or status</p>
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
        >
          <option value="active">Active Posting</option>
          <option value="closed">Closed / Archived</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6 text-xs">
        <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Job Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Experience Required</label>
              <input
                type="number"
                value={experienceRequired}
                onChange={(e) => setExperienceRequired(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Link to="/recruiter/jobs" className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/30 transition flex items-center space-x-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Updates</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditJobPage;
