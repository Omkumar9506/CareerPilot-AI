import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Compass, 
  Sparkles, 
  Briefcase, 
  Bot, 
  Menu, 
  X, 
  ArrowRight, 
  LogOut, 
  Users, 
  FileText, 
  TrendingUp, 
  Calendar, 
  LayoutDashboard, 
  ShieldAlert,
  Search,
  Sun,
  Moon,
  ChevronDown,
  Building2,
  Tag,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { QuickSearchModal } from '../ui/QuickSearchModal';
import { ThemeToggle } from './ThemeToggle';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aiToolsOpen, setAiToolsOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAiToolsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setAiToolsOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;
  const isAiToolsActive = ['/resume-analyzer', '/mock-interview', '/roadmap'].includes(location.pathname);

  const aiTools = [
    {
      name: 'AI Resume Analyzer',
      desc: 'Instant ATS scoring, keyword gap diagnostics & feedback',
      href: '/resume-analyzer',
      icon: Sparkles,
      badge: 'Popular',
    },
    {
      name: 'AI Mock Interviews',
      desc: 'Simulate tech & behavioral rounds with real-time coaching',
      href: '/mock-interview',
      icon: Bot,
      badge: 'Interactive',
    },
    {
      name: 'Skill Gap & Roadmaps',
      desc: 'Dynamic career paths tailored to your target engineering roles',
      href: '/roadmap',
      icon: TrendingUp,
      badge: 'Roadmaps',
    },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 shadow-lg shadow-black/20 light:bg-white/85 light:border-slate-200 light:shadow-slate-200/50'
            : 'bg-slate-950/60 backdrop-blur-md border-b border-slate-850/50 border-slate-850 light:bg-white/60 light:border-slate-200/60'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-cyber-400 p-[2px] shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center light:bg-white">
                  <Compass className="w-5 h-5 text-brand-400 group-hover:rotate-45 transition-transform duration-300 light:text-brand-600" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5 light:text-slate-900">
                  CareerPilot <span className="text-[11px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30 light:bg-brand-50 light:text-brand-700 light:border-brand-200">AI</span>
                </span>
                <span className="text-[10px] text-slate-400 tracking-wider font-medium -mt-1 light:text-slate-500">
                  YOUR CAREER, SUPERCHARGED
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-full border border-slate-800/80 light:bg-slate-100/80 light:border-slate-200">
              <Link
                to="/"
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isActive('/')
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-200'
                }`}
              >
                Home
              </Link>

              <Link
                to="/jobs"
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isActive('/jobs')
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-200'
                }`}
              >
                Browse Jobs
              </Link>

              {/* AI Tools Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setAiToolsOpen(!aiToolsOpen)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isAiToolsActive || aiToolsOpen
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60 light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyber-400" />
                  <span>AI Tools</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${aiToolsOpen ? 'rotate-180' : ''}`} />
                </button>

                {aiToolsOpen && (
                  <div className="absolute top-full left-0 mt-2 w-80 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl p-2.5 backdrop-blur-xl z-50 light:bg-white light:border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5 light:text-slate-500">
                      Gemini-Powered Features
                    </div>
                    {aiTools.map((tool) => {
                      const Icon = tool.icon;
                      return (
                        <Link
                          key={tool.name}
                          to={tool.href}
                          onClick={() => setAiToolsOpen(false)}
                          className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-brand-600/15 transition-all group light:hover:bg-brand-50"
                        >
                          <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:bg-brand-600 group-hover:text-white transition-all light:bg-brand-100 light:text-brand-700">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-grow">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-white group-hover:text-brand-300 transition-colors light:text-slate-900 light:group-hover:text-brand-600">
                                {tool.name}
                              </span>
                              <span className="text-[10px] font-medium text-cyber-400 px-1.5 py-0.5 rounded bg-cyber-500/10 border border-cyber-500/20 light:bg-cyber-50 light:text-cyber-700">
                                {tool.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-snug mt-0.5 light:text-slate-500">
                              {tool.desc}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              <Link
                to="/register?role=recruiter"
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-200"
              >
                For Employers
              </Link>

              <a
                href="#pricing-section"
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-200"
              >
                Pricing
              </a>

              {/* Role-based Dashboard link if authenticated */}
              {isAuthenticated && (
                <Link
                  to={
                    user?.role === 'recruiter' 
                      ? '/recruiter/dashboard' 
                      : user?.role === 'admin' 
                      ? '/admin/dashboard' 
                      : '/dashboard'
                  }
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-brand-400 hover:text-brand-300 hover:bg-brand-500/10 transition-all border border-brand-500/30"
                >
                  My Portal
                </Link>
              )}
            </nav>

            {/* Right Side: Quick Search, Theme Switcher, Auth */}
            <div className="hidden sm:flex items-center gap-2.5">
              {/* Quick Search Button */}
              <button
                onClick={() => setSearchModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all text-xs light:bg-slate-100 light:hover:bg-slate-200 light:text-slate-600 light:border-slate-300"
                title="Search platform (Ctrl+K or /)"
              >
                <Search className="w-3.5 h-3.5 text-brand-400" />
                <span className="hidden md:inline">Search...</span>
                <kbd className="hidden md:inline-flex items-center text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 light:bg-slate-200 light:text-slate-600">
                  /
                </kbd>
              </button>

              {/* Theme Toggle Component */}
              <ThemeToggle />

              {/* User State */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-brand-500/50 transition-all group light:bg-white light:border-slate-200"
                  >
                    <img
                      src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}`}
                      alt={user?.name}
                      className="w-7 h-7 rounded-lg object-cover ring-1 ring-brand-500/40 group-hover:ring-brand-400"
                    />
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-white leading-tight group-hover:text-brand-300 transition-colors light:text-slate-800">
                        {user?.name?.split(' ')[0]}
                      </span>
                      <span className="text-[9px] font-semibold text-brand-400 uppercase tracking-wider">
                        {user?.role === 'recruiter' ? 'Recruiter' : user?.role === 'admin' ? 'Admin' : 'Candidate'}
                      </span>
                    </div>
                  </Link>

                  <button
                    onClick={logout}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors border border-transparent hover:border-rose-500/20"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors light:text-slate-700 light:hover:text-slate-900"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="relative inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-cyber-600 rounded-xl shadow-md shadow-brand-600/30 hover:shadow-brand-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Get Started
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex sm:hidden items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors light:text-slate-700 light:hover:bg-slate-100"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-2xl px-5 pt-3 pb-6 space-y-3.5 light:bg-white/95 light:border-slate-200">
            {/* Quick Search in Mobile */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setSearchModalOpen(true);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs light:bg-slate-100 light:border-slate-200 light:text-slate-600"
            >
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4 text-brand-400" />
                Search jobs, skills, AI tools...
              </span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-brand-400">Open</span>
            </button>

            {isAuthenticated && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 light:bg-slate-50 light:border-slate-200">
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}`}
                  alt={user?.name}
                  className="w-10 h-10 rounded-xl object-cover ring-1 ring-brand-500/40"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white light:text-slate-900">{user?.name}</span>
                  <span className="text-xs text-brand-400 uppercase font-semibold">{user?.role}</span>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-900 light:text-slate-800 light:hover:bg-slate-100"
              >
                <Compass className="w-4 h-4 text-brand-400" />
                Home
              </Link>
              <Link
                to="/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-900 light:text-slate-800 light:hover:bg-slate-100"
              >
                <Briefcase className="w-4 h-4 text-brand-400" />
                Browse Jobs
              </Link>
              
              <div className="pt-2 pb-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3">
                AI Career Suite
              </div>
              <Link
                to="/resume-analyzer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-900 light:text-slate-800 light:hover:bg-slate-100"
              >
                <Sparkles className="w-4 h-4 text-brand-400" />
                AI Resume Analyzer
              </Link>
              <Link
                to="/mock-interview"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-900 light:text-slate-800 light:hover:bg-slate-100"
              >
                <Bot className="w-4 h-4 text-cyber-400" />
                AI Mock Interviews
              </Link>
              <Link
                to="/roadmap"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-900 light:text-slate-800 light:hover:bg-slate-100"
              >
                <TrendingUp className="w-4 h-4 text-amber-400" />
                Skill Gap & Roadmaps
              </Link>

              <div className="pt-2 pb-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3">
                Ecosystem
              </div>
              <Link
                to="/register?role=recruiter"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-900 light:text-slate-800 light:hover:bg-slate-100"
              >
                <Building2 className="w-4 h-4 text-purple-400" />
                For Employers
              </Link>
            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-col gap-2 light:border-slate-200">
              {isAuthenticated ? (
                <>
                  <Link
                    to={
                      user?.role === 'recruiter' 
                        ? '/recruiter/dashboard' 
                        : user?.role === 'admin' 
                        ? '/admin/dashboard' 
                        : '/dashboard'
                    }
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 text-sm font-bold text-white bg-brand-600 rounded-xl shadow-md shadow-brand-600/30"
                  >
                    Go to Portal Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 text-xs font-bold text-slate-200 bg-slate-900 rounded-xl border border-slate-800 light:bg-slate-100 light:text-slate-800 light:border-slate-300"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-cyber-600 rounded-xl shadow-md"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Quick Search Modal */}
      <QuickSearchModal 
        isOpen={searchModalOpen} 
        onClose={() => setSearchModalOpen(false)} 
      />
    </>
  );
};
