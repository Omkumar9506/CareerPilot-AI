import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CandidateProfilePage } from './CandidateProfilePage';
import { RecruiterProfilePage } from './RecruiterProfilePage';

export const ProfileRouterPage = () => {
  const { user } = useAuth();

  if (user?.role === 'recruiter') {
    return <RecruiterProfilePage />;
  }

  return <CandidateProfilePage />;
};
