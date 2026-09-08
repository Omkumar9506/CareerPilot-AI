import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileCheck,
  Briefcase,
  Bot,
  Star,
  Building2,
  MapPin,
} from 'lucide-react';

export const Hero = () => {
  const featureList = [
    'AI Resume Analyzer',
    'Smart Job Matching',
    'AI Mock Interviews',
    'Personalized Roadmaps',
  ];

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 lg:pt-24 lg:pb-36 glow-radial-bg transition-colors duration-200">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-600/10 dark:bg-brand-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-cyber-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-7 flex flex-col items-start text-left"
          >
            {/* Top Badge */}
            <div className="mb-6">
              <Badge variant="glow" size="lg" icon={Sparkles}>
                AI-Powered Career Platform
              </Badge>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15] sm:leading-[1.15] transition-colors">
              Land Your Dream Role Faster with{' '}
              <span className="gradient-ai block sm:inline">
                AI-Powered Precision
              </span>
            </h1>

            {/* Description */}
            <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-2xl transition-colors">
              CareerPilot AI connects ambitious talent with top companies using
              Gemini AI for resume analysis, intelligent job matching, interview
              preparation, and personalized career guidance.
            </p>

            {/* Call to Actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              <Link to="/register?role=candidate" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto text-base group"
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Get Started as a Candidate
                </Button>
              </Link>
              <Link to="/employers" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto text-base group"
                  icon={Briefcase}
                >
                  For Recruiters →
                </Button>
              </Link>
            </div>

            {/* Social Proof with Avatar Group */}
            <div className="mt-10 pt-8 border-t border-slate-200 dark:border-white/[0.08] w-full flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex -space-x-2.5 overflow-hidden">
                <img
                  className="inline-block h-10 w-10 rounded-full ring-2 ring-slate-50 dark:ring-navy-950 object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                  alt="Candidate user"
                />
                <img
                  className="inline-block h-10 w-10 rounded-full ring-2 ring-slate-50 dark:ring-navy-950 object-cover"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
                  alt="Software engineer"
                />
                <img
                  className="inline-block h-10 w-10 rounded-full ring-2 ring-slate-50 dark:ring-navy-950 object-cover"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80"
                  alt="Data scientist"
                />
                <div className="inline-flex items-center justify-center h-10 w-10 rounded-full ring-2 ring-slate-50 dark:ring-navy-950 bg-brand-600 text-xs font-bold text-white">
                  1M+
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 ml-1.5">4.9/5 Rating</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  Join <span className="font-semibold text-slate-900 dark:text-white">1M+ job seekers</span> who are accelerating their careers
                </p>
              </div>
            </div>

            {/* Feature Checkmarks Highlight */}
            <div className="mt-6 grid grid-cols-2 sm:flex sm:flex-wrap gap-x-6 gap-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              {featureList.map((feat) => (
                <div key={feat} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyber-600 dark:text-cyber-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Premium Hero AI Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="lg:col-span-5 relative flex justify-center lg:justify-end"
          >
            {/* Visual Container */}
            <div className="relative w-full max-w-md lg:max-w-none">
              {/* Radial gradient glow behind visual */}
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-600/20 to-cyber-500/20 rounded-3xl blur-2xl opacity-70" />

              {/* Main Job Card */}
              <div className="relative rounded-2xl bg-white dark:bg-navy-900/85 backdrop-blur-2xl border border-slate-200 dark:border-white/10 p-6 shadow-xl dark:shadow-2xl space-y-5 transition-colors duration-200">
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-2">
                      <Building2 className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        Frontend Developer
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">Google</span>
                        <span>•</span>
                        <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500" /> Remote
                      </p>
                    </div>
                  </div>
                  <Badge variant="cyber" size="sm">
                    98% Match
                  </Badge>
                </div>

                {/* Job Info Tags */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.05]">
                    Full-time
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.05]">
                    $140k - $185k / yr
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/20">
                    React & TypeScript
                  </span>
                </div>

                {/* AI Match Reasoning */}
                <div className="rounded-xl bg-slate-50 dark:bg-slate-950/60 p-3 border border-slate-200 dark:border-white/[0.05] text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <div className="flex items-center justify-between font-semibold text-brand-600 dark:text-brand-300">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyber-600 dark:text-cyber-400" /> Gemini Match Analysis
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400">High Synergy</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                    Your recent React 19 and UI architecture projects align with 9/10 core job requirements.
                  </p>
                </div>

                {/* Card Action */}
                <div className="pt-1">
                  <Link to="/jobs">
                    <Button variant="primary" className="w-full justify-center text-sm py-2">
                      Apply Now →
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Floating Top-Left Card: Resume ATS Score */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-6 -left-4 sm:-left-8 rounded-xl bg-white dark:bg-navy-900/90 backdrop-blur-xl border border-slate-200 dark:border-brand-500/30 p-3.5 shadow-xl flex items-center gap-3 hidden sm:flex"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-500/15 flex items-center justify-center text-brand-600 dark:text-brand-300">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
                    Resume ATS Score
                  </div>
                  <div className="text-lg font-extrabold text-slate-900 dark:text-white flex items-baseline gap-1">
                    <span className="text-emerald-600 dark:text-emerald-400">92</span>
                    <span className="text-xs text-slate-400 font-normal">/ 100</span>
                  </div>
                </div>
              </motion.div>

              {/* Floating Bottom-Right Card: AI Interview Prep */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -bottom-6 -right-4 sm:-right-8 rounded-xl bg-white dark:bg-navy-900/90 backdrop-blur-xl border border-slate-200 dark:border-cyber-500/30 p-3.5 shadow-xl flex items-center gap-3 hidden sm:flex"
              >
                <div className="w-10 h-10 rounded-lg bg-cyber-500/15 flex items-center justify-center text-cyber-600 dark:text-cyber-300">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
                    AI Interview Prep
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>95% Confidence Match</span>
                  </div>
                </div>
              </motion.div>

              {/* Floating Counter Badge: Matching Jobs */}
              <motion.div
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 right-4 px-3 py-1.5 rounded-full bg-white dark:bg-navy-950/90 border border-slate-200 dark:border-white/10 shadow-lg text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-cyber-500 animate-pulse" />
                <span>1,250+ Matching Jobs</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
