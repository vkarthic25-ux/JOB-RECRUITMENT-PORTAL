import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Filter,
  ArrowRight,
  Sparkles,
  Calendar,
  Building,
  CheckCircle,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const JobSearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [employmentType, setEmploymentType] = useState('All');
  const [experience, setExperience] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [sort, setSort] = useState('newest');

  const { isCandidate, isAuthenticated } = useAuth();

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (location) params.append('location', location);
      if (employmentType && employmentType !== 'All') params.append('employmentType', employmentType);
      if (experience !== '') params.append('experienceRequired', experience);
      if (minSalary !== '') params.append('minSalary', minSalary);
      if (sort) params.append('sort', sort);

      const res = await api.get(`/jobs?${params.toString()}`);
      if (res.data.success) {
        setJobs(res.data.jobs);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [employmentType, experience, minSalary, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-800/60 border border-indigo-700/60 text-indigo-200 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>AI Opportunity Matcher</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">
            Explore Open Engineering Positions
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
            {isCandidate
              ? 'Real-time AI matching active! Positions are automatically evaluated against your uploaded resume.'
              : 'Search verified job listings with transparent requirements and qualifications.'}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Title, skill, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
            />
          </div>

          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Location or 'Remote'..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            Apply Filters
          </button>
        </form>

        {/* Secondary filters row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs font-medium text-slate-600">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center text-slate-400 font-bold text-[11px] uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5 mr-1" /> Filters:
            </span>

            {/* Employment Type */}
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 text-slate-700"
            >
              <option value="All">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Remote">Remote</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>

            {/* Experience */}
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 text-slate-700"
            >
              <option value="">Any Experience</option>
              <option value="0">Entry / Fresher (0 yrs)</option>
              <option value="2">Up to 2 years</option>
              <option value="3">Up to 3 years</option>
              <option value="5">Up to 5 years</option>
            </select>
          </div>

          {/* Sort Control */}
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sort By:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="newest">Newest First</option>
              {isCandidate && <option value="match">Highest AI Match %</option>}
              <option value="salary_high">Salary (High to Low)</option>
              <option value="experience_low">Experience (Least to Most)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Listing */}
      {loading ? (
        <LoadingSpinner text="Searching opportunities..." size="lg" />
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No jobs matched your criteria"
          description="Try broadening your search keywords or resetting filters to view all openings."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setLocation('');
            setEmploymentType('All');
            setExperience('');
            fetchJobs();
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-200 transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 pr-3">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">
                      <Link to={`/jobs/${job._id}`}>{job.title}</Link>
                    </h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5 flex items-center">
                      <Building className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {job.companyId?.name || 'Company'} • {job.location}
                    </p>
                  </div>

                  {/* AI Match badge if candidate */}
                  {job.matchPercentage !== undefined ? (
                    <div className="flex flex-col items-end">
                      <span
                        className={`text-xs font-extrabold px-2.5 py-1 rounded-full border ${
                          job.matchPercentage >= 75
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : job.matchPercentage >= 50
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {job.matchPercentage}% Match
                      </span>
                      {job.eligibilityStatus && (
                        <span className="text-[10px] font-semibold text-slate-400 mt-1">
                          {job.eligibilityStatus}
                        </span>
                      )}
                    </div>
                  ) : (
                    <Badge variant="primary" size="sm">
                      {job.employmentType}
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                  {job.description}
                </p>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {job.requiredSkills?.map((s, idx) => {
                    const isMatched = job.matchedSkills?.includes(s);
                    return (
                      <span
                        key={idx}
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                          isMatched
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                            : 'bg-slate-100 text-slate-700 border-slate-200/60'
                        }`}
                      >
                        {isMatched ? '✓ ' : ''}
                        {s}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-extrabold text-slate-900 block">
                    ${job.salaryRange?.min?.toLocaleString()} - ${job.salaryRange?.max?.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {job.experienceRequired === 0
                      ? 'No experience required'
                      : `${job.experienceRequired}+ yrs experience`}
                  </span>
                </div>

                <Link
                  to={`/jobs/${job._id}`}
                  className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold transition flex items-center shadow-sm"
                >
                  View Job <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobSearchPage;
