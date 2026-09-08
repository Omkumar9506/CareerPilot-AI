import React from 'react';
import { Hero } from '../../components/landing/Hero';
import { Stats } from '../../components/landing/Stats';
import { Features } from '../../components/landing/Features';
import { RoleCards } from '../../components/landing/RoleCards';
import { TrustedCompanies } from '../../components/landing/TrustedCompanies';
import { Testimonials } from '../../components/landing/Testimonials';
import { CTA } from '../../components/landing/CTA';

export const Home = () => {
  return (
    <div className="relative w-full overflow-hidden">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Stats Section */}
      <Stats />

      {/* 3. AI Features Section */}
      <Features />

      {/* 4. Role-Based Section (3 Communities) */}
      <RoleCards />

      {/* 5. Trusted Companies Showcase */}
      <TrustedCompanies />

      {/* 6. Testimonials Carousel / Grid */}
      <Testimonials />

      {/* 7. Final CTA Banner */}
      <CTA />
    </div>
  );
};

export default Home;
