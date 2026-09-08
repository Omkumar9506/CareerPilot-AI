import React from 'react';
import { Users, Building2, Briefcase, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export const Stats = () => {
  const stats = [
    {
      id: 'seekers',
      icon: Users,
      value: '1M+',
      label: 'Active Job Seekers',
      color: 'from-brand-600 to-indigo-500 dark:from-brand-400 dark:to-indigo-300',
      iconBg: 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20',
    },
    {
      id: 'companies',
      icon: Building2,
      value: '10K+',
      label: 'Hiring Companies',
      color: 'from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-300',
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    },
    {
      id: 'jobs',
      icon: Briefcase,
      value: '500K+',
      label: 'Jobs Posted',
      color: 'from-cyber-600 to-blue-500 dark:from-cyber-400 dark:to-blue-400',
      iconBg: 'bg-cyber-500/10 text-cyber-600 dark:text-cyber-400 border-cyber-500/20',
    },
    {
      id: 'satisfaction',
      icon: Star,
      value: '4.8/5',
      label: 'User Satisfaction',
      color: 'from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-400',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    },
  ];

  return (
    <section className="relative z-10 -mt-8 sm:-mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6 }}
        className="rounded-2xl lg:rounded-3xl bg-white dark:bg-navy-900/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-2xl p-6 sm:p-8 lg:p-10 transition-colors duration-200"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-white/[0.08]">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.id}
                className={`flex flex-col items-center text-center ${
                  idx > 0 && idx % 2 === 0 ? 'pt-6 md:pt-0' : ''
                } ${idx % 2 !== 0 ? 'pt-6 sm:pt-0 md:pt-0 md:pl-6' : ''} ${
                  idx > 0 ? 'md:pl-6' : ''
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-3 shadow-inner ${stat.iconBg}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div
                  className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                >
                  {stat.value}
                </div>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
};

export default Stats;
