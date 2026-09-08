import React from 'react';
import { motion } from 'framer-motion';

export const TrustedCompanies = () => {
  const companies = [
    { name: 'Google', symbol: 'G' },
    { name: 'Microsoft', symbol: 'MS' },
    { name: 'Amazon', symbol: 'AMZN' },
    { name: 'Infosys', symbol: 'INFY' },
    { name: 'TCS', symbol: 'TCS' },
    { name: 'Accenture', symbol: 'ACN' },
    { name: 'Flipkart', symbol: 'FK' },
    { name: 'Zoho', symbol: 'ZH' },
    { name: 'Adobe', symbol: 'ADB' },
    { name: 'Deloitte', symbol: 'DLT' },
  ];

  return (
    <section className="py-16 sm:py-20 border-y border-white/[0.06] bg-navy-950/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-slate-400">
            Trusted by Talent & Teams from Innovative Companies
          </p>
          <span className="text-[11px] text-slate-500 italic mt-1 block">
            Sample representative tech companies whose roles and requirements are indexed
          </span>
        </div>

        {/* Company Logo Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 sm:gap-8 items-center justify-center opacity-80">
          {companies.map((company, index) => (
            <motion.div
              key={company.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group flex items-center justify-center py-3 px-4 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-200"
            >
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-400 group-hover:text-white transition-colors">
                {company.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedCompanies;
