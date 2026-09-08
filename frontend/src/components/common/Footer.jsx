import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Github, Twitter, Linkedin, Heart, Sparkles, Shield, ArrowUpRight } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/95 text-slate-400 transition-colors light:bg-white light:border-slate-200 light:text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Brand Col (2 cols wide on large screens) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-cyber-400 p-[2px] shadow-md shadow-brand-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[9px] flex items-center justify-center light:bg-white">
                  <Compass className="w-4 h-4 text-brand-400 light:text-brand-600" />
                </div>
              </div>
              <span className="text-xl font-bold text-white tracking-tight light:text-slate-900">
                CareerPilot <span className="text-xs font-extrabold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30 light:bg-brand-50 light:text-brand-700">AI</span>
              </span>
            </Link>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed light:text-slate-600">
              The intelligent career management and AI-powered hiring ecosystem. Connecting top engineering talent with forward-thinking companies through Google Gemini.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noreferrer"
                aria-label="GitHub"
                className="p-2.5 rounded-xl bg-slate-900 hover:text-white hover:bg-slate-800 border border-slate-800 transition-all light:bg-slate-100 light:border-slate-200 light:text-slate-600 light:hover:text-slate-900"
              >
                <Github className="w-4 h-4" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noreferrer"
                aria-label="LinkedIn"
                className="p-2.5 rounded-xl bg-slate-900 hover:text-white hover:bg-slate-800 border border-slate-800 transition-all light:bg-slate-100 light:border-slate-200 light:text-slate-600 light:hover:text-slate-900"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noreferrer"
                aria-label="Twitter"
                className="p-2.5 rounded-xl bg-slate-900 hover:text-white hover:bg-slate-800 border border-slate-800 transition-all light:bg-slate-100 light:border-slate-200 light:text-slate-600 light:hover:text-slate-900"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* For Job Seekers */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 light:text-slate-900">
              Job Seekers
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/jobs" className="hover:text-white transition-colors light:hover:text-brand-600">
                  Browse Tech Jobs
                </Link>
              </li>
              <li>
                <Link to="/resume-analyzer" className="hover:text-white transition-colors light:hover:text-brand-600 flex items-center gap-1.5">
                  <span>AI Resume Analyzer</span>
                  <span className="text-[9px] bg-brand-500/20 text-brand-400 px-1 rounded">AI</span>
                </Link>
              </li>
              <li>
                <Link to="/mock-interview" className="hover:text-white transition-colors light:hover:text-brand-600">
                  AI Mock Interviews
                </Link>
              </li>
              <li>
                <Link to="/roadmap" className="hover:text-white transition-colors light:hover:text-brand-600">
                  Skill Gap Roadmaps
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors light:hover:text-brand-600">
                  Create Candidate Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 light:text-slate-900">
              Employers
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/register?role=recruiter" className="hover:text-white transition-colors light:hover:text-brand-600">
                  Post a Tech Job
                </Link>
              </li>
              <li>
                <Link to="/recruiter/dashboard" className="hover:text-white transition-colors light:hover:text-brand-600">
                  Recruiter Hub
                </Link>
              </li>
              <li>
                <Link to="/recruiter/applicants" className="hover:text-white transition-colors light:hover:text-brand-600">
                  AI Candidate Screening
                </Link>
              </li>
              <li>
                <a href="#pricing-section" className="hover:text-white transition-colors light:hover:text-brand-600">
                  Pricing Plans
                </a>
              </li>
            </ul>
          </div>

          {/* System & Architecture */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 light:text-slate-900">
              Platform Status
            </h4>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5 light:bg-slate-50 light:border-slate-200">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold text-emerald-400">All Systems Operational</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug light:text-slate-500">
                Core APIs, Gemini 1.5 Pro, and ATS parsing clusters operating at 99.98% uptime.
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-[10px] text-slate-500">
                <Shield className="w-3 h-3 text-brand-400" />
                <span>Enterprise SOC2 & TLS 1.3</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-850 border-slate-800/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 light:border-slate-200 light:text-slate-500">
          <p>© {new Date().getFullYear()} CareerPilot AI Inc. All rights reserved. "Your Career, Supercharged".</p>
          <div className="flex items-center gap-1.5">
            <span>Powered by</span>
            <span className="font-semibold text-brand-400">React 19</span>
            <span>•</span>
            <span className="font-semibold text-cyber-400">Google Gemini</span>
            <span>•</span>
            <span className="font-semibold text-purple-400">Node.js</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
