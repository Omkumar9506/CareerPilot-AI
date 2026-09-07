import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Video, 
  Building2, 
  ExternalLink, 
  Copy, 
  Check, 
  Bot, 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  ChevronRight,
  Info
} from 'lucide-react';
import api from '../services/api';

export const CandidateInterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState({ total: 0, upcoming: 0, completed: 0, cancelled: 0 });
  const [timeframe, setTimeframe] = useState('upcoming'); // 'upcoming' | 'all' | 'past'
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  const fetchInterviews = async (selectedTimeframe = timeframe) => {
    try {
      let queryParam = '';
      if (selectedTimeframe === 'upcoming') queryParam = '?timeframe=upcoming';
      if (selectedTimeframe === 'past') queryParam = '?timeframe=past';

      const res = await api.get(`/interviews/candidate${queryParam}`);
      if (res.success && res.data) {
        setInterviews(res.data.interviews || []);
        if (res.data.stats) setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch candidate interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews(timeframe);
  }, [timeframe]);

  const handleCopyLink = (link, id) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'Rescheduled':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Completed':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      case 'Cancelled':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  // Find next upcoming interview
  const nextInterview = interviews.find((i) => ['Scheduled', 'Rescheduled'].includes(i.status));

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        <p className="text-sm text-slate-400">Loading your interview schedule...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-400 uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            Candidate Career Portal
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            My Scheduled Interviews
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Join your live recruiter video sessions and practice role-specific technical questions.
          </p>
        </div>

        <Link
          to="/mock-interview"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyber-600 hover:from-brand-500 hover:to-cyber-500 text-white text-xs font-bold shadow-lg shadow-brand-500/20 transition self-start sm:self-auto"
        >
          <Bot className="w-4 h-4" />
          <span>Practice with AI Mock Interview</span>
        </Link>
      </div>

      {/* Spotlight: Next Upcoming Interview */}
      {nextInterview && (
        <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-brand-950/40 to-slate-900 border border-brand-500/30 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                  Next Upcoming Session
                </span>
                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${statusBadge(nextInterview.status)}`}>
                  {nextInterview.status}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {nextInterview.job?.title}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1.5 font-semibold text-white">
                  <Building2 className="w-4 h-4 text-brand-400" />
                  {nextInterview.job?.company}
                </span>
                <span className="text-slate-500">•</span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Calendar className="w-4 h-4 text-brand-400" />
                  {new Date(nextInterview.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <span className="text-slate-500">•</span>
                <span className="flex items-center gap-1.5 text-brand-300 font-bold">
                  <Clock className="w-4 h-4 text-brand-400" />
                  {nextInterview.time}
                </span>
              </div>

              {nextInterview.notes && (
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <span className="text-brand-400 font-bold block">Interviewer Agenda & Notes:</span>
                  <p className="text-slate-300 leading-relaxed">{nextInterview.notes}</p>
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <a
                href={nextInterview.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition transform hover:scale-[1.02]"
              >
                <Video className="w-4 h-4" />
                <span>Join Live Video Call</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => handleCopyLink(nextInterview.meetingLink, nextInterview._id)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition"
              >
                {copiedId === nextInterview._id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Meeting Link Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Meeting URL</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          {[
            { id: 'upcoming', label: `Upcoming (${stats.upcoming || 0})` },
            { id: 'all', label: `All Interviews (${stats.total || 0})` },
            { id: 'past', label: `Past / Concluded (${(stats.completed || 0) + (stats.cancelled || 0)})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTimeframe(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                timeframe === tab.id
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interviews List */}
      {interviews.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/80 text-slate-400 mx-auto flex items-center justify-center">
            <Calendar className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No interviews found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              When recruiters review your job applications and schedule an interview, your video meeting schedule and direct invitation will appear here.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              to="/jobs"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-semibold transition"
            >
              Browse Open Jobs
            </Link>
            <Link
              to="/mock-interview"
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition"
            >
              Practice AI Mock Interview
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interviews.map((item) => {
            const isCompleted = item.status === 'Completed';
            const isCancelled = item.status === 'Cancelled';
            const interviewDate = new Date(item.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={item._id}
                className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[11px] text-slate-400 font-medium">
                        {item.job?.company}
                      </span>
                      <h3 className="text-base font-bold text-white">{item.job?.title}</h3>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border shrink-0 ${statusBadge(item.status)}`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-brand-400" />
                      <span>{interviewDate}</span>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-brand-300 font-semibold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-brand-400" />
                      <span>{item.time}</span>
                    </div>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-slate-400 bg-slate-850/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-brand-400 font-semibold block mb-0.5">Instructions:</span>
                      {item.notes}
                    </p>
                  )}

                  {item.cancellationReason && (
                    <p className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                      <span className="font-semibold block mb-0.5">Cancellation Note:</span>
                      {item.cancellationReason}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500">
                    Interviewer: <span className="text-slate-300 font-medium">{item.recruiter?.name || 'Hiring Manager'}</span>
                  </div>

                  {!isCancelled && (
                    <div className="flex items-center gap-2">
                      <a
                        href={item.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Meeting</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <button
                        onClick={() => handleCopyLink(item.meetingLink, item._id)}
                        title="Copy meeting URL"
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white border border-slate-700 transition"
                      >
                        {copiedId === item._id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
