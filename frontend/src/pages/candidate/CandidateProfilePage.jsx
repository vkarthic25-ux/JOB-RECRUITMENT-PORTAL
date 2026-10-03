import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Code2,
  FolderGit2,
  Award,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import ProgressBar from '../../components/common/ProgressBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CandidateProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');

  const [softSkills, setSoftSkills] = useState([]);
  const [newSoftSkill, setNewSoftSkill] = useState('');

  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [completion, setCompletion] = useState(25);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/candidates/profile');
        if (res.data.success) {
          const p = res.data.profile;
          const u = res.data.user;
          setName(u.name || '');
          setPhone(u.phone || '');
          setLocation(u.location || '');
          setHeadline(p.headline || '');
          setBio(p.bio || '');
          setSkills(p.skills || []);
          setSoftSkills(p.softSkills || []);
          setEducation(p.education || []);
          setExperience(p.experience || []);
          setProjects(p.projects || []);
          setCertifications(p.certifications || []);
          setCompletion(p.profileCompletion || 25);
        }
      } catch (err) {
        addToast('Unable to load profile details.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddSoftSkill = (e) => {
    e.preventDefault();
    if (newSoftSkill.trim() && !softSkills.includes(newSoftSkill.trim())) {
      setSoftSkills([...softSkills, newSoftSkill.trim()]);
      setNewSoftSkill('');
    }
  };

  const handleRemoveSoftSkill = (skillToRemove) => {
    setSoftSkills(softSkills.filter((s) => s !== skillToRemove));
  };

  const handleAddEducation = () => {
    setEducation([
      ...education,
      { degree: '', institution: '', fieldOfStudy: '', startYear: '2020', endYear: '2024' },
    ]);
  };

  const handleRemoveEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const handleAddExperience = () => {
    setExperience([
      ...experience,
      { title: '', company: '', years: 1, description: '' },
    ]);
  };

  const handleRemoveExperience = (index) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const handleAddProject = () => {
    setProjects([
      ...projects,
      { title: '', description: '', technologies: [], link: '' },
    ]);
  };

  const handleRemoveProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/candidates/profile', {
        name,
        phone,
        location,
        headline,
        bio,
        skills,
        softSkills,
        education,
        experience,
        projects,
        certifications,
      });

      if (res.data.success) {
        addToast('Profile saved and completion score updated!', 'success');
        setCompletion(res.data.profile.profileCompletion);
        await refreshUser();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save profile changes.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading candidate profile..." size="lg" />;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header & Completion card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Candidate Professional Profile
          </h2>
          <p className="text-xs text-slate-500">
            Keep your skills and qualifications updated for accurate AI job matching
          </p>
        </div>

        <div className="w-full sm:w-64">
          <ProgressBar
            label="Profile Completion"
            value={completion}
            colorScheme={completion >= 80 ? 'emerald' : 'indigo'}
          />
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Basic Personal Information */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
            <User className="w-4 h-4 text-indigo-600 mr-2" /> Basic Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="San Francisco, CA"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Professional Headline
            </label>
            <input
              type="text"
              placeholder="e.g. Senior Full Stack Developer | React, Node.js & Distributed Systems"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Career Bio & Summary
            </label>
            <textarea
              rows="3"
              placeholder="Brief summary of your background, experience, and passions..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 resize-none"
            />
          </div>
        </div>

        {/* Technical & Soft Skills Manager */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
            <Code2 className="w-4 h-4 text-indigo-600 mr-2" /> Technical & Soft Skills
          </h3>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Technical Competencies ({skills.length})
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Add skill (e.g. Docker, TypeScript, AWS)..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill(e))}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" /> Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/80"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-2 hover:text-indigo-900 text-indigo-400 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Soft Skills ({softSkills.length})
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Add soft skill (e.g. Communication, Agile)..."
                value={newSoftSkill}
                onChange={(e) => setNewSoftSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSoftSkill(e))}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800"
              />
              <button
                type="button"
                onClick={handleAddSoftSkill}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" /> Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {softSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 font-semibold border border-purple-200/80"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSoftSkill(skill)}
                    className="ml-2 hover:text-purple-900 text-purple-400 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Work Experience */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center">
              <Briefcase className="w-4 h-4 text-indigo-600 mr-2" /> Work Experience
            </h3>
            <button
              type="button"
              onClick={handleAddExperience}
              className="text-indigo-600 font-bold hover:underline flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Experience
            </button>
          </div>

          {experience.map((exp, idx) => (
            <div key={idx} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3 relative">
              <button
                type="button"
                onClick={() => handleRemoveExperience(idx)}
                className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Software Engineer"
                    value={exp.title || ''}
                    onChange={(e) => {
                      const updated = [...experience];
                      updated[idx].title = e.target.value;
                      setExperience(updated);
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">Company</label>
                  <input
                    type="text"
                    placeholder="e.g. CloudTech Inc."
                    value={exp.company || ''}
                    onChange={(e) => {
                      const updated = [...experience];
                      updated[idx].company = e.target.value;
                      setExperience(updated);
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">Duration (Years)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="2"
                    value={exp.years || 1}
                    onChange={(e) => {
                      const updated = [...experience];
                      updated[idx].years = Number(e.target.value);
                      setExperience(updated);
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase mb-1">Description & Achievements</label>
                <textarea
                  rows="2"
                  placeholder="Key contributions and technologies..."
                  value={exp.description || ''}
                  onChange={(e) => {
                    const updated = [...experience];
                    updated[idx].description = e.target.value;
                    setExperience(updated);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 resize-none"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Education */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center">
              <GraduationCap className="w-4 h-4 text-indigo-600 mr-2" /> Education Credentials
            </h3>
            <button
              type="button"
              onClick={handleAddEducation}
              className="text-indigo-600 font-bold hover:underline flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Education
            </button>
          </div>

          {education.map((edu, idx) => (
            <div key={idx} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3 relative">
              <button
                type="button"
                onClick={() => handleRemoveEducation(idx)}
                className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">Degree Program</label>
                  <input
                    type="text"
                    placeholder="e.g. B.Tech Computer Science"
                    value={edu.degree || ''}
                    onChange={(e) => {
                      const updated = [...education];
                      updated[idx].degree = e.target.value;
                      setEducation(updated);
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">Institution / University</label>
                  <input
                    type="text"
                    placeholder="e.g. State University"
                    value={edu.institution || ''}
                    onChange={(e) => {
                      const updated = [...education];
                      updated[idx].institution = e.target.value;
                      setEducation(updated);
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sticky Save Bar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/25 transition flex items-center space-x-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CandidateProfilePage;
