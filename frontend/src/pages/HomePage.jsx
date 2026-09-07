import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Briefcase, 
  Bot, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Server, 
  Cpu, 
  Users, 
  FileText 
} from 'lucide-react';
import api from '../services/api';

export const HomePage = () => {
  const [apiHealth, setApiHealth] = useState({ status: 'checking', message: 'Checking API status...' });

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await api.get('/health');
        if (res.success) {
          setApiHealth({
            status: 'connected',
            message: `Connected to Backend (Uptime: ${res.data?.uptime || 'Active'}, Env: ${res.data?.environment})`,
          });
        } else {
          setApiHealth({ status: 'error', message: 'API returned unexpected response' });
        }
      } catch (err) {
        setApiHealth({
          status: 'disconnected',
          message: 'Backend API offline or unreachable at /api/health',
        });
      }
    };

    checkBackend();
  }, []);

  const features = [
    {
      icon: Sparkles,
      title: 'AI Resume Analyzer',
      description: 'Instant ATS compatibility scoring, keyword optimization, and actionable feedback powered by Google Gemini.',
      color: 'from-brand-500 to-indigo-600',
    },
    {
      icon: Briefcase,
      title: 'Intelligent Job Matching',
      description: 'Algorithmic alignment matching candidate qualifications, experience, and aspirations with verified recruiters.',
      color: 'from-cyber-500 to-teal-600',
    },
    {
      icon: Bot,
      title: 'AI Mock Interviews',
      description: 'Dynamic role-specific technical & behavioral interview simulations with real-time answer scoring & coaching.',
      color: 'from-violet-500 to-purple-600',
    },
    {
      icon: TrendingUp,
      title: 'Skill Gap & Roadmaps',
      description: 'Discover the exact skills you need to break into your dream role with personalized milestones and learning roadmaps.',
      color: 'from-amber-500 to-orange-600',
    },
  ];

  return (
    <div className="relative overflow-hidden pt-8 pb-20">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] overflow-hidden -z-10 pointer-events-none opacity-40">
        <div className="absolute top-[-100px] left-[15%] w-[450px] h-[450px] rounded-full bg-brand-600/30 blur-[120px]" />
        <div className="absolute top-[-50px] right-[15%] w-[400px] h-[400px] rounded-full bg-cyber-500/25 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* API Health Banner */}
        <div className="flex justify-center mb-6">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border backdrop-blur-md transition-all ${
            apiHealth.status === 'connected'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : apiHealth.status === 'checking'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              apiHealth.status === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`} />
            <Server className="w-3.5 h-3.5" />
            <span>API Gateway: {apiHealth.message}</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-6 pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold uppercase tracking-wider shadow-inner">
            <Cpu className="w-3.5 h-3.5 text-brand-400" />
            Next-Gen Career Acceleration
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Land Your Dream Role with <br />
            <span className="gradient-text">AI-Powered Precision</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
            CareerPilot AI bridges ambitious talent with top tech recruiters using Gemini AI for real-time ATS optimization, tailored interview prep, and intelligent job matching.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-cyber-600 rounded-xl shadow-xl shadow-brand-600/30 hover:shadow-brand-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Get Started as Candidate
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              to="/jobs"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800/80 rounded-xl border border-slate-800 hover:border-slate-700 transition-all"
            >
              Explore Open Positions
            </Link>
          </div>

          {/* Trust badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand-400" />
              <span>Full ATS Resume Scoring</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand-400" />
              <span>Realistic AI Mock Interviews</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand-400" />
              <span>Role-Based Recruiter Portal</span>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-24">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Engineered for Career Acceleration
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Everything job seekers and recruiters need, unified in one intelligent workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="glass-card glass-card-hover p-6 rounded-2xl flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white tracking-tight">{feat.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{feat.description}</p>
                  </div>
                  <div className="pt-6 mt-4 border-t border-slate-850 border-slate-800/60">
                    <span className="text-xs font-semibold text-brand-400 flex items-center gap-1">
                      Learn more <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Multi-Role Ecosystem Preview */}
        <div className="mt-24 p-8 sm:p-12 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full bg-cyber-500/10 text-cyber-400 border border-cyber-500/20">
              Role-Based Architecture
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mt-3">
              One Unified Platform, Three Tailored Portals
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Candidate Card */}
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white">Job Seekers</h4>
              <p className="text-sm text-slate-400">
                Upload resumes, receive AI match metrics, rehearse with AI interviewer bots, and track application pipelines.
              </p>
              <div className="text-xs font-medium text-slate-500">Includes candidate dashboard & ATS diagnostics</div>
            </div>

            {/* Recruiter Card */}
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-cyber-500/20 text-cyber-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white">Recruiters</h4>
              <p className="text-sm text-slate-400">
                Post tech roles, filter applicants, evaluate candidate profiles, schedule interviews, and manage the hiring pipeline.
              </p>
              <div className="text-xs font-medium text-slate-500">Includes recruiter dashboard & candidate review tools</div>
            </div>

            {/* Admin Card */}
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white">Administrators</h4>
              <p className="text-sm text-slate-400">
                Platform-wide control over jobs, users, verified recruiters, system diagnostics, and platform analytics.
              </p>
              <div className="text-xs font-medium text-slate-500">Includes moderation & platform management suite</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
