import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../common/Navbar';
import { Footer } from '../common/Footer';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
