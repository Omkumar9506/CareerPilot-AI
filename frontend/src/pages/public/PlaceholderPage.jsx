import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  Sparkles,
  ArrowLeft,
  Building,
  Briefcase,
  Compass,
  Cpu,
  CreditCard,
  Info,
} from 'lucide-react';

const routeDetails = {
  '/about': {
    title: 'About CareerPilot AI',
    subtitle: 'Building the next generation of precision talent matching and AI career acceleration.',
    badge: 'Our Mission',
    icon: Info,
    highlights: [
      'Founded to eliminate hiring bias and career opacity',
      'Powered by state-of-the-art Google Gemini AI models',
      'Targeted for both active job seekers and agile hiring teams',
    ],
  },
  '/ai-tools': {
    title: 'AI Career Intelligence Tools',
    subtitle: 'A full suite of generative AI tools engineered to give candidates and employers an unfair advantage.',
    badge: 'AI Ecosystem',
    icon: Cpu,
    highlights: [
      'ATS Resume Optimization with 98% matching accuracy',
      'Realistic role-specific AI Mock Interviews with real-time feedback',
      'Dynamic Skill Gap Roadmaps mapped to live industry demand',
    ],
  },
  '/employers': {
    title: 'For Employers & Hiring Teams',
    subtitle: 'Hire top 1% talent in 10x less time with automated candidate skill verification.',
    badge: 'Enterprise Talent',
    icon: Building,
    highlights: [
      'Automated semantic resume screening powered by Gemini',
      'Instant AI candidate rankings matching your exact role criteria',
      'End-to-end recruitment tracking and automated candidate communications',
    ],
  },
  '/pricing': {
    title: 'Flexible Plans for Every Stage',
    subtitle: 'Transparent, value-driven pricing designed for candidates, recruiters, and scaling teams.',
    badge: 'Transparent Pricing',
    icon: CreditCard,
    highlights: [
      'Free Candidate Tier: ATS analyzer, job search, community roadmaps',
      'Pro Candidate: Unlimited AI mock interviews and priority job matching',
      'Recruiter Teams: AI job posting, automated candidate scoring, analytics',
    ],
  },
};

export const PlaceholderPage = () => {
  const location = useLocation();
  const config = routeDetails[location.pathname] || {
    title: 'Platform Feature',
    subtitle: 'This feature is currently in preview as part of CareerPilot AI rollout.',
    badge: 'In Development',
    icon: Sparkles,
    highlights: [
      'Continuously synced with the backend microservices',
      'Preview testing in progress with select beta teams',
    ],
  };

  const Icon = config.icon;

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 glow-radial-bg relative">
      <div className="max-w-2xl w-full text-center rounded-3xl bg-white dark:bg-navy-900/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 p-8 sm:p-12 shadow-xl dark:shadow-2xl relative overflow-hidden transition-colors duration-200">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-60 h-60 bg-brand-500/10 dark:bg-brand-500/15 blur-3xl rounded-full pointer-events-none" />

        <div className="inline-flex mb-6">
          <Badge variant="glow" size="lg" icon={Icon}>
            {config.badge}
          </Badge>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight transition-colors">
          {config.title}
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed transition-colors">
          {config.subtitle}
        </p>

        {/* Feature Highlights */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/[0.08] text-left space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-300">
            What to expect:
          </h4>
          <ul className="space-y-2.5">
            {config.highlights.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-500 dark:bg-cyber-400 mt-2 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Navigation CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/">
            <Button variant="secondary" icon={ArrowLeft}>
              Back to Home
            </Button>
          </Link>
          <Link to="/jobs">
            <Button variant="primary" icon={Briefcase}>
              Explore Live Jobs
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;
