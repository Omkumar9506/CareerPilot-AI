import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SectionHeading } from '../common/SectionHeading';
import {
  FileSearch,
  Sparkles,
  Bot,
  Compass,
  ArrowRight,
  Cpu,
} from 'lucide-react';

export const Features = () => {
  const featureCards = [
    {
      id: 'resume-analyzer',
      title: 'AI Resume Analyzer',
      description:
        'Get instant ATS scores, keyword suggestions, and detailed feedback powered by Google Gemini.',
      link: '/resume-analyzer',
      icon: FileSearch,
      iconColor: 'text-brand-600 dark:text-brand-400',
      iconBg: 'bg-brand-500/10 border-brand-500/20 group-hover:border-brand-500/40',
      glowColor: 'group-hover:shadow-brand-500/10 dark:group-hover:shadow-brand-500/20',
      badge: 'Gemini 1.5 Pro',
    },
    {
      id: 'job-matching',
      title: 'Intelligent Job Matching',
      description:
        'Discover jobs that match your skills, experience, and career goals using advanced AI algorithms.',
      link: '/jobs',
      icon: Sparkles,
      iconColor: 'text-cyber-600 dark:text-cyber-400',
      iconBg: 'bg-cyber-500/10 border-cyber-500/20 group-hover:border-cyber-500/40',
      glowColor: 'group-hover:shadow-cyber-500/10 dark:group-hover:shadow-cyber-500/20',
      badge: '98% Accuracy',
    },
    {
      id: 'mock-interviews',
      title: 'AI Mock Interviews',
      description:
        'Practice with role-specific questions, get real-time feedback, and improve your confidence.',
      link: '/mock-interview',
      icon: Bot,
      iconColor: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-500/10 border-purple-500/20 group-hover:border-purple-500/40',
      glowColor: 'group-hover:shadow-purple-500/10 dark:group-hover:shadow-purple-500/20',
      badge: 'Real-Time Voice & Text',
    },
    {
      id: 'skill-gap-roadmaps',
      title: 'Skill Gap & Roadmaps',
      description:
        'Identify missing skills and get a personalized learning roadmap to stay ahead in your career.',
      link: '/roadmap',
      icon: Compass,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-500/40',
      glowColor: 'group-hover:shadow-emerald-500/10 dark:group-hover:shadow-emerald-500/20',
      badge: 'Step-by-Step Paths',
    },
  ];

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden" id="features">
      {/* Background soft ambient accents */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-brand-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-cyber-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeading
          badge="Core AI Suite"
          badgeIcon={Cpu}
          title="Everything You Need to"
          highlight="Build a Successful Career"
          subtitle="Powerful AI tools and resources to help you at every step of your journey."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {featureCards.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  to={feat.link}
                  className={`group relative flex flex-col justify-between h-full p-7 rounded-2xl bg-white dark:bg-navy-900/70 backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] shadow-md dark:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-brand-500/40 hover:shadow-xl dark:hover:shadow-2xl ${feat.glowColor} focus:outline-none focus:ring-2 focus:ring-brand-500`}
                >
                  {/* Subtle top indicator badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${feat.iconBg}`}
                    >
                      <Icon className={`w-6 h-6 ${feat.iconColor}`} />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.04] px-2.5 py-1 rounded-full border border-slate-200 dark:border-white/[0.06]">
                      {feat.badge}
                    </span>
                  </div>

                  {/* Feature Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>

                  {/* CTA link */}
                  <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/[0.06] flex items-center text-sm font-semibold text-brand-600 dark:text-brand-400 group-hover:text-cyber-600 dark:group-hover:text-cyber-300 transition-colors">
                    <span>Learn More</span>
                    <ArrowRight className="w-4 h-4 ml-1.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
