import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Building2, Globe, MapPin, FileText, Save, Loader2 } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CompanyProfilePage = () => {
  const [company, setCompany] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [logo, setLogo] = useState('');
  const [designation, setDesignation] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/recruiters/profile');
        if (res.data.success && res.data.profile) {
          const comp = res.data.profile.companyId;
          setCompany(comp);
          setName(comp?.name || '');
          setDescription(comp?.description || '');
          setWebsite(comp?.website || '');
          setIndustry(comp?.industry || '');
          setLocation(comp?.location || '');
          setLogo(comp?.logo || '');
          setDesignation(res.data.profile.designation || '');
        }
      } catch (err) {
        addToast('Failed to load company profile.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/recruiters/profile', { designation });
      const compRes = await api.put('/recruiters/company', {
        name,
        description,
        website,
        industry,
        location,
        logo,
      });

      if (compRes.data.success) {
        addToast('Company & Recruiter profile updated successfully!', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save company information.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Retrieving company information..." size="lg" />;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          Company & Recruiter Profile
        </h2>
        <p className="text-xs text-slate-500">
          Manage your recruitment process efficiently. Customize your organization branding that appears on all job postings and candidate invitations.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
            <Building2 className="w-4 h-4 text-indigo-600 mr-2" /> Company Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Company Name *
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
                Industry Sector
              </label>
              <input
                type="text"
                placeholder="e.g. Cloud & Enterprise SaaS"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Website URL
              </label>
              <input
                type="url"
                placeholder="https://company.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Headquarters Location
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
              Company Overview & Culture
            </label>
            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 resize-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Your Recruiter Designation
            </label>
            <input
              type="text"
              placeholder="e.g. Senior Technical Recruiter"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800"
            />
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition flex items-center space-x-2 shadow-sm disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CompanyProfilePage;
