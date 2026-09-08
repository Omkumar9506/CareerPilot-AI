import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  UserCheck, 
  Calendar, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink, 
  Building2, 
  Clock, 
  Video, 
  Sparkles, 
  TrendingUp, 
  Filter, 
  AlertCircle, 
  Loader2, 
  Plus, 
  ChevronRight,
  BarChart3,
  Percent,
  Layers,
  Award
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useChartTheme } from '../hooks/useChartTheme';

export const RecruiterDashboardPage = () => {
  const { user } = useAuth();
  const { textColor, tooltipStyle } = useChartTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/recruiter');
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load recruiter analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        <p className="text-sm text-slate-400">Loading recruitment metrics and hiring pipeline...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Unable to Load Dashboard</h2>
        <p className="text-sm text-slate-400">{error || 'An unexpected error occurred.'}</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl"
        >
          Try Again
        </button>
      </div>
    );
  }

  const {
    recruiter,
    kpis,
    recruitmentFunnel,
    upcomingInterviews,
    activeVacanciesPerformance,
    recentApplicants,
    recruiterInsights,
  } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      {/* 1. Header Banner & Quick CTAs */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-brand-950/40 to-slate-900 border border-slate-800 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30">
                Recruiter Command Center
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-brand-400" />
                {recruiter.company}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Talent Acquisition Hub
            </h1>

            <p className="text-xs sm:text-sm text-slate-400">
              Overview of active vacancy performance, hiring funnel conversion, and video interview coordination.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/recruiter/jobs"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyber-600 hover:from-brand-500 hover:to-cyber-500 text-white text-xs font-bold shadow-lg shadow-brand-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Post Vacancy</span>
            </Link>

            <Link
              to="/recruiter/applicants"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-750 text-xs font-semibold transition"
            >
              <Users className="w-4 h-4 text-brand-400" />
              <span>Screen Applicants ({kpis.totalApplicants})</span>
            </Link>

            <Link
              to="/recruiter/interviews"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-750 text-xs font-semibold transition"
            >
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Interviews ({upcomingInterviews.length})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Top 6 KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* KPI 1: Total Jobs */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Jobs</span>
            <Briefcase className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-white">{kpis.totalJobs}</p>
          <p className="text-[11px] text-slate-500">{kpis.closedJobs} closed • {kpis.draftJobs} draft</p>
        </div>

        {/* KPI 2: Active Jobs */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/20 shadow space-y-1">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold">Active Jobs</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-emerald-300">{kpis.activeJobs}</p>
          <p className="text-[11px] text-slate-500">Live & accepting talent</p>
        </div>

        {/* KPI 3: Total Applicants */}
        <Link
          to="/recruiter/applicants"
          className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/40 shadow transition group space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Applicants</span>
            <Users className="w-4 h-4 text-brand-400 group-hover:scale-110 transition" />
          </div>
          <p className="text-2xl font-black text-white">{kpis.totalApplicants}</p>
          <p className="text-[11px] text-slate-500">Submissions received</p>
        </Link>

        {/* KPI 4: Shortlisted */}
        <Link
          to="/recruiter/applicants"
          className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-purple-500/20 shadow transition space-y-1"
        >
          <div className="flex items-center justify-between text-purple-400">
            <span className="text-xs font-semibold">Shortlisted</span>
            <UserCheck className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-purple-300">{kpis.shortlisted}</p>
          <p className="text-[11px] text-slate-500">{kpis.shortlistRate}% funnel pass rate</p>
        </Link>

        {/* KPI 5: Interviews */}
        <Link
          to="/recruiter/interviews"
          className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/20 shadow transition space-y-1"
        >
          <div className="flex items-center justify-between text-cyan-400">
            <span className="text-xs font-semibold">Interviews</span>
            <Calendar className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-cyan-300">{kpis.interviews}</p>
          <p className="text-[11px] text-slate-500">{upcomingInterviews.length} active sessions</p>
        </Link>

        {/* KPI 6: Selected / Hired */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-amber-500/20 shadow space-y-1">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-semibold">Selected</span>
            <Award className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-amber-300">{kpis.selected}</p>
          <p className="text-[11px] text-slate-500">{kpis.hireRate}% overall hire rate</p>
        </div>
      </div>

      {/* 3. Middle Section: Recruitment Funnel + Upcoming Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recruitment Funnel & Conversion Rates */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-400" />
                Recruitment Conversion Funnel
              </h2>
              <p className="text-xs text-slate-400">
                Candidate progression from initial application to final offer
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-bold">
                {kpis.shortlistRate}% Shortlisted
              </span>
              <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                {kpis.hireRate}% Hired
              </span>
            </div>
          </div>

          {/* Funnel Stage Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {recruitmentFunnel.map((item) => (
              <div
                key={item.stage}
                className="p-3 rounded-xl bg-slate-850/60 border border-slate-800 text-center space-y-1"
              >
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  {item.stage}
                </span>
                <span
                  className="text-lg font-black block"
                  style={{ color: item.count > 0 ? item.color : '#64748b' }}
                >
                  {item.count}
                </span>
              </div>
            ))}
          </div>

          {/* Recharts Funnel Bar Chart */}
          <div className="h-52 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recruitmentFunnel} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="stage" stroke={textColor} fontSize={11} tickLine={false} />
                <YAxis allowDecimals={false} stroke={textColor} fontSize={11} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {recruitmentFunnel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Upcoming Interviews & Recruiter Insights */}
        <div className="space-y-6">
          {/* Upcoming Video Interview Spotlight */}
          {upcomingInterviews.length > 0 ? (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-cyan-950/20 to-slate-900 border border-cyan-500/30 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Next Scheduled Call
                </span>
                <span className="text-xs text-emerald-400 font-bold">Confirmed</span>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">{upcomingInterviews[0].candidate?.name}</h3>
                <p className="text-xs text-slate-400">
                  Interviewing for <span className="text-cyan-300 font-medium">{upcomingInterviews[0].job?.title}</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1 text-xs">
                <div className="flex items-center gap-2 text-white font-medium">
                  <Calendar className="w-3.5 h-3.5 text-brand-400" />
                  <span>{new Date(upcomingInterviews[0].date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-brand-400" />
                  <span>{upcomingInterviews[0].time}</span>
                </div>
              </div>

              <div className="pt-1 flex flex-col gap-2">
                <a
                  href={upcomingInterviews[0].meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-xs font-black text-center shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-1.5"
                >
                  <Video className="w-4 h-4" />
                  <span>Start Interview Video Call</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <Link
                  to="/recruiter/interviews"
                  className="w-full py-2 px-3 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-750 text-xs font-semibold text-center transition flex items-center justify-center gap-1.5"
                >
                  <span>Manage All Interviews ({upcomingInterviews.length})</span>
                  <ChevronRight className="w-3.5 h-3.5 text-brand-400" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">No Interviews Today</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Schedule video calls with shortlisted candidates from your applicant screening pipeline.
              </p>
              <Link
                to="/recruiter/applicants"
                className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 font-bold"
              >
                Screen Applicants <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}

          {/* Actionable Recruiter Insights */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-400" />
              Hiring Action Items
            </h3>

            <div className="space-y-2.5">
              {recruiterInsights.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-850/60 border border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{item.title}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      item.priority === 'critical' ? 'bg-cyan-500/20 text-cyan-300' :
                      item.priority === 'high' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-brand-500/20 text-brand-300'
                    }`}>
                      {item.priority}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                  <Link
                    to={item.actionUrl}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-400 hover:text-brand-300"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Split Section: Active Vacancies Performance & Recent Applicants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Active Vacancies Performance */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-brand-400" />
                Active Vacancies Performance
              </h2>
              <p className="text-xs text-slate-400">Total applicants submitted per job</p>
            </div>
            <Link
              to="/recruiter/jobs"
              className="text-xs font-bold text-brand-400 hover:underline flex items-center gap-1"
            >
              All Jobs <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {activeVacanciesPerformance.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800 text-slate-500 text-xs space-y-2">
              <p>No active vacancies published.</p>
              <Link
                to="/recruiter/jobs"
                className="inline-block px-3.5 py-1.5 bg-brand-600 text-white rounded-xl text-xs font-semibold"
              >
                Create Job Vacancy
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60 rounded-2xl bg-slate-950/40 border border-slate-800/80 overflow-hidden">
              {activeVacanciesPerformance.map((job) => (
                <div
                  key={job._id}
                  className="p-4 flex items-center justify-between hover:bg-slate-900/40 transition gap-4"
                >
                  <div className="space-y-0.5 min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">{job.title}</h3>
                    <p className="text-[11px] text-slate-400">
                      {job.workplaceType} • {job.location}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-2.5 py-1 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-bold">
                      {job.applicantsCount} Applicants
                    </span>

                    <Link
                      to="/recruiter/applicants"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-brand-600 text-slate-300 hover:text-white transition"
                      title="Screen applicants for this role"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Recent Applicants Stream with AI Match Scores */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-400" />
                Recent Applicants Stream
              </h2>
              <p className="text-xs text-slate-400">Latest candidate submissions with AI compatibility</p>
            </div>
            <Link
              to="/recruiter/applicants"
              className="text-xs font-bold text-brand-400 hover:underline flex items-center gap-1"
            >
              Pipeline <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentApplicants.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800 text-slate-500 text-xs">
              No candidate applications received yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60 rounded-2xl bg-slate-950/40 border border-slate-800/80 overflow-hidden">
              {recentApplicants.map((app) => (
                <div
                  key={app._id}
                  className="p-3.5 flex items-center justify-between hover:bg-slate-900/40 transition gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 font-bold text-xs flex items-center justify-center shrink-0">
                      {app.candidate?.name?.[0] || 'C'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{app.candidate?.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{app.job?.title}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    {app.aiMatch ? (
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${app.aiMatch.badgeColor}`}>
                        {app.aiMatch.score}% Match
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">Evaluating...</span>
                    )}

                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                      app.status === 'Selected' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
                      app.status === 'Interview' ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' :
                      app.status === 'Shortlisted' ? 'bg-purple-500/15 text-purple-300 border-purple-500/30' :
                      app.status === 'Rejected' ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' :
                      'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
