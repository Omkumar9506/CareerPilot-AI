import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PublicLayout } from './components/layout/PublicLayout';
import { HomePage } from './pages/HomePage';
import { JobsPage } from './pages/JobsPage';
import { JobDetailsPage } from './pages/JobDetailsPage';
import { ResumeAnalyzerPage } from './pages/ResumeAnalyzerPage';
import { MockInterviewPage } from './pages/MockInterviewPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PlaceholderPage } from './pages/public/PlaceholderPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProfileRouterPage } from './pages/ProfileRouterPage';
import { RecruiterJobsPage } from './pages/RecruiterJobsPage';
import { CandidateApplicationsPage } from './pages/CandidateApplicationsPage';
import { RecruiterApplicantsPage } from './pages/RecruiterApplicantsPage';
import { ResumeUploadPage } from './pages/ResumeUploadPage';
import { RecruiterInterviewsPage } from './pages/RecruiterInterviewsPage';
import { CandidateInterviewsPage } from './pages/CandidateInterviewsPage';
import { CandidateDashboardPage } from './pages/CandidateDashboardPage';
import { RecruiterDashboardPage } from './pages/RecruiterDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ProtectedRoute } from './components/common/ProtectedRoute';

import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Main Layout */}
          <Route path="/" element={<PublicLayout />}>
            {/* Core Public Routes */}
            <Route index element={<HomePage />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="jobs/:id" element={<JobDetailsPage />} />
            <Route path="resume-analyzer" element={<ResumeAnalyzerPage />} />
            <Route path="mock-interview" element={<MockInterviewPage />} />
            <Route path="roadmap" element={<RoadmapPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />

            {/* Extended Platform Routes */}
            <Route path="about" element={<PlaceholderPage />} />
            <Route path="ai-tools" element={<PlaceholderPage />} />
            <Route path="employers" element={<PlaceholderPage />} />
            <Route path="pricing" element={<PlaceholderPage />} />
            <Route path="privacy" element={<PlaceholderPage />} />
            <Route path="terms" element={<PlaceholderPage />} />
            <Route path="cookies" element={<PlaceholderPage />} />
            <Route path="sitemap" element={<PlaceholderPage />} />

            {/* Protected Profile Route */}
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <ProfileRouterPage />
                </ProtectedRoute>
              }
            />

            {/* Candidate Dashboard */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute allowedRoles={['candidate', 'admin']}>
                  <CandidateDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Candidate Resume Management */}
            <Route
              path="resume"
              element={
                <ProtectedRoute allowedRoles={['candidate', 'admin']}>
                  <ResumeUploadPage />
                </ProtectedRoute>
              }
            />

            {/* Candidate Applications Tracker */}
            <Route
              path="applications"
              element={
                <ProtectedRoute allowedRoles={['candidate', 'admin']}>
                  <CandidateApplicationsPage />
                </ProtectedRoute>
              }
            />

            {/* Recruiter Dashboard */}
            <Route
              path="recruiter/dashboard"
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <RecruiterDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Recruiter Job Management */}
            <Route
              path="recruiter/jobs"
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <RecruiterJobsPage />
                </ProtectedRoute>
              }
            />

            {/* Recruiter Applicant Screening */}
            <Route
              path="recruiter/applicants"
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <RecruiterApplicantsPage />
                </ProtectedRoute>
              }
            />

            {/* Recruiter Interview Management */}
            <Route
              path="recruiter/interviews"
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <RecruiterInterviewsPage />
                </ProtectedRoute>
              }
            />

            {/* Candidate Scheduled Interviews */}
            <Route
              path="interviews"
              element={
                <ProtectedRoute allowedRoles={['candidate', 'admin']}>
                  <CandidateInterviewsPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Platform & Moderation Dashboard */}
            <Route
              path="admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
