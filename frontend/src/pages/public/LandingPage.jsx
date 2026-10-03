import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Search,
  ArrowRight,
  BrainCircuit,
  Target,
  BookOpen,
  ShieldCheck,
  Building,
  CheckCircle2,
  Users,
  Briefcase,
  TrendingUp,
  Award,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';

const LandingPage = () => {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { quickLogin, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/jobs?limit=6');
        if (res.data.success) {
          setFeaturedJobs(res.data.jobs.slice(0, 4));
        }
      } catch (e) {
        // Silently handle
      }
    };
    fetchJobs();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/jobs?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-8 overflow-hidden">
        {/* Glowing backdrop elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/15 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold mb-6 animate-subtle shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>HireMatch AI Platform</span>
            <span className="text-slate-300">•</span>
            <span className="text-indigo-600 font-semibold">Explainable AI Matching Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-[1.15] mb-6">
            Intelligent Recruitment with <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
              Resume Matching & Skill Gap AI
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 mb-10 leading-relaxed">
            Eliminate recruitment guesswork. Upload your resume to extract competencies, check precise eligibility criteria, analyze skill deficits, and receive a customized learning roadmap.
          </p>

          {/* Interactive Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-3xl mx-auto bg-white p-2.5 rounded-2xl shadow-xl border border-slate-200/90 flex flex-col sm:flex-row items-center gap-2 mb-8"
          >
            <div className="flex-1 flex items-center px-3 w-full">
              <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search job titles, skills (e.g. React, Python, Spring Boot)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs sm:text-sm bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400 py-2"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/25 transition flex items-center justify-center space-x-2"
            >
              <span>Search Opportunities</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Access Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold">
            <span className="text-slate-400">Quick Access:</span>
            <button
              onClick={() => quickLogin('candidate').then(() => navigate('/candidate/dashboard'))}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 border border-slate-200 transition"
            >
              Candidate Portal
            </button>
            <button
              onClick={() => quickLogin('recruiter').then(() => navigate('/recruiter/dashboard'))}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-50 hover:text-purple-600 text-slate-700 border border-slate-200 transition"
            >
              Recruiter Portal
            </button>
            <button
              onClick={() => quickLogin('admin').then(() => navigate('/admin/dashboard'))}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
            >
              Admin Portal
            </button>
          </div>
        </div>
      </section>

      {/* KPI Counters */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="text-center p-3">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 mb-1">50%</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Skill Weighting</div>
          </div>
          <div className="text-center p-3 border-l border-slate-100">
            <div className="text-3xl sm:text-4xl font-black text-indigo-600 mb-1">100%</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Explainable AI</div>
          </div>
          <div className="text-center p-3 border-l border-slate-100">
            <div className="text-3xl sm:text-4xl font-black text-purple-600 mb-1">10+</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Positions</div>
          </div>
          <div className="text-center p-3 border-l border-slate-100">
            <div className="text-3xl sm:text-4xl font-black text-emerald-600 mb-1">0ms</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deterministic Fallback</div>
          </div>
        </div>
      </section>

      {/* Key Architectural Pillars */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How the AI Recruitment Engine Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            A comprehensive pipeline bridging candidate capabilities and enterprise job requirements
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-5">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              1. Resume Parsing & Extraction
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload PDF or DOCX resumes. The engine extracts technical competencies, soft skills, educational credentials, work histories, and project implementations.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center mb-5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              2. Explainable Matching & Eligibility
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transparent weighting across Skills (50%), Experience (20%), Education (15%), and Role Fit (15%). Validates eligibility with an itemized checklist.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              3. Skill Gaps & Learning Roadmap
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Identifies missing required competencies and builds an actionable step-by-step curriculum with recommended projects and toggleable completion tracking.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Jobs Preview */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Featured Opportunities
            </h2>
            <p className="text-xs text-slate-500">Explore open positions across top hiring partners</p>
          </div>
          <Link
            to="/jobs"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center transition"
          >
            View All Openings <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {featuredJobs.map((job) => (
            <div
              key={job._id}
              className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-200 transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">
                      {job.title}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                      {job.companyId?.name} • {job.location}
                    </p>
                  </div>
                  <Badge variant="primary" size="sm">
                    {job.employmentType}
                  </Badge>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                  {job.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {job.requiredSkills?.slice(0, 4).map((s, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/60"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  ${job.salaryRange?.min?.toLocaleString()} - ${job.salaryRange?.max?.toLocaleString()} / yr
                </span>
                <Link
                  to={`/jobs/${job._id}`}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center"
                >
                  View Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Role Decision CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 p-8 sm:p-10 rounded-3xl text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 block mb-2">
                For Job Seekers
              </span>
              <h3 className="text-2xl font-black mb-3">Accelerate Your Engineering Career</h3>
              <p className="text-xs text-indigo-200/90 leading-relaxed mb-6">
                Receive unbiased match feedback against production requirements. Know your skill gaps before you interview.
              </p>
              <Link
                to="/register?role=candidate"
                className="inline-flex items-center px-5 py-2.5 rounded-xl bg-white text-indigo-950 font-bold text-xs hover:bg-indigo-50 transition shadow-sm"
              >
                Create Candidate Account <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-8 sm:p-10 rounded-3xl text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300 block mb-2">
                For Technical Recruiters
              </span>
              <h3 className="text-2xl font-black mb-3">Precision Talent Acquisition</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                Screen hundreds of applicants in minutes. Review explainable match percentages, shortlist top fits, and schedule interviews.
              </p>
              <Link
                to="/register?role=recruiter"
                className="inline-flex items-center px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 transition shadow-sm"
              >
                Register Recruiter Portal <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
