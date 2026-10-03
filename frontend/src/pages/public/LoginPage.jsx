import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Sparkles, Mail, Lock, ArrowRight, UserCheck, Briefcase, Shield, Zap } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, quickLogin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter both email and password.', 'error');
      return;
    }

    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);

    if (res.success) {
      addToast(`Welcome back, ${res.user.name}!`, 'success');
      if (res.user.role === 'candidate') navigate('/candidate/dashboard');
      else if (res.user.role === 'recruiter') navigate('/recruiter/dashboard');
      else if (res.user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } else {
      addToast(res.message || 'Login failed. Please verify credentials.', 'error');
    }
  };

  const handleQuickDemo = async (role) => {
    setSubmitting(true);
    const res = await quickLogin(role);
    setSubmitting(false);

    if (res.success) {
      addToast(`Signed in as ${role.toUpperCase()}`, 'success');
      if (role === 'candidate') navigate('/candidate/dashboard');
      else if (role === 'recruiter') navigate('/recruiter/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Sign in to HireMatch AI
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your AI recruitment dashboard & application tracker
          </p>
        </div>

        {/* 1-Click Quick Access Box */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900 mb-3">
            <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
            <span>Fast 1-Click Role Access</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemo('candidate')}
              className="p-2.5 rounded-xl bg-white hover:bg-indigo-50 border border-amber-200 text-center font-bold text-slate-700 hover:text-indigo-600 shadow-sm transition group"
            >
              <UserCheck className="w-4 h-4 mx-auto mb-1 text-indigo-600 group-hover:scale-110 transition" />
              Candidate
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('recruiter')}
              className="p-2.5 rounded-xl bg-white hover:bg-purple-50 border border-amber-200 text-center font-bold text-slate-700 hover:text-purple-600 shadow-sm transition group"
            >
              <Briefcase className="w-4 h-4 mx-auto mb-1 text-purple-600 group-hover:scale-110 transition" />
              Recruiter
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-amber-200 text-center font-bold text-slate-700 hover:text-slate-900 shadow-sm transition group"
            >
              <Shield className="w-4 h-4 mx-auto mb-1 text-slate-700 group-hover:scale-110 transition" />
              Admin
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm">
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/25 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-indigo-600 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
