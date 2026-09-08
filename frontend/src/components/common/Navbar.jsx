import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Sparkles, Briefcase, Bot, Menu, X, ArrowRight, LogOut, User, Users, FileText, TrendingUp, Calendar, LayoutDashboard, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const navLinks = [
    ...(isAuthenticated && user?.role === 'candidate'
      ? [{ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }]
      : []),
    {
      name: isAuthenticated && user?.role === 'candidate' ? 'Jobs & AI Matches' : 'Browse Jobs',
      href: '/jobs',
      icon: Briefcase,
    },
    ...(user?.role === 'admin'
      ? [{ name: 'Admin Panel', href: '/admin/dashboard', icon: ShieldAlert }]
      : []),
    ...(user?.role === 'recruiter' || user?.role === 'admin'
      ? [
          { name: 'Recruiter Hub', href: '/recruiter/dashboard', icon: LayoutDashboard },
          { name: 'Manage Jobs', href: '/recruiter/jobs', icon: Briefcase },
          { name: 'Applicants', href: '/recruiter/applicants', icon: Users },
          { name: 'Interviews', href: '/recruiter/interviews', icon: Calendar },
        ]
      : [
          { name: 'Skill Roadmap', href: '/roadmap', icon: TrendingUp },
          { name: 'AI Resume Analyzer', href: '/resume-analyzer', icon: Sparkles },
          { name: 'AI Mock Interview', href: '/mock-interview', icon: Bot },
          ...(isAuthenticated
            ? [
                { name: 'My Applications', href: '/applications', icon: FileText },
                { name: 'Interviews', href: '/interviews', icon: Calendar },
              ]
            : []),
        ]),
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-slate-950/80 border-b border-slate-850 border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-cyber-400 p-[2px] shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Compass className="w-5 h-5 text-brand-400 group-hover:rotate-45 transition-transform duration-300" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                CareerPilot <span className="text-xs uppercase font-extrabold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 tracking-wider font-medium -mt-1">
                INTELLIGENT CAREER PLATFORM
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-full border border-slate-800/80">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive(item.href)
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 text-brand-400" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Auth Status & CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-brand-500/50 transition-all group"
                  title="View Profile Settings"
                >
                  <img
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}`}
                    alt={user?.name}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-brand-500/40 group-hover:ring-brand-400"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-white leading-tight group-hover:text-brand-300 transition-colors">
                      {user?.name}
                    </span>
                    <span className="text-[10px] font-medium text-brand-400 uppercase tracking-wider">
                      {user?.role === 'recruiter' ? 'Recruiter' : user?.role === 'admin' ? 'Admin' : 'Job Seeker'}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors border border-transparent hover:border-slate-800"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="relative inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-cyber-600 rounded-lg shadow-lg shadow-brand-600/25 hover:shadow-brand-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 pt-2 pb-6 space-y-3">
          {isAuthenticated && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 mb-2">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}`}
                alt={user?.name}
                className="w-9 h-9 rounded-lg object-cover"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">{user?.name}</span>
                <span className="text-xs text-brand-400 uppercase font-medium">{user?.role}</span>
              </div>
            </div>
          )}

          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800/80"
              >
                <Icon className="w-5 h-5 text-brand-400" />
                {item.name}
              </Link>
            );
          })}
          <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 text-sm font-semibold text-rose-400 bg-rose-500/10 rounded-lg border border-rose-500/20 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-900 rounded-lg border border-slate-800"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-lg shadow-md shadow-brand-600/30"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
