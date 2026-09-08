import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionHeading } from '../common/SectionHeading';
import {
  Quote,
  ChevronLeft,
  ChevronRight,
  Star,
  MessageSquareQuote,
} from 'lucide-react';

export const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      quote:
        'CareerPilot AI helped me land my dream job at Google. The resume analyzer increased my ATS match score from 61% to 94%, and the mock interview feedback made the actual technical rounds feel familiar.',
      name: 'Aarav Patel',
      role: 'Senior Frontend Engineer',
      company: 'Placed at Google',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      rating: 5,
    },
    {
      id: 2,
      quote:
        'As a technical recruiter handling hundreds of applicants weekly, CareerPilot AI cut our screening time by 70%. The AI candidate scoring surfaces candidates who truly excel in real-world skills.',
      name: 'Sarah Jenkins',
      role: 'Head of Talent Acquisition',
      company: 'ScaleTech Global',
      avatar:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      rating: 5,
    },
    {
      id: 3,
      quote:
        'The skill gap roadmap gave me a crystal clear blueprint of exactly what concepts I needed to master to switch from QA to Full Stack Engineering. The guided practice made all the difference.',
      name: 'David Chen',
      role: 'Full Stack Developer',
      company: 'Placed at Microsoft',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      rating: 5,
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden" id="testimonials">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <SectionHeading
            badge="Success Stories"
            badgeIcon={MessageSquareQuote}
            title="What Our Users"
            highlight="Say"
            subtitle="Real stories from ambitious professionals and recruiting teams accelerating their growth (Demo Showcase)."
            align="left"
            className="mb-0 md:mb-0"
          />

          {/* Desktop Carousel Controls */}
          <div className="hidden md:flex items-center gap-3 mt-6 md:mt-0">
            <button
              onClick={handlePrev}
              className="p-3 rounded-xl border border-white/10 bg-navy-900/60 hover:bg-white/[0.08] text-slate-300 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-3 rounded-xl border border-white/10 bg-navy-900/60 hover:bg-white/[0.08] text-slate-300 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Testimonials Grid (Desktop: 3 cards, Mobile: Carousel / Stack) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className={`relative flex flex-col justify-between p-8 rounded-3xl bg-navy-900/70 backdrop-blur-2xl border transition-all duration-300 ${
                activeIndex === idx
                  ? 'border-brand-500/50 shadow-glow-sm shadow-brand-500/10'
                  : 'border-white/[0.08] hover:border-white/20'
              }`}
            >
              {/* Quote Icon & Star Rating */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                    <Quote className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                </div>

                {/* Quote text */}
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed italic">
                  "{item.quote}"
                </p>
              </div>

              {/* Author Info */}
              <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center gap-4">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-brand-500/30"
                />
                <div>
                  <h4 className="text-base font-bold text-white">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {item.role} •{' '}
                    <span className="text-brand-300 font-medium">
                      {item.company}
                    </span>
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile Carousel Controls */}
        <div className="flex md:hidden items-center justify-center gap-3 mt-8">
          <button
            onClick={handlePrev}
            className="p-2.5 rounded-xl border border-white/10 bg-navy-900/60 text-slate-300"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs text-slate-400 font-medium">
            {activeIndex + 1} / {testimonials.length}
          </span>
          <button
            onClick={handleNext}
            className="p-2.5 rounded-xl border border-white/10 bg-navy-900/60 text-slate-300"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
