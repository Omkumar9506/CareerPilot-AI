import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SectionHeading } from '../common/SectionHeading';
import { Button } from '../common/Button';
import {
  UserCheck,
  Building,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Layers,
} from 'lucide-react';

export const RoleCards = () => {
  const roles = [
    {
      id: 'job-seekers',
      role: 'Job Seekers',
      badge: 'Candidates & Talent',
      description:
        'Elevate your career trajectory with automated resume tailoring, AI interview simulation, and algorithmic job matching.',
      features: [
        'AI Resume Analysis',
        'Smart Job Recommendations',
        'Mock Interviews',
        'Personalized Learning Roadmaps',
      ],
      ctaText: 'Get Started',
      ctaLink: '/register?role=candidate',
      ctaVariant: 'primary',
      icon: UserCheck,
      badgeColor: 'bg-brand-500/10 text-brand-300 border-brand-500/20',
      gradientBorder: 'hover:border-brand-500/40',
      image:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 'recruiters',
      role: 'Recruiters',
      badge: 'Hiring Teams & Enterprises',
      description:
        'Streamline your pipeline. Discover qualified candidates matched by real skill vectors, not just keyword mentions.',
      features: [
        'Post and Manage Jobs',
        'AI Candidate Matching',
        'Candidate Screening',
        'Recruitment Analytics',
      ],
      ctaText: 'Start Hiring',
      ctaLink: '/employers',
      ctaVariant: 'glow',
      icon: Building,
      badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
      gradientBorder: 'hover:border-purple-500/40',
      image:
        'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 'administrators',
      role: 'Administrators',
      badge: 'Platform Ops & Security',
      description:
        'Total visibility into platform velocity, job authenticity, AI usage metrics, and community moderation.',
      features: [
        'User Management',
        'Platform Analytics',
        'Content Moderation',
        'System Controls',
      ],
      ctaText: 'Admin Portal',
      ctaLink: '/login',
      ctaVariant: 'secondary',
      icon: ShieldCheck,
      badgeColor: 'bg-cyber-500/10 text-cyber-300 border-cyber-500/20',
      gradientBorder: 'hover:border-cyber-500/40',
      image:
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden bg-navy-900/30" id="communities">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Ecosystem Alignment"
          badgeIcon={Layers}
          title="One Platform. Three Communities."
          highlight="A Brighter Future."
          subtitle="Tailored experiences for job seekers, recruiters, and administrators."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {roles.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className={`relative flex flex-col justify-between rounded-3xl bg-navy-950/80 backdrop-blur-2xl border border-white/[0.08] overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${item.gradientBorder}`}
              >
                {/* Header Image Header */}
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.role}
                    className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/60 to-transparent" />
                  
                  {/* Floating Role Badge */}
                  <div className="absolute top-4 left-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border ${item.badgeColor}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {item.badge}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-extrabold text-white">
                      {item.role}
                    </h3>
                    <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Features list */}
                    <ul className="mt-6 space-y-3 pt-6 border-t border-white/[0.06]">
                      {item.features.map((feat) => (
                        <li
                          key={feat}
                          className="flex items-start gap-2.5 text-sm text-slate-300"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <div className="mt-8 pt-6 border-t border-white/[0.06]">
                    <Link to={item.ctaLink} className="w-full block">
                      <Button
                        variant={item.ctaVariant}
                        size="md"
                        className="w-full justify-center text-sm font-semibold"
                        icon={ArrowRight}
                        iconPosition="right"
                      >
                        {item.ctaText}
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RoleCards;
