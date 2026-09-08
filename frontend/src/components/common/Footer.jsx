import React from 'react';
import { Compass, Github, Twitter, Linkedin, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/90 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <Compass className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">CareerPilot AI</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empowering job seekers and recruiters with AI-driven resume scoring, intelligent matching, and interview simulations.
            </p>
            <div className="flex items-center gap-3 text-slate-400">
              <a href="#" className="p-2 rounded-lg bg-slate-900 hover:text-brand-400 hover:bg-slate-800 transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-900 hover:text-brand-400 hover:bg-slate-800 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-900 hover:text-brand-400 hover:bg-slate-800 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* For Job Seekers */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Job Seekers</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="/jobs" className="hover:text-white transition-colors">Explore Jobs</a></li>
              <li><a href="/resume-analyzer" className="hover:text-white transition-colors">AI Resume Analyzer</a></li>
              <li><a href="/mock-interview" className="hover:text-white transition-colors">AI Mock Interviews</a></li>
              <li><a href="/roadmap" className="hover:text-white transition-colors">Skill Gap Roadmap</a></li>
            </ul>
          </div>

          {/* For Recruiters */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Recruiters</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="/recruiter/jobs/create" className="hover:text-white transition-colors">Post a Job</a></li>
              <li><a href="/recruiter/applicants" className="hover:text-white transition-colors">Talent Search</a></li>
              <li><a href="/recruiter/interviews" className="hover:text-white transition-colors">Schedule Interviews</a></li>
              <li><a href="/pricing" className="hover:text-white transition-colors">Hiring Plans</a></li>
            </ul>
          </div>

          {/* Platform Status & Architecture */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">System Status</h4>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-medium text-emerald-400">All Systems Operational</span>
              </div>
              <p className="text-xs text-slate-500">
                Phase 1: Architecture & Base Services active.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-850 border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CareerPilot AI Inc. Built for high-impact careers.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>using React 19, Node.js & Google Gemini</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
