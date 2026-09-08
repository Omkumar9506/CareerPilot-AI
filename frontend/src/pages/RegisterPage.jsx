import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, User, Briefcase, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'recruiter' ? 'recruiter' : 'candidate';

  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setSubmitting(true);
    const result = await register({ name, email, password, role });
    setSubmitting(false);

    if (result.success) {
      if (role === 'recruiter') {
        navigate('/recruiter/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } else {
      setError(result.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 glow-radial-bg">
      <div className="w-full max-w-md space-y-6 bg-white dark:bg-navy-900/90 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl transition-colors duration-200">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Create an Account</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Join CareerPilot AI as a Job Seeker or Recruiter</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setRole('candidate')}
            className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              role === 'candidate'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Job Seeker
          </button>
          <button
            type="button"
            onClick={() => setRole('recruiter')}
            className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              role === 'recruiter'
                ? 'bg-cyber-600 text-white shadow-md shadow-cyber-600/30'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Recruiter
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-cyber-600 hover:opacity-95 text-white text-sm font-semibold rounded-xl shadow-md shadow-brand-600/30 hover:shadow-brand-600/50 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create {role === 'candidate' ? 'Job Seeker' : 'Recruiter'} Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-600 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 dark:text-brand-400 hover:underline font-semibold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
