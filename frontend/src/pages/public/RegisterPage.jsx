import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Sparkles, Mail, Lock, User, Phone, MapPin, Building, ArrowRight, UserCheck, Briefcase } from 'lucide-react';

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'recruiter' ? 'recruiter' : 'candidate';

  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [designation, setDesignation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      addToast('Please complete all required fields.', 'error');
      return;
    }

    setSubmitting(true);
    const res = await register({
      name,
      email,
      password,
      role,
      phone,
      location,
      ...(role === 'recruiter' && { companyName, designation }),
    });
    setSubmitting(false);

    if (res.success) {
      addToast(`Account created successfully! Welcome, ${res.user.name}.`, 'success');
      if (res.user.role === 'candidate') navigate('/candidate/dashboard');
      else if (res.user.role === 'recruiter') navigate('/recruiter/dashboard');
      else navigate('/');
    } else {
      addToast(res.message || 'Registration failed.', 'error');
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Create your HireMatch AI Account
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Choose your role to activate personalized matching tools
          </p>
        </div>

        {/* Role Segmented Switcher */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setRole('candidate')}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
              role === 'candidate'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Candidate</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('recruiter')}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
              role === 'recruiter'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Recruiter / HR</span>
          </button>
        </div>

        <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm">
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 transition"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="jane@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 transition"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password (min 6 characters) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="City, State"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 transition"
                  />
                </div>
              </div>
            </div>

            {/* Recruiter-specific fields */}
            {role === 'recruiter' && (
              <div className="space-y-3.5 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Company Name
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="e.g. Apex Innovations"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Technical Recruiter"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 transition"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-500/25 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{submitting ? 'Creating Profile...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-indigo-600 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
