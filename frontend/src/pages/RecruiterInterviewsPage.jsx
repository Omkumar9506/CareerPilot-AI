import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ExternalLink, 
  Copy, 
  Check, 
  Mail, 
  User, 
  Briefcase, 
  AlertCircle, 
  Loader2, 
  Plus,
  ChevronDown
} from 'lucide-react';
import api from '../services/api';

export const RecruiterInterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState({ total: 0, scheduled: 0, completed: 0, cancelled: 0, rescheduled: 0 });
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Reschedule Modal State
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Cancel Modal State
  const [cancelModal, setCancelModal] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');

  const fetchInterviews = async (status = filterStatus) => {
    try {
      const params = new URLSearchParams();
      if (status && status !== 'All') {
        params.append('status', status);
      }
      const res = await api.get(`/interviews/recruiter?${params.toString()}`);
      if (res.success && res.data) {
        setInterviews(res.data.interviews || []);
        if (res.data.stats) setStats(res.data.stats);
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to load interviews' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews(filterStatus);
  }, [filterStatus]);

  const handleCopyLink = (link, id) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleMarkCompleted = async (interviewId) => {
    try {
      const res = await api.patch(`/interviews/scheduled/${interviewId}`, {
        status: 'Completed',
        notes: 'Interview concluded successfully.',
      });
      if (res.success) {
        setStatusMessage({ type: 'success', text: 'Interview marked as Completed!' });
        fetchInterviews(filterStatus);
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update interview' });
    }
  };

  const handleConfirmReschedule = async () => {
    if (!newDate || !newTime.trim()) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.patch(`/interviews/scheduled/${rescheduleModal._id}`, {
        status: 'Rescheduled',
        date: new Date(newDate).toISOString(),
        time: newTime.trim(),
        notes: rescheduleReason.trim() || rescheduleModal.notes,
      });
      if (res.success) {
        setStatusMessage({ type: 'success', text: 'Interview rescheduled and update email sent to candidate!' });
        setRescheduleModal(null);
        fetchInterviews(filterStatus);
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to reschedule interview' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    setActionLoading(true);
    try {
      const res = await api.patch(`/interviews/scheduled/${cancelModal._id}`, {
        status: 'Cancelled',
        cancellationReason: cancellationReason.trim() || 'Cancelled by recruiter',
      });
      if (res.success) {
        setStatusMessage({ type: 'success', text: 'Interview cancelled and notification sent to candidate.' });
        setCancelModal(null);
        fetchInterviews(filterStatus);
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to cancel interview' });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredInterviews = interviews.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const candName = item.candidate?.name?.toLowerCase() || '';
    const candEmail = item.candidate?.email?.toLowerCase() || '';
    const jobTitle = item.job?.title?.toLowerCase() || '';
    return candName.includes(query) || candEmail.includes(query) || jobTitle.includes(query);
  });

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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        <p className="text-sm text-slate-400">Loading interview pipeline...</p>
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
            Interview Management
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Scheduled Interviews
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track video interviews, coordinate candidate agendas, and dispatch calendar updates.
          </p>
        </div>
      </div>

      {/* Status notification toast */}
      {statusMessage && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl border text-sm ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs opacity-70 hover:opacity-100 underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow space-y-1">
          <p className="text-xs font-medium text-slate-400">Total Interviews</p>
          <p className="text-2xl font-black text-white">{stats.total || 0}</p>
          <p className="text-[11px] text-slate-500">All-time bookings</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/20 shadow space-y-1">
          <p className="text-xs font-medium text-emerald-400">Upcoming Active</p>
          <p className="text-2xl font-black text-emerald-300">{stats.scheduled + (stats.rescheduled || 0)}</p>
          <p className="text-[11px] text-slate-500">Awaiting interview call</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-indigo-500/20 shadow space-y-1">
          <p className="text-xs font-medium text-indigo-400">Concluded / Done</p>
          <p className="text-2xl font-black text-indigo-300">{stats.completed || 0}</p>
          <p className="text-[11px] text-slate-500">Successfully completed</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-rose-500/20 shadow space-y-1">
          <p className="text-xs font-medium text-rose-400">Cancelled</p>
          <p className="text-2xl font-black text-rose-300">{stats.cancelled || 0}</p>
          <p className="text-[11px] text-slate-500">Call not conducted</p>
        </div>
      </div>

      {/* Search and Tabs Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          {['All', 'Scheduled', 'Rescheduled', 'Completed', 'Cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                filterStatus === tab
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search candidate or job..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Interviews List / Table */}
      {filteredInterviews.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800/80 text-slate-400 mx-auto flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <p className="text-base font-semibold text-slate-300">No interviews match your criteria</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Schedule interviews directly from your Applicants pipeline page or adjust your search filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredInterviews.map((interview) => {
            const isUpcoming = ['Scheduled', 'Rescheduled'].includes(interview.status);
            const interviewDate = new Date(interview.date);
            const formattedDate = interviewDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={interview._id}
                className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Left: Candidate & Job Details */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-base shrink-0">
                    {interview.candidate?.name ? interview.candidate.name.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-white">{interview.candidate?.name}</h3>
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${statusBadge(interview.status)}`}>
                        {interview.status}
                      </span>
                    </div>
                    <p className="text-xs text-brand-400 font-medium">
                      Applied for: <span className="text-slate-200">{interview.job?.title}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {interview.candidate?.email}
                    </p>
                    {interview.notes && (
                      <p className="text-xs text-slate-400 bg-slate-850/60 px-3 py-1.5 rounded-lg border border-slate-800 mt-2 max-w-xl">
                        <span className="text-brand-400 font-semibold">Agenda:</span> {interview.notes}
                      </p>
                    )}
                    {interview.cancellationReason && (
                      <p className="text-xs text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20 mt-2">
                        <span className="font-semibold">Cancellation Note:</span> {interview.cancellationReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Schedule Date, Meeting Link & Actions */}
                <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center gap-4 shrink-0">
                  {/* Date & Time pill */}
                  <div className="bg-slate-850 border border-slate-800 px-4 py-2.5 rounded-xl space-y-0.5 text-center sm:text-left">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                      <Calendar className="w-3.5 h-3.5 text-brand-400" />
                      <span>{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-brand-400" />
                      <span>{interview.time}</span>
                    </div>
                  </div>

                  {/* Meeting Link Button */}
                  <div className="flex items-center gap-2">
                    <a
                      href={interview.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 text-xs font-semibold transition"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Call</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>

                    <button
                      onClick={() => handleCopyLink(interview.meetingLink, interview._id)}
                      title="Copy meeting link"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white border border-slate-700 transition"
                    >
                      {copiedId === interview._id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Actions Dropdown / Buttons for active interviews */}
                  {isUpcoming && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleMarkCompleted(interview._id)}
                        className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition text-xs font-semibold flex items-center gap-1"
                        title="Mark interview as completed"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Conclude</span>
                      </button>

                      <button
                        onClick={() => {
                          setRescheduleModal(interview);
                          const d = new Date(interview.date).toISOString().split('T')[0];
                          setNewDate(d);
                          setNewTime(interview.time);
                          setRescheduleReason('');
                        }}
                        className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition text-xs font-semibold flex items-center gap-1"
                        title="Reschedule interview date/time"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Reschedule</span>
                      </button>

                      <button
                        onClick={() => {
                          setCancelModal(interview);
                          setCancellationReason('');
                        }}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition text-xs font-semibold flex items-center gap-1"
                        title="Cancel interview"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Cancel</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              Reschedule Interview
            </h3>
            <p className="text-xs text-slate-400">
              Update interview date or time for <strong>{rescheduleModal.candidate?.name}</strong>. An email notification will be dispatched automatically.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">New Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">New Time</label>
                <input
                  type="text"
                  placeholder="e.g. 03:00 PM PST"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Reason / Note for Candidate</label>
                <textarea
                  rows={2}
                  placeholder="Reason for rescheduling..."
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setRescheduleModal(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmReschedule}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 transition disabled:opacity-50"
              >
                {actionLoading ? 'Updating & Sending...' : 'Confirm Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-400" />
              Cancel Interview
            </h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to cancel the interview with <strong>{cancelModal.candidate?.name}</strong>?
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Cancellation Reason</label>
              <textarea
                rows={2}
                placeholder="e.g. Vacancy filled, position placed on hold, or scheduling conflict..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCancelModal(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition disabled:opacity-50"
              >
                {actionLoading ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
