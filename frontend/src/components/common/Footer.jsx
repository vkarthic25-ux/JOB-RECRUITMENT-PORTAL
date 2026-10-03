import React from 'react';
import { Sparkles, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200/80 py-10 mt-auto text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-slate-900 tracking-tight">
              HireMatch AI — AI-Powered Job Recruitment Platform
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 font-medium">
            <Link to="/jobs" className="hover:text-indigo-600 transition">Job Search</Link>
            <Link to="/login" className="hover:text-indigo-600 transition">Portal Login</Link>
            <Link to="/register" className="hover:text-indigo-600 transition">Register</Link>
            <span className="text-slate-300">|</span>
            <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-semibold">
              AI-Powered Recruitment
            </span>
          </div>

          <div className="text-center md:text-right">
            <p>© {new Date().getFullYear()} HireMatch AI. All rights reserved.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Enterprise Talent Acquisition & Career Mobility Platform
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
