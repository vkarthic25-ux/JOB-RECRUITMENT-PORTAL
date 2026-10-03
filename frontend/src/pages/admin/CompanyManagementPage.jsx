import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Building, Search, Globe, MapPin, Briefcase, RefreshCw, ExternalLink } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';

const CompanyManagementPage = () => {
  const { showToast } = useToast();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/companies');
      if (res.data.success) {
        setCompanies(res.data.companies);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch companies', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter((comp) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      comp.name?.toLowerCase().includes(q) ||
      comp.industry?.toLowerCase().includes(q) ||
      comp.location?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Building className="w-8 h-8 text-indigo-600" />
            <span>Partner Companies</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Registered corporate employers and enterprise organizations hiring on the platform
          </p>
        </div>
        <button
          onClick={fetchCompanies}
          className="inline-flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition shadow-sm"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by company name, industry, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>
        <div className="text-xs font-bold text-slate-500 hidden sm:block">
          Total Organizations: <span className="text-indigo-600">{companies.length}</span>
        </div>
      </div>

      {/* Company Cards Grid */}
      {loading ? (
        <LoadingSpinner text="Retrieving verified enterprise employers..." />
      ) : filteredCompanies.length === 0 ? (
        <EmptyState
          title="No companies found"
          description="Try changing your search term to find corporate employers."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((comp) => (
            <div
              key={comp._id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-black text-xl flex items-center justify-center shadow-md">
                    {comp.name ? comp.name.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                    {comp.industry || 'Technology'}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{comp.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-3 mt-2 leading-relaxed">
                  {comp.description || 'No corporate summary available.'}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{comp.location || 'Global Remote'}</span>
                  </div>
                  {comp.website && (
                    <div className="flex items-center space-x-2">
                      <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <a
                        href={comp.website.startsWith('http') ? comp.website : `https://${comp.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:underline flex items-center space-x-1"
                      >
                        <span className="truncate max-w-[200px]">{comp.website}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Joined: {formatDate(comp.createdAt)}</span>
                <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompanyManagementPage;
