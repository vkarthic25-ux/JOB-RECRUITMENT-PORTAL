import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Briefcase,
  MapPin,
  DollarSign,
  GraduationCap,
  Clock,
  ArrowLeft,
  Save,
  Plus,
  Loader2,
} from 'lucide-react';

const CreateJobPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('San Francisco, CA');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [experienceRequired, setExperienceRequired] = useState(2);
  const [qualification, setQualification] = useState("Bachelor's Degree in Computer Science or related field");
  const [minSalary, setMinSalary] = useState(110000);
  const [maxSalary, setMaxSalary] = useState(150000);
  const [description, setDescription] = useState('');
  const [responsibilitiesText, setResponsibilitiesText] = useState(
    'Architect and implement scalable web services and cloud features.\nCollaborate with cross-functional product and engineering teams.\nParticipate in code reviews and advocate for engineering best practices.'
  );

  const [requiredSkills, setRequiredSkills] = useState(['React', 'Node.js', 'TypeScript', 'MongoDB']);
  const [newRequiredSkill, setNewRequiredSkill] = useState('');

  const [preferredSkills, setPreferredSkills] = useState(['Docker', 'AWS', 'Tailwind CSS']);
  const [newPreferredSkill, setNewPreferredSkill] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const handleAddReqSkill = (e) => {
    e.preventDefault();
    if (newRequiredSkill.trim() && !requiredSkills.includes(newRequiredSkill.trim())) {
      setRequiredSkills([...requiredSkills, newRequiredSkill.trim()]);
      setNewRequiredSkill('');
    }
  };

  const handleAddPrefSkill = (e) => {
    e.preventDefault();
    if (newPreferredSkill.trim() && !preferredSkills.includes(newPreferredSkill.trim())) {
      setPreferredSkills([...preferredSkills, newPreferredSkill.trim()]);
      setNewPreferredSkill('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || requiredSkills.length === 0) {
      addToast('Please fill out all mandatory fields and specify required skills.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const responsibilities = responsibilitiesText
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean);

      const res = await api.post('/jobs', {
        title,
        department,
        location,
        employmentType,
        experienceRequired: Number(experienceRequired),
        qualification,
        salaryRange: {
          min: Number(minSalary),
          max: Number(maxSalary),
          currency: 'USD',
        },
        description,
        responsibilities,
        requiredSkills,
        preferredSkills,
        status: 'active',
      });

      if (res.data.success) {
        addToast('Job published successfully! Now visible in candidate searches.', 'success');
        navigate('/recruiter/jobs');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to publish job.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <Link
        to="/recruiter/jobs"
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to My Jobs
      </Link>

      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          Create & Publish New Job Posting
        </h2>
        <p className="text-xs text-slate-500">
          Define clear skill requirements and eligibility thresholds for the AI candidate matching engine
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Basic Position Details */}
        <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Position Overview
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Job Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Full Stack Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Department
              </label>
              <input
                type="text"
                placeholder="Engineering / Data Platform"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Location *
              </label>
              <input
                type="text"
                required
                placeholder="San Francisco, CA or Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Employment Type
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800"
              >
                <option value="Full-time">Full-time</option>
                <option value="Remote">Remote</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Minimum Experience Required (Years)
              </label>
              <input
                type="number"
                min="0"
                value={experienceRequired}
                onChange={(e) => setExperienceRequired(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Min Annual Salary ($ USD)
              </label>
              <input
                type="number"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Max Annual Salary ($ USD)
              </label>
              <input
                type="number"
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Required Educational Qualification
            </label>
            <input
              type="text"
              placeholder="e.g. Bachelor's Degree in Computer Science or related"
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
            />
          </div>
        </div>

        {/* Required & Preferred Skills Config */}
        <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            AI Skill Criteria Configuration (50% Match Weight)
          </h3>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Required Mandatory Skills * ({requiredSkills.length})
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Enter skill (e.g. React, Spring Boot, AWS)..."
                value={newRequiredSkill}
                onChange={(e) => setNewRequiredSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddReqSkill(e))}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
              <button
                type="button"
                onClick={handleAddReqSkill}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold"
              >
                + Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {requiredSkills.map((s, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl font-semibold border border-indigo-200 flex items-center"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => setRequiredSkills(requiredSkills.filter((item) => item !== s))}
                    className="ml-2 text-indigo-400 hover:text-indigo-800 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Preferred / Nice-to-Have Skills ({preferredSkills.length})
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Enter skill (e.g. Kubernetes, Redis)..."
                value={newPreferredSkill}
                onChange={(e) => setNewPreferredSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPrefSkill(e))}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
              <button
                type="button"
                onClick={handleAddPrefSkill}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold"
              >
                + Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {preferredSkills.map((s, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-slate-100 text-slate-700 rounded-xl font-semibold border border-slate-200 flex items-center"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => setPreferredSkills(preferredSkills.filter((item) => item !== s))}
                    className="ml-2 text-slate-400 hover:text-slate-700 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Narrative Description & Responsibilities */}
        <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Description & Key Duties
          </h3>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Job Description *
            </label>
            <textarea
              rows="4"
              required
              placeholder="Comprehensive summary of team mission and role expectations..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 resize-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Responsibilities (one per line)
            </label>
            <textarea
              rows="4"
              placeholder="Design and construct scalable backend services...&#10;Write automated unit and integration tests..."
              value={responsibilitiesText}
              onChange={(e) => setResponsibilitiesText(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-[11px]"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Link
            to="/recruiter/jobs"
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/30 transition flex items-center space-x-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing Job...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Publish Job Posting</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateJobPage;
