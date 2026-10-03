import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Sparkles,
  Bell,
  User,
  LogOut,
  Briefcase,
  ChevronDown,
  Layers,
  FileText,
  Calendar,
  CheckCircle,
  Shield,
  Menu,
  X,
  Zap,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, quickLogin, isCandidate, isRecruiter, isAdmin, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleQuickSwitch = async (role) => {
    setDemoMenuOpen(false);
    const res = await quickLogin(role);
    if (res.success) {
      addToast(`Switched active role to ${role.toUpperCase()}`, 'success');
      if (role === 'candidate') navigate('/candidate/dashboard');
      else if (role === 'recruiter') navigate('/recruiter/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
    }
  };

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully', 'info');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition">
                <Sparkles className="w-5 h-5 text-indigo-100" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition flex items-center">
                  HireMatch<span className="text-indigo-600">AI</span>
                </span>
                <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase -mt-1">
                  AI-Powered Recruitment
                </span>
              </div>
            </Link>

            {/* Role indicator pill */}
            {isAuthenticated && (
              <span className="hidden md:inline-flex items-center ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                {user?.role} Portal
              </span>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2 text-xs font-semibold">
            {/* Candidate Nav */}
            {isCandidate && (
              <>
                <Link
                  to="/candidate/dashboard"
                  className={`px-3 py-2 rounded-xl transition ${
                    isActive('/candidate/dashboard')
                      ? 'bg-indigo-50 text-indigo-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/candidate/jobs"
                  className={`px-3 py-2 rounded-xl transition ${
                    isActive('/candidate/jobs')
                      ? 'bg-indigo-50 text-indigo-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Explore Jobs
                </Link>
                <Link
                  to="/candidate/ai-analysis"
                  className={`px-3 py-2 rounded-xl transition ${
                    isActive('/candidate/ai-analysis')
                      ? 'bg-indigo-50 text-indigo-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  AI Resume Analyzer
                </Link>
                <Link
                  to="/candidate/applications"
                  className={`px-3 py-2 rounded-xl transition ${
                    isActive('/candidate/applications')
                      ? 'bg-indigo-50 text-indigo-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Applications
                </Link>
                <Link
                  to="/candidate/interviews"
                  className={`px-3 py-2 rounded-xl transition ${
                    isActive('/candidate/interviews')
                      ? 'bg-indigo-50 text-indigo-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Interviews
                </Link>
              </>
            )}

            {/* Recruiter Nav */}
            {isRecruiter && (
              <>
                <Link
                  to="/recruiter/dashboard"
                  className={`px-3 py-2 rounded-xl transition ${
                    isActive('/recruiter/dashboard')
                      ? 'bg-indigo-50 text-indigo-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/recruiter/jobs"
                  className={`px-3 py-2 rounded-xl transition ${
                    isActive('/recruiter/jobs')
                      ? 'bg-indigo-50 text-indigo-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Manage Jobs
                </Link>
                <Link
                  to="/recruiter/create-job"
                  className={`px-3 py-2 rounded-xl transition ${
                    isActive('/recruiter/create-job')
                      ? 'bg-indigo-50 text-indigo-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  + Post Job
                </Link>
                <Link
                  to="/recruiter/interviews"
                  className={`px-3 py-2 rounded-xl transition ${
                    isActive('/recruiter/interviews')
                      ? 'bg-indigo-50 text-indigo-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Interviews
                </Link>
                <Link
                  to="/recruiter/analytics"
                  className={`px-3 py-2 rounded-xl transition ${
                    isActive('/recruiter/analytics')
                      ? 'bg-indigo-50 text-indigo-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Analytics
                </Link>
              </>
            )}

            {/* Admin Nav */}
            {isAdmin && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`px-3 py-2 rounded-xl transition ${
                    isActive('/admin/dashboard')
                      ? 'bg-indigo-50 text-indigo-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Overview
                </Link>
                <Link
                  to="/admin/users"
                  className={`px-3 py-2 rounded-xl transition ${
                    isActive('/admin/users')
                      ? 'bg-indigo-50 text-indigo-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Users
                </Link>
                <Link
                  to="/admin/jobs"
                  className={`px-3 py-2 rounded-xl transition ${
                    isActive('/admin/jobs')
                      ? 'bg-indigo-50 text-indigo-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Jobs
                </Link>
                <Link
                  to="/admin/applications"
                  className={`px-3 py-2 rounded-xl transition ${
                    isActive('/admin/applications')
                      ? 'bg-indigo-50 text-indigo-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Applications
                </Link>
              </>
            )}

            {/* Public Nav */}
            {!isAuthenticated && (
              <>
                <Link
                  to="/jobs"
                  className="px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition"
                >
                  Browse Jobs
                </Link>
              </>
            )}
          </div>

          {/* Right Action Tools: Quick Switcher, Notification, Profile */}
          <div className="flex items-center space-x-2.5">
            {/* 1-Click Demo Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="flex items-center space-x-1 px-2.5 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-200/80 text-amber-900 rounded-xl text-xs font-bold transition shadow-sm"
                title="Instant Role Switcher"
              >
                <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                <span className="hidden sm:inline">Role Switcher</span>
                <ChevronDown className="w-3 h-3 text-amber-700" />
              </button>

              {demoMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 text-xs animate-scale-up">
                  <div className="px-3 py-1.5 border-b border-slate-100 font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                    Switch Account Role
                  </div>
                  <button
                    onClick={() => handleQuickSwitch('candidate')}
                    className="w-full text-left px-3 py-2 hover:bg-indigo-50 flex items-center justify-between text-slate-700 hover:text-indigo-600 transition"
                  >
                    <div>
                      <div className="font-bold">Candidate (Alex Morgan)</div>
                      <div className="text-[10px] text-slate-400">Full Stack Developer</div>
                    </div>
                    {isCandidate && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                  </button>
                  <button
                    onClick={() => handleQuickSwitch('recruiter')}
                    className="w-full text-left px-3 py-2 hover:bg-indigo-50 flex items-center justify-between text-slate-700 hover:text-indigo-600 transition"
                  >
                    <div>
                      <div className="font-bold">Recruiter (Sarah Jenkins)</div>
                      <div className="text-[10px] text-slate-400">Apex Innovations Ltd</div>
                    </div>
                    {isRecruiter && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                  </button>
                  <button
                    onClick={() => handleQuickSwitch('admin')}
                    className="w-full text-left px-3 py-2 hover:bg-indigo-50 flex items-center justify-between text-slate-700 hover:text-indigo-600 transition"
                  >
                    <div>
                      <div className="font-bold">Administrator</div>
                      <div className="text-[10px] text-slate-400">Full System Governance</div>
                    </div>
                    {isAdmin && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                  </button>
                </div>
              )}
            </div>

            {/* Notifications Button */}
            {isAuthenticated && (
              <Link
                to="/candidate/notifications"
                className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full" />
              </Link>
            )}

            {/* User Profile / Auth buttons */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden sm:block text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 text-xs">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                    </div>

                    {isCandidate && (
                      <Link
                        to="/candidate/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-slate-700 hover:bg-slate-50 transition"
                      >
                        <User className="w-3.5 h-3.5 mr-2 text-slate-400" /> Edit Profile
                      </Link>
                    )}

                    {isRecruiter && (
                      <Link
                        to="/recruiter/company"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Briefcase className="w-3.5 h-3.5 mr-2 text-slate-400" /> Company Profile
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center px-4 py-2 text-rose-600 hover:bg-rose-50 transition border-t border-slate-100 mt-1 font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5 mr-2" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 text-sm font-semibold">
          {isCandidate && (
            <>
              <Link to="/candidate/dashboard" className="block py-2 text-slate-700">Dashboard</Link>
              <Link to="/candidate/jobs" className="block py-2 text-slate-700">Explore Jobs</Link>
              <Link to="/candidate/ai-analysis" className="block py-2 text-slate-700">AI Resume Analyzer</Link>
              <Link to="/candidate/applications" className="block py-2 text-slate-700">Applications</Link>
              <Link to="/candidate/interviews" className="block py-2 text-slate-700">Interviews</Link>
            </>
          )}
          {isRecruiter && (
            <>
              <Link to="/recruiter/dashboard" className="block py-2 text-slate-700">Dashboard</Link>
              <Link to="/recruiter/jobs" className="block py-2 text-slate-700">Manage Jobs</Link>
              <Link to="/recruiter/create-job" className="block py-2 text-slate-700">+ Post Job</Link>
              <Link to="/recruiter/interviews" className="block py-2 text-slate-700">Interviews</Link>
            </>
          )}
          {isAdmin && (
            <>
              <Link to="/admin/dashboard" className="block py-2 text-slate-700">Admin Overview</Link>
              <Link to="/admin/users" className="block py-2 text-slate-700">User Management</Link>
              <Link to="/admin/jobs" className="block py-2 text-slate-700">Job Governance</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
