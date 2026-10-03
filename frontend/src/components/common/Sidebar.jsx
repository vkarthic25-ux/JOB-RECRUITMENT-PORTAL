import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Sparkles,
  Send,
  Calendar,
  User,
  PlusCircle,
  Users,
  Building2,
  BarChart3,
  BookOpen,
  Target,
  Bell,
} from 'lucide-react';

const Sidebar = () => {
  const { user, isCandidate, isRecruiter, isAdmin } = useAuth();

  const candidateLinks = [
    { to: '/candidate/dashboard', icon: LayoutDashboard, label: 'Candidate Dashboard' },
    { to: '/candidate/profile', icon: User, label: 'Profile' },
    { to: '/candidate/resume-upload', icon: FileText, label: 'My Resume' },
    { to: '/candidate/ai-analysis', icon: Sparkles, label: 'AI Resume Analyzer' },
    { to: '/candidate/jobs', icon: Briefcase, label: 'Job Search' },
    { to: '/candidate/recommended-jobs', icon: Target, label: 'Recommended Jobs' },
    { to: '/candidate/skill-gap', icon: Target, label: 'Skill Gap' },
    { to: '/candidate/learning-roadmap', icon: BookOpen, label: 'Learning Roadmap' },
    { to: '/candidate/applications', icon: Send, label: 'Applications' },
    { to: '/candidate/interviews', icon: Calendar, label: 'Interviews' },
  ];

  const recruiterLinks = [
    { to: '/recruiter/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/recruiter/jobs', icon: Briefcase, label: 'Posted Jobs' },
    { to: '/recruiter/create-job', icon: PlusCircle, label: 'Post New Job' },
    { to: '/recruiter/shortlisted', icon: Users, label: 'Shortlisted Pool' },
    { to: '/recruiter/interviews', icon: Calendar, label: 'Interviews' },
    { to: '/recruiter/analytics', icon: BarChart3, label: 'Recruitment Analytics' },
    { to: '/recruiter/company', icon: Building2, label: 'Company Profile' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Admin Dashboard' },
    { to: '/admin/users', icon: Users, label: 'User Management' },
    { to: '/admin/jobs', icon: Briefcase, label: 'Job Governance' },
    { to: '/admin/applications', icon: Send, label: 'All Applications' },
    { to: '/admin/companies', icon: Building2, label: 'Companies' },
    { to: '/admin/analytics', icon: BarChart3, label: 'System Analytics' },
  ];

  const links = isCandidate ? candidateLinks : isRecruiter ? recruiterLinks : adminLinks;

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:block bg-white border-r border-slate-200/80 min-h-[calc(100vh-4rem)] p-4">
      {/* User Mini Card */}
      <div className="p-3.5 mb-5 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-slate-200/70 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-sm">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
          <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">
            {user?.role}
          </p>
        </div>
      </div>

      {/* Nav Link List */}
      <nav className="space-y-1 text-xs font-semibold">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center px-3.5 py-2.5 rounded-xl transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Helper AI badge */}
      <div className="mt-8 p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900">
        <div className="flex items-center space-x-1.5 font-bold mb-1">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>AI Decision Engine</span>
        </div>
        <p className="text-[11px] text-indigo-700 leading-relaxed">
          Explainable matching weighted on Skills (50%), Exp (20%), Edu (15%), and Role Fit (15%).
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
