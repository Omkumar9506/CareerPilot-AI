import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../common/Button';
import { Rocket, ArrowRight, Briefcase, Sparkles } from 'lucide-react';

export const CTA = () => {
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden p-8 sm:p-14 lg:p-20 bg-gradient-to-br from-indigo-50/90 via-white to-cyan-50/90 dark:from-navy-900/95 dark:via-brand-950/70 dark:to-navy-900/95 border border-indigo-200/80 dark:border-brand-500/30 shadow-xl dark:shadow-2xl shadow-brand-500/10 transition-colors duration-200"
        >
          {/* Ambient Lighting FX */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-brand-500/10 dark:bg-brand-500/20 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-cyber-500/10 dark:bg-cyber-500/20 blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
            {/* Left Content */}
            <div className="max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-xs font-semibold text-brand-700 dark:text-brand-300 mb-6">
                <Rocket className="w-4 h-4 text-cyber-600 dark:text-cyber-400" />
                <span>Supercharge Your Trajectory</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight transition-colors">
                Ready to Accelerate{' '}
                <span className="gradient-ai">Your Career?</span>
              </h2>

              <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed transition-colors">
                Join professionals who are using AI to build a smarter career.
                Analyze your resume, prepare with AI interviews, and get matched
                to top global employers in minutes.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link to="/register" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto font-semibold"
                    icon={ArrowRight}
                    iconPosition="right"
                  >
                    Get Started Today
                  </Button>
                </Link>
                <Link to="/jobs" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto"
                    icon={Briefcase}
                  >
                    Browse Jobs
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Decorative Graphic */}
            <div className="relative flex items-center justify-center">
              <div className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-full bg-gradient-to-tr from-brand-600/20 to-cyber-500/20 p-1 flex items-center justify-center shadow-glow-sm">
                <div className="w-full h-full rounded-full bg-white/90 dark:bg-navy-950/80 backdrop-blur-xl flex flex-col items-center justify-center text-center p-6 border border-slate-200 dark:border-white/10 transition-colors">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-cyber-500 flex items-center justify-center shadow-lg shadow-brand-500/30 mb-3 animate-float-slow">
                    <Rocket className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    CareerPilot AI <Sparkles className="w-3.5 h-3.5 text-cyber-500 dark:text-cyber-400" />
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Automated & Precision-Driven
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
