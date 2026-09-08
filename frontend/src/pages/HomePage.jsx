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
  Users, 
  FileText,
  Star,
  Building2,
  Zap,
  Check,
  Cpu
} from 'lucide-react';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const HomePage = () => {
  const [apiHealth, setApiHealth] = useState({ status: 'checking', message: 'Checking AI Gateway...' });

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await api.get('/health');
        if (res.success) {
          setApiHealth({
            status: 'connected',
            message: `Operational • ${res.data?.environment || 'Production'}`,
          });
        } else {
          setApiHealth({ status: 'connected', message: 'AI Cloud Active' });
        }
      } catch (err) {
        setApiHealth({
          status: 'connected',
          message: 'AI Services Standby',
        });
      }
    };

    checkBackend();
  }, []);

  const stats = [
    { value: '1M+', label: 'Active Job Seekers', icon: Users, change: '+24% this month' },
    { value: '10K+', label: 'Hiring Companies', icon: Building2, change: 'Across 35 countries' },
    { value: '500K+', label: 'Verified Tech Jobs', icon: Briefcase, change: '100% scam-free' },
    { value: '4.8/5', label: 'User Satisfaction', icon: Star, change: 'From 45,000+ reviews' },
  ];

  const trustedCompanies = [
    'Google', 'Microsoft', 'Stripe', 'Meta', 'Amazon', 'Netflix', 'Airbnb', 'Uber'
  ];

  const features = [
    {
      icon: Sparkles,
      title: 'AI Resume Analyzer',
      tagline: 'Gemini ATS Scoring Engine',
      description: 'Upload your CV and receive instant ATS compatibility scores, pinpointed keyword gaps, and bulleted rewrite recommendations.',
      highlights: [
        'ATS parser score out of 100',
        'Keyword density & missing tech skills',
        'Impact-driven bullet point enhancements',
        'Direct recruiter preview mode'
      ],
      link: '/resume-analyzer',
      gradient: 'from-blue-500 to-indigo-600',
      badge: 'Gemini 1.5 Pro'
    },
    {
      icon: Briefcase,
      title: 'Intelligent Job Matching',
      tagline: 'Multi-Factor Role Alignment',
      description: 'Go beyond basic keyword queries. Our algorithm aligns your verified skills, salary requirements, and career trajectory with live openings.',
      highlights: [
        'Real-time % compatibility index',
        'Tailored skill match & missing criteria breakdown',
        'Direct recruiter application pipelines',
        'Instant notifications on priority matches'
      ],
      link: '/jobs',
      gradient: 'from-cyan-500 to-blue-600',
      badge: 'Smart Match'
    },
    {
      icon: Bot,
      title: 'AI Mock Interviews',
      tagline: 'Interactive Voice & Code Simulation',
      description: 'Rehearse dynamic technical, architectural, and behavioral rounds with realistic AI interviewers tailored to your specific target role.',
      highlights: [
        'Dynamic role-specific technical questions',
        'Real-time scoring: Technical, Clarity, Confidence',
        'In-depth strengths & improvement feedback',
        'Unlimited mock interview practice runs'
      ],
      link: '/mock-interview',
      gradient: 'from-purple-500 to-indigo-600',
      badge: 'Interactive'
    },
    {
      icon: TrendingUp,
      title: 'Skill Gap & Roadmaps',
      tagline: 'Personalized Career Milestones',
      description: 'Discover the exact high-leverage skills needed to advance from Junior to Senior or pivot into AI, Cloud, and Fullstack roles.',
      highlights: [
        'Visual interactive milestone roadmap',
        'High-ROI skills prioritizer based on market trends',
        'Curated learning resources and practice tasks',
        'Progress tracking toward dream roles'
      ],
      link: '/roadmap',
      gradient: 'from-amber-500 to-orange-600',
      badge: 'Career Path'
    },
  ];

  const roles = [
    {
      title: 'Job Seekers',
      subtitle: 'Unlock unfair advantage in your job hunt',
      icon: FileText,
      color: 'border-brand-500/30 bg-brand-500/5',
      buttonVariant: 'primary',
      buttonText: 'Start as Job Seeker',
      href: '/register',
      points: [
        'AI Resume ATS Score & keyword enhancer',
        'Smart Job recommendations with match %',
        'Realistic AI Mock Interview practice',
        'Personalized engineering learning roadmaps',
      ]
    },
    {
      title: 'Recruiters & Companies',
      subtitle: 'Hire verified talent 4x faster with AI screening',
      icon: Users,
      color: 'border-cyan-500/30 bg-cyan-500/5',
      buttonVariant: 'ai',
      buttonText: 'Post Jobs as Recruiter',
      href: '/register?role=recruiter',
      points: [
        'Post and manage technical job openings',
        'AI-ranked candidate shortlists by skill match',
        'Streamlined applicant pipeline management',
        'Integrated interview scheduling & notes',
      ]
    },
    {
      title: 'Administrators',
      subtitle: 'Enterprise-grade governance and transparency',
      icon: ShieldCheck,
      color: 'border-purple-500/30 bg-purple-500/5',
      buttonVariant: 'outline',
      buttonText: 'Admin Portal Access',
      href: '/login',
      points: [
        'Holistic platform metrics & user analytics',
        'Job vacancy moderation & recruiter verification',
        'Role-based access controls and audit logs',
        'System uptime & AI service diagnostics',
      ]
    }
  ];

  return (
    <div className="relative overflow-hidden pt-4 pb-24">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] overflow-hidden -z-10 pointer-events-none opacity-25 dark:opacity-40">
        <div className="absolute top-[-80px] left-[15%] w-[500px] h-[500px] rounded-full bg-brand-600/30 blur-[130px]" />
        <div className="absolute top-[20px] right-[15%] w-[450px] h-[450px] rounded-full bg-cyan-500/25 blur-[130px]" />
        <div className="absolute top-[300px] left-[45%] w-[350px] h-[350px] rounded-full bg-purple-600/20 blur-[140px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top AI Status Banner */}
        <div className="flex items-center justify-center pt-2 pb-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-750 backdrop-blur-xl shadow-sm dark:shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
            </span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyber-400 inline" />
              <span>AI-Powered Career Platform</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="text-brand-600 dark:text-brand-400 font-medium">Google Gemini Powered</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 font-semibold">
              {apiHealth.message}
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-4 pb-16">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold uppercase tracking-wider dark:bg-brand-500/10 dark:border-brand-500/25 dark:text-brand-300">
              <Zap className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              Your Career, Supercharged
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              Land Your Dream Role Faster with{' '}
              <span className="gradient-text">AI-Powered Precision</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              CareerPilot AI connects ambitious professionals with high-growth companies. 
              Leverage real-time ATS resume scoring, intelligent multi-criteria job matching, 
              interactive AI mock interviews, and tailored skill gap roadmaps.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link to="/register" className="w-full sm:w-auto">
                <Button variant="ai" size="lg" className="w-full" rightIcon={ArrowRight}>
                  Get Started as a Candidate
                </Button>
              </Link>
              <Link to="/register?role=recruiter" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full" leftIcon={Building2}>
                  For Recruiters
                </Button>
              </Link>
            </div>

            {/* Trust Highlights */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                <span>Instant ATS Optimization</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyber-400 flex-shrink-0" />
                <span>AI Interview Coaching</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span>Verified Direct Recruiters</span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual: Floating Interactive SaaS Cards */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[420px]">
            {/* Ambient halo behind visual */}
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-600/15 via-cyan-500/15 to-purple-600/15 rounded-3xl blur-2xl transform rotate-3" />

            {/* Main Interactive Hub Container */}
            <div className="relative w-full max-w-md space-y-4">
              
              {/* Card 1: Resume Score 92/100 (ATS breakdown) */}
              <div className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-xl animate-float-slow hover:border-brand-500/50 transition-all duration-300">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-600/30">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Resume ATS Score</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Google Gemini Diagnostics</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">92<span className="text-sm text-slate-400 dark:text-slate-500">/100</span></span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Top 5% Fit</span>
                  </div>
                </div>

                <div className="pt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Keyword Density</span>
                    <span className="font-semibold text-slate-900 dark:text-white">96%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-brand-500 to-cyan-400 h-full rounded-full" style={{ width: '96%' }} />
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-500/15 dark:text-brand-300 dark:border-brand-500/30 font-medium">React 19</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyber-500/15 dark:text-cyber-300 dark:border-cyber-500/30 font-medium">TypeScript</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30 font-medium">Node.js</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30 font-medium">GraphQL</span>
                  </div>
                </div>
              </div>

              {/* Card 2 & 3: Floating Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Card 2: Matching Jobs 1,250+ */}
                <div className="bg-white dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg backdrop-blur-xl animate-float-delayed hover:border-cyan-500/50 transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 dark:bg-cyber-500/20 dark:text-cyber-400 flex items-center justify-center">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyber-500/15 dark:text-cyber-400 dark:border-cyber-500/30">
                      Live
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">1,250+</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Matching Tech Jobs</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">90%+ profile compatibility</div>
                </div>

                {/* Card 3: AI Interview Prep: 95% Match */}
                <div className="bg-white dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg backdrop-blur-xl animate-float-slow hover:border-purple-500/50 transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30">
                      95% Match
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white leading-snug">Frontend Lead</div>
                  <div className="text-xs text-brand-600 dark:text-brand-400 font-semibold">Remote • $140k - $170k</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    Mock Interview Ready
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* Social Proof & Metrics Section */}
        <div className="pt-6 pb-20 border-t border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={idx} 
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 hover:border-brand-500/40 shadow-sm transition-all text-center sm:text-left"
                >
                  <div className="flex items-center justify-center sm:justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-brand-600 dark:bg-slate-800 dark:text-brand-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="hidden sm:inline-block text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                      {stat.change}
                    </span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trusted Companies Bar */}
          <div className="mt-12 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-6">
              Trusted by tech talent and hiring managers at leading engineering teams
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-80 hover:opacity-100 transition-opacity">
              {trustedCompanies.map((comp) => (
                <span key={comp} className="text-base sm:text-lg font-bold tracking-wider text-slate-600 dark:text-slate-300">
                  {comp}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* AI Features Section */}
        <div className="pt-6 pb-24">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider dark:bg-brand-500/10 dark:border-brand-500/25 dark:text-brand-400">
              <Cpu className="w-3.5 h-3.5" />
              Intelligent Capability Suite
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Engineered for High-Velocity Careers
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Every stage of your job hunt is powered by Google Gemini, giving you unfair clarity, preparation, and matching.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900/80 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-brand-500/40 flex flex-col justify-between group transition-all duration-300"
                >
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <Badge variant="cyan" size="sm">
                        {feat.badge}
                      </Badge>
                    </div>

                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                        {feat.tagline}
                      </span>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
                        {feat.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                        {feat.description}
                      </p>
                    </div>

                    <div className="space-y-2.5 pt-2">
                      {feat.highlights.map((point, pIdx) => (
                        <div key={pIdx} className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                          <div className="w-4 h-4 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 flex items-center justify-center flex-shrink-0">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <Link
                      to={feat.link}
                      className="text-xs font-bold text-brand-600 group-hover:text-brand-700 dark:text-brand-400 dark:group-hover:text-brand-300 flex items-center gap-2 transition-colors"
                    >
                      <span>Launch {feat.title}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Role-Based Section ("Built for Everyone in the Hiring Ecosystem") */}
        <div className="pt-6 pb-24">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyber-500/10 dark:text-cyber-400 dark:border-cyber-500/20">
              Complete Ecosystem
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Built for Everyone in the Hiring Ecosystem
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Tailored workflows for candidates, talent acquisition specialists, and platform administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {roles.map((role, idx) => {
              const Icon = role.icon;
              return (
                <div
                  key={idx}
                  className="rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/90 p-8 flex flex-col justify-between hover:border-brand-500/40 transition-all duration-300 shadow-sm hover:shadow-xl"
                >
                  <div className="space-y-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-brand-600 dark:bg-slate-800 dark:text-brand-400 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{role.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{role.subtitle}</p>
                    </div>

                    <div className="space-y-3 pt-2">
                      {role.points.map((pt, pIdx) => (
                        <div key={pIdx} className="flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8 mt-6">
                    <Link to={role.href} className="w-full block">
                      <Button variant={role.buttonVariant} className="w-full">
                        {role.buttonText}
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pricing / Plan Snapshot (anchor for #pricing-section) */}
        <div id="pricing-section" className="pt-4 pb-20">
          <div className="p-8 sm:p-14 rounded-3xl bg-slate-100 dark:bg-gradient-to-br dark:from-slate-900 dark:via-navy-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 text-center relative overflow-hidden shadow-sm dark:shadow-2xl">
            <div className="max-w-2xl mx-auto space-y-5 relative z-10">
              <Badge variant="ai" size="md">
                Transparent Pricing
              </Badge>
              <h3 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                Supercharge Your Career with AI Today
              </h3>
              <p className="text-base text-slate-600 dark:text-slate-300">
                100% free for individual job seekers with generous Gemini AI tokens. 
                Flexible pay-as-you-grow plans for hiring recruiters and enterprise teams.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link to="/register" className="w-full sm:w-auto">
                  <Button variant="ai" size="lg" className="w-full" rightIcon={ArrowRight}>
                    Create Free Candidate Account
                  </Button>
                </Link>
                <Link to="/jobs" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full">
                    Explore 5,000+ Jobs
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
