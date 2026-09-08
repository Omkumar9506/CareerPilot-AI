import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Calendar, 
  Bookmark, 
  Sparkles, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Video, 
  Building2, 
  ExternalLink, 
  Bot, 
  User, 
  FileText, 
  AlertCircle, 
  ChevronRight, 
  Loader2, 
  Award,
  BarChart3,
  Compass,
  ArrowUpRight
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

export const CandidateDashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'saved'

  const { axisStroke, tickFill, tooltipContentStyle, tooltipItemStyle, tooltipLabelStyle } = useChartTheme();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/candidate');
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load candidate dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUnsaveJob = async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/save`);
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to unsave job:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Assembling your intelligent career dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Unable to Load Dashboard</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{error || 'An unexpected error occurred.'}</p>
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
    profileCompletion,
    appStats,
    pipelineFunnel,
    recentApplications,
    savedJobsCount,
    recentSavedJobs,
    upcomingInterviews,
    latestResumeAnalysis,
    aiInsights,
    recommendedJobs,
  } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      {/* 1. Hero Welcome & Profile Completion Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 dark:bg-gradient-to-r dark:from-slate-900 dark:via-brand-950/40 dark:to-slate-900 dark:border-slate-800 shadow-sm dark:shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-500/20 dark:text-brand-300 dark:border-brand-500/30">
                Job Seeker Command Center
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">• Ready for hiring</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Candidate'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl">
              Track your application pipeline, practice for scheduled recruiter calls, and explore AI job matches tailored to your verified skills.
            </p>
          </div>

          {/* Profile Completion Meter */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 dark:bg-slate-950/70 dark:border-slate-800 shrink-0 min-w-[260px] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                Profile Strength
              </span>
              <span className={`text-xs font-black ${
                profileCompletion.score >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
              }`}>
                {profileCompletion.score}%
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  profileCompletion.score >= 80
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                    : 'bg-gradient-to-r from-amber-500 to-brand-500'
                }`}
                style={{ width: `${profileCompletion.score}%` }}
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">
                {profileCompletion.score >= 85 ? 'Excellent visibility' : `${profileCompletion.missingItems.length} items to optimize`}
              </span>
              <Link
                to="/profile"
                className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-0.5"
              >
                Optimize <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Active Applications */}
        <Link
          to="/applications"
          className="p-5 rounded-2xl bg-white border border-slate-200 dark:bg-slate-900/80 dark:border-slate-800 hover:border-brand-500/40 shadow-sm transition group space-y-1"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Applications</span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 flex items-center justify-center group-hover:scale-110 transition">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{appStats.total || 0}</p>
          <p className="text-[11px] text-slate-500">
            {appStats.interview > 0 ? (
              <span className="text-cyan-600 dark:text-cyan-400 font-semibold">⚡ {appStats.interview} in interview stage</span>
            ) : (
              'Active submissions'
            )}
          </p>
        </Link>

        {/* Metric 2: Upcoming Interviews */}
        <Link
          to="/interviews"
          className="p-5 rounded-2xl bg-white border border-slate-200 dark:bg-slate-900/80 dark:border-slate-800 hover:border-cyan-500/40 shadow-sm transition group space-y-1"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Upcoming Interviews</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{upcomingInterviews.length}</p>
          <p className="text-[11px] text-slate-500">
            {upcomingInterviews.length > 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Next call scheduled</span>
            ) : (
              'No upcoming sessions'
            )}
          </p>
        </Link>

        {/* Metric 3: Saved Jobs */}
        <div
          onClick={() => setActiveTab('saved')}
          className="p-5 rounded-2xl bg-white border border-slate-200 dark:bg-slate-900/80 dark:border-slate-800 hover:border-amber-500/40 shadow-sm transition group space-y-1 cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Saved Jobs</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{savedJobsCount || 0}</p>
          <p className="text-[11px] text-slate-500">Bookmarked opportunities</p>
        </div>

        {/* Metric 4: Resume ATS Score */}
        <Link
          to="/resume-analyzer"
          className="p-5 rounded-2xl bg-white border border-slate-200 dark:bg-slate-900/80 dark:border-slate-800 hover:border-purple-500/40 shadow-sm transition group space-y-1"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Resume ATS Score</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {latestResumeAnalysis ? `${latestResumeAnalysis.atsScore}/100` : 'Not Analyzed'}
          </p>
          <p className="text-[11px] text-slate-500">
            {latestResumeAnalysis ? 'Gemini ATS compatibility' : 'Click to run AI ATS audit'}
          </p>
        </Link>
      </div>

      {/* 3. Main Split Section: Application Pipeline + AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Application Pipeline Funnel & History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 dark:bg-slate-900/80 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  Application Pipeline
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tracking conversion from Applied to Interview and Selection
                </p>
              </div>

              {/* Sub tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-850 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('pipeline')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    activeTab === 'pipeline' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Pipeline Stages
                </button>
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    activeTab === 'saved' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Saved Jobs ({savedJobsCount})
                </button>
              </div>
            </div>

            {activeTab === 'pipeline' ? (
              <div className="space-y-6">
                {/* Visual Step Funnel Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {pipelineFunnel.map((item) => (
                    <div
                      key={item.stage}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-850/70 dark:border-slate-800 text-center space-y-1"
                    >
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
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

                {/* Recharts Bar Chart with dynamic theme */}
                <div className="h-44 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pipelineFunnel} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="stage" stroke={axisStroke} tick={{ fill: tickFill }} fontSize={11} tickLine={false} />
                      <YAxis allowDecimals={false} stroke={axisStroke} tick={{ fill: tickFill }} fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={tooltipContentStyle}
                        itemStyle={tooltipItemStyle}
                        labelStyle={tooltipLabelStyle}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {pipelineFunnel.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Recent Applications List */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <span>Recent Applications</span>
                    <Link to="/applications" className="text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
                      View all ({appStats.total}) <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  {recentApplications.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 border border-slate-200 dark:bg-slate-950/40 dark:border-slate-800 rounded-2xl text-slate-500 text-xs space-y-2">
                      <p>You haven't applied to any roles yet.</p>
                      <Link
                        to="/jobs"
                        className="inline-block px-3 py-1.5 bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-600/20 dark:text-brand-400 dark:border-brand-500/30 rounded-lg text-xs font-bold"
                      >
                        Browse Open Vacancies
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200 dark:divide-slate-800/60 rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-sm">
                      {recentApplications.map((app) => (
                        <div key={app._id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{app.job?.title || 'Job Listing'}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {app.job?.company} • {app.job?.workplaceType}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] text-slate-500 hidden sm:inline">
                              {new Date(app.appliedAt).toLocaleDateString()}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${
                              app.status === 'Selected' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30' :
                              app.status === 'Interview' ? 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/30' :
                              app.status === 'Shortlisted' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30' :
                              app.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30' :
                              'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
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
            ) : (
              /* Saved Jobs Panel */
              <div className="space-y-3">
                {recentSavedJobs.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 border border-slate-200 dark:bg-slate-950/40 dark:border-slate-800 rounded-2xl text-slate-500 text-xs space-y-2">
                    <p>No saved jobs found. Save open roles from the jobs feed for quick application later.</p>
                    <Link
                      to="/jobs"
                      className="inline-block px-3 py-1.5 bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-600/20 dark:text-brand-400 dark:border-brand-500/30 rounded-lg text-xs font-bold"
                    >
                      Find Jobs to Save
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200 dark:divide-slate-800/60 rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-sm">
                    {recentSavedJobs.map((item) => (
                      <div key={item._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{item.job?.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {item.job?.company} • {item.job?.location} • {item.job?.workplaceType}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Link
                            to={`/jobs/${item.job?._id}`}
                            className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-bold hover:bg-brand-500 transition shadow-sm"
                          >
                            Apply Now
                          </Link>
                          <button
                            onClick={() => handleUnsaveJob(item.job?._id)}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-rose-500 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-rose-400 transition"
                            title="Remove from saved"
                          >
                            <Bookmark className="w-4 h-4 fill-amber-500 text-amber-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Upcoming Interviews & AI Career Insights */}
        <div className="space-y-6">
          {/* Upcoming Interview Card */}
          {upcomingInterviews.length > 0 ? (
            <div className="p-6 rounded-3xl bg-white border border-cyan-200 dark:bg-gradient-to-br dark:from-slate-900 dark:via-cyan-950/20 dark:to-slate-900 dark:border-cyan-500/30 shadow-sm dark:shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/30">
                  Next Scheduled Call
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Confirmed</span>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{upcomingInterviews[0].job?.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  {upcomingInterviews[0].job?.company}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950/70 dark:border-slate-800 space-y-1 text-xs">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  <span>{new Date(upcomingInterviews[0].date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-brand-700 dark:text-brand-300 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  <span>{upcomingInterviews[0].time}</span>
                </div>
              </div>

              <div className="pt-1 flex flex-col gap-2">
                <a
                  href={upcomingInterviews[0].meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-xs font-black text-center shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-1.5"
                >
                  <Video className="w-4 h-4" />
                  <span>Join Video Meeting</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <Link
                  to="/mock-interview"
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 dark:bg-slate-850 dark:hover:bg-slate-800 dark:text-slate-300 dark:border-slate-750 text-xs font-semibold text-center transition flex items-center justify-center gap-1.5"
                >
                  <Bot className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  <span>Practice AI Mock Interview</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-white border border-slate-200 dark:bg-slate-900/80 dark:border-slate-800 text-center space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 mx-auto flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Interviews Today</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Keep applications active. When a recruiter schedules a session, your video link and schedule will appear here.
              </p>
              <Link
                to="/mock-interview"
                className="inline-flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400 hover:underline font-bold"
              >
                Practice Interviewing <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}

          {/* AI Career Insights List */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 dark:bg-slate-900/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                AI Career Insights
              </h2>
              <span className="text-[10px] font-bold text-brand-700 bg-brand-50 border border-brand-200 dark:text-brand-400 dark:bg-brand-500/10 dark:border-brand-500/20 px-2 py-0.5 rounded-full">
                Gemini Powered
              </span>
            </div>

            <div className="space-y-3">
              {aiInsights.map((insight, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 dark:bg-slate-850/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{insight.title}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      insight.priority === 'critical' ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300' :
                      insight.priority === 'high' ? 'bg-amber-50 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300' :
                      'bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300'
                    }`}>
                      {insight.priority}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    {insight.description}
                  </p>
                  <Link
                    to={insight.actionUrl}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    <span>{insight.actionLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: AI Recommended Jobs Feed */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 dark:bg-slate-900/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              AI Recommended Vacancies
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ranked dynamically by skill token overlap and seniority fit
            </p>
          </div>

          <Link
            to="/jobs"
            className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline self-start sm:self-auto"
          >
            Explore All Vacancies <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recommendedJobs.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 border border-slate-200 dark:bg-slate-950/40 dark:border-slate-800 rounded-2xl text-slate-500 text-xs">
            No recommended vacancies currently. Add more skills to your profile to unlock custom recommendations.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendedJobs.map((job) => (
              <div
                key={job._id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 dark:bg-slate-850/60 dark:border-slate-800 hover:border-brand-500/40 transition flex flex-col justify-between space-y-4 group shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                      {job.company}
                    </span>
                    {job.match && (
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${job.match.badgeColor}`}>
                        {job.match.matchScore}% Match
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-300 transition line-clamp-1">
                    {job.title}
                  </h3>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {job.workplaceType} • {job.location}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {job.skillsRequired?.slice(0, 3).map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-transparent dark:text-slate-300 text-[10px] font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  to={`/jobs/${job._id}`}
                  className="w-full py-2 rounded-xl bg-slate-200 text-slate-800 hover:bg-brand-600 hover:text-white dark:bg-slate-800 dark:text-white dark:hover:bg-brand-600 text-xs font-bold text-center transition flex items-center justify-center gap-1 group-hover:bg-brand-600 group-hover:text-white"
                >
                  <span>View Vacancy</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
