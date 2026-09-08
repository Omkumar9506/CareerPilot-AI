import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Clock, 
  Building2, 
  Globe, 
  CheckCircle2, 
  Loader2, 
  Share2, 
  Bookmark, 
  Sparkles,
  ShieldCheck,
  Calendar,
  AlertCircle,
  TrendingUp,
  Cpu,
  Layers,
  FileText
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ApplyModal } from '../components/jobs/ApplyModal';

export const JobDetailsPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const isCandidate = isAuthenticated && user?.role === 'candidate';

  const [job, setJob] = useState(null);
  const [recruiterProfile, setRecruiterProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Application flow state
  const [hasApplied, setHasApplied] = useState(false);
  const [existingApp, setExistingApp] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // AI Match state
  const [aiMatch, setAiMatch] = useState(null);
  const [loadingMatch, setLoadingMatch] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const res = await api.get(`/jobs/${id}`);
        if (res.success && res.data?.job) {
          setJob(res.data.job);
          setRecruiterProfile(res.data.recruiterProfile);
        } else {
          setError('Job vacancy not found or has been closed.');
        }

        // Check if candidate already applied & fetch AI Match
        if (isCandidate) {
          try {
            const checkRes = await api.get(`/applications/check/${id}`);
            if (checkRes.success && checkRes.data?.hasApplied) {
              setHasApplied(true);
              setExistingApp(checkRes.data.application);
            }
          } catch (e) {
            // Non-blocking
          }

          setLoadingMatch(true);
          try {
            const matchRes = await api.get(`/matches/job/${id}`);
            if (matchRes.success && matchRes.data?.match) {
              setAiMatch(matchRes.data.match);
            }
          } catch (e) {
            // Non-blocking
          } finally {
            setLoadingMatch(false);
          }
        }
      } catch (err) {
        setError(err.message || 'Error fetching job details.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id, isAuthenticated, isCandidate]);

  const handleApplicationSuccess = (application) => {
    setHasApplied(true);
    setExistingApp(application);
    setShowApplyModal(false);
    setSuccessMessage('Your application has been submitted successfully!');
  };

  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return 'Competitive Compensation';
    const currency = salary.currency === 'USD' ? '$' : salary.currency;
    if (salary.min && salary.max) {
      return `${currency}${salary.min.toLocaleString()} - ${currency}${salary.max.toLocaleString()} / year`;
    }
    if (salary.min) return `From ${currency}${salary.min.toLocaleString()} / year`;
    return `Up to ${currency}${salary.max.toLocaleString()} / year`;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-sm text-slate-400">Loading position details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 glass-card rounded-2xl border border-slate-800 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">{error || 'Position Not Found'}</h2>
        <p className="text-sm text-slate-400">The listing may have expired or been removed by the employer.</p>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Browse All Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back Link */}
      <div>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Open Positions
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="bg-white dark:bg-slate-900/60 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 relative overflow-hidden transition-colors">
        {/* Subtle top glow if high match */}
        {aiMatch?.matchScore >= 85 && (
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
        )}

        <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xl font-extrabold text-brand-600 dark:text-brand-400 shadow-inner">
              {job.company?.[0] || 'C'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">{job.company}</span>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {job.status}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  {job.location} ({job.workplaceType})
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  {job.employmentType} ({job.experienceLevel})
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            {isCandidate ? (
              hasApplied ? (
                <div className="px-6 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Applied ({existingApp?.status || 'Under Review'})</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="px-8 py-3 bg-gradient-to-r from-brand-600 via-indigo-600 to-cyber-600 hover:scale-[1.02] text-white text-sm font-semibold rounded-xl shadow-lg shadow-brand-600/30 hover:shadow-brand-600/50 transition-all text-center"
                >
                  Apply for this Role
                </button>
              )
            ) : !isAuthenticated ? (
              <Link
                to="/login"
                className="px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-brand-600/30 hover:shadow-brand-600/50 transition-all text-center"
              >
                Sign In to Apply
              </Link>
            ) : (
              <span className="text-xs text-slate-500 dark:text-slate-400 px-3 py-2 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                Viewing as {user.role}
              </span>
            )}
          </div>
        </div>

        {/* Success Alert if just submitted */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{successMessage}</span>
            </div>
            <Link to="/applications" className="text-brand-600 dark:text-brand-300 hover:underline font-semibold">
              Track Applications →
            </Link>
          </div>
        )}

        {/* Apply Modal */}
        {showApplyModal && (
          <ApplyModal
            job={job}
            onClose={() => setShowApplyModal(false)}
            onSuccess={handleApplicationSuccess}
          />
        )}

        {/* Highlight Compensation Bar */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 uppercase font-semibold">Compensation Range</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{formatSalary(job.salary)}</p>
            </div>
          </div>

          {job.deadline && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 uppercase font-semibold">Application Deadline</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{new Date(job.deadline).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Compatibility & Fit Analysis Card (Candidate Only) */}
      {isCandidate && (
        <div className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-brand-950/20 dark:to-slate-900 p-6 sm:p-8 rounded-3xl border border-brand-500/30 shadow-md space-y-6 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  AI Compatibility & Fit Analysis
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-600 dark:text-brand-300 font-bold border border-brand-500/30">
                    Phase 9
                  </span>
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Algorithmic alignment between your candidate profile and this specific vacancy.
                </p>
              </div>
            </div>

            {aiMatch && (
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${aiMatch.badgeColor}`}>
                  {aiMatch.matchScore}% - {aiMatch.matchLevel}
                </span>
              </div>
            )}
          </div>

          {loadingMatch ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
              <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
              <span>Analyzing profile alignment...</span>
            </div>
          ) : aiMatch ? (
            <div className="space-y-6">
              
              {/* Fit Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">Diagnostic Insight: </span>
                  {aiMatch.summary}
                </div>
              </div>

              {/* 4-Factor Breakdown Progress Bars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Skills Fit */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Skills Coverage</span>
                    <span className="text-slate-900 dark:text-white font-bold">{aiMatch.breakdown?.skillsScore}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-indigo-500 transition-all duration-500"
                      style={{ width: `${aiMatch.breakdown?.skillsScore}%` }}
                    />
                  </div>
                </div>

                {/* Experience Fit */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Experience Level</span>
                    <span className="text-slate-900 dark:text-white font-bold">{aiMatch.breakdown?.experienceScore}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 transition-all duration-500"
                      style={{ width: `${aiMatch.breakdown?.experienceScore}%` }}
                    />
                  </div>
                </div>

                {/* Location Fit */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Location / Remote</span>
                    <span className="text-slate-900 dark:text-white font-bold">{aiMatch.breakdown?.locationScore}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-500"
                      style={{ width: `${aiMatch.breakdown?.locationScore}%` }}
                    />
                  </div>
                </div>

                {/* Role Fit */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Role & Title Fit</span>
                    <span className="text-slate-900 dark:text-white font-bold">{aiMatch.breakdown?.roleScore}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${aiMatch.breakdown?.roleScore}%` }}
                    />
                  </div>
                </div>

              </div>

              {/* Matched vs Missing Skills Clusters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Matched Skills */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-emerald-500/20 space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase">
                    <CheckCircle2 className="w-4 h-4" />
                    Matched Skills ({aiMatch.matchedSkills?.length || 0})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {aiMatch.matchedSkills?.length > 0 ? (
                      aiMatch.matchedSkills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium"
                        >
                          ✓ {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">No overlapping skills registered in profile</span>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-rose-500/20 space-y-2.5">
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-semibold uppercase">
                    <AlertCircle className="w-4 h-4" />
                    Missing / High-Value Gaps ({aiMatch.missingSkills?.length || 0})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {aiMatch.missingSkills?.length > 0 ? (
                      aiMatch.missingSkills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-medium"
                        >
                          + {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400">All required tech skills satisfied!</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Banner to AI Resume Optimizer */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Want to boost your ATS compatibility for this role?</h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">Run a deep Gemini audit against this exact vacancy to get custom bullet rewrites.</p>
                  </div>
                </div>
                <Link
                  to={`/resume-analyzer`}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-brand-600 dark:text-brand-300 hover:text-brand-700 dark:hover:text-white text-xs font-semibold border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5 shrink-0 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  Optimize Resume for Role
                </Link>
              </div>

            </div>
          ) : (
            <div className="text-xs text-slate-500 text-center py-4">
              Complete your profile skills and experience to unlock AI compatibility diagnostics.
            </div>
          )}
        </div>
      )}

      {/* Grid: Job Content + Company Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Description, Responsibilities, Requirements */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Overview */}
          <div className="bg-white dark:bg-slate-900/60 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Role Overview</h2>
            <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {job.description}
            </div>
          </div>

          {/* Key Responsibilities */}
          {job.responsibilities?.length > 0 && (
            <div className="bg-white dark:bg-slate-900/60 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Key Responsibilities</h2>
              <ul className="space-y-2.5">
                {job.responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0 mt-1" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {job.requirements?.length > 0 && (
            <div className="bg-white dark:bg-slate-900/60 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Requirements & Qualifications</h2>
              <ul className="space-y-2.5">
                {job.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyber-400 flex-shrink-0 mt-1" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills Required */}
          {job.skills?.length > 0 && (
            <div className="bg-white dark:bg-slate-900/60 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Tech Stack & Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-xl text-xs font-semibold bg-brand-500/10 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300 border border-brand-500/20 dark:border-brand-500/25"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right 1 Col: Company & Recruiter Profile */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 transition-colors">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-cyan-600 dark:text-cyber-400" />
              About the Company
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 uppercase font-semibold block mb-0.5">Organization</span>
                <span className="text-slate-900 dark:text-white font-medium text-sm">{job.company}</span>
              </div>

              {recruiterProfile?.industry && (
                <div>
                  <span className="text-slate-500 uppercase font-semibold block mb-0.5">Industry</span>
                  <span className="text-slate-700 dark:text-slate-300">{recruiterProfile.industry}</span>
                </div>
              )}

              {recruiterProfile?.companySize && (
                <div>
                  <span className="text-slate-500 uppercase font-semibold block mb-0.5">Team Size</span>
                  <span className="text-slate-700 dark:text-slate-300">{recruiterProfile.companySize} Employees</span>
                </div>
              )}

              {recruiterProfile?.website && (
                <div>
                  <span className="text-slate-500 uppercase font-semibold block mb-0.5">Website</span>
                  <a
                    href={recruiterProfile.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    Visit Website
                    <Globe className="w-3 h-3" />
                  </a>
                </div>
              )}

              {recruiterProfile?.description && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{recruiterProfile.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default JobDetailsPage;
