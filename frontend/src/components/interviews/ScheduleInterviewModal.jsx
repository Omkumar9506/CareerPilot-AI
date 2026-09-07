import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  Mail, 
  FileText, 
  X, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import api from '../../services/api';

export const ScheduleInterviewModal = ({
  isOpen,
  onClose,
  onSuccess,
  candidate,
  job,
  applicationId = null,
}) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('11:00 AM');
  const [meetingLink, setMeetingLink] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Default to tomorrow's date
  useEffect(() => {
    if (isOpen) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const isoDate = tomorrow.toISOString().split('T')[0];
      setDate(isoDate);
      if (!meetingLink) {
        // Pre-generate a standard meeting code for convenience
        const randomCode = Math.random().toString(36).substring(2, 5) + '-' + 
                           Math.random().toString(36).substring(2, 6) + '-' + 
                           Math.random().toString(36).substring(2, 5);
        setMeetingLink(`https://meet.google.com/${randomCode}`);
      }
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date) {
      setError('Please select an interview date');
      return;
    }
    if (!time.trim()) {
      setError('Please provide an interview time');
      return;
    }
    if (!meetingLink.trim()) {
      setError('Please provide a video meeting link');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        candidateId: candidate?._id || candidate?.id,
        jobId: job?._id || job?.id,
        applicationId,
        date: new Date(date).toISOString(),
        time: time.trim(),
        meetingLink: meetingLink.trim(),
        notes: notes.trim(),
      };

      const res = await api.post('/interviews/schedule', payload);
      if (res.success) {
        if (onSuccess) onSuccess(res.data?.interview);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to schedule interview');
    } finally {
      setLoading(false);
    }
  };

  const presetTimes = ['10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Schedule Candidate Interview</h2>
              <p className="text-xs text-slate-400">Set date, meeting link, and send invitation email</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Candidate & Job Pill */}
          <div className="p-3.5 rounded-xl bg-slate-850/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Candidate:</span>
              <span className="font-semibold text-white">{candidate?.name || 'Applicant'}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Email:</span>
              <span className="text-brand-400 font-mono text-[11px]">{candidate?.email}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Target Role:</span>
              <span className="font-semibold text-emerald-400">{job?.title}</span>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-400" />
                Interview Date *
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-400" />
                Time & Timezone *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 11:00 AM PST"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Preset time quick buttons */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[11px] text-slate-500 mr-1">Quick Slots:</span>
            {presetTimes.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTime(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  time === t
                    ? 'bg-brand-500/20 border border-brand-500/40 text-brand-300'
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-750'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Meeting Link */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-brand-400" />
                Meeting Link *
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const code = Math.random().toString(36).substring(2, 5) + '-' + 
                                 Math.random().toString(36).substring(2, 6) + '-' + 
                                 Math.random().toString(36).substring(2, 5);
                    setMeetingLink(`https://meet.google.com/${code}`);
                  }}
                  className="text-[10px] text-brand-400 hover:underline"
                >
                  Generate Meet Link
                </button>
              </div>
            </div>
            <div className="relative">
              <LinkIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="url"
                required
                placeholder="https://meet.google.com/xyz-abcd-efg or Zoom link"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500 font-mono text-xs"
              />
            </div>
          </div>

          {/* Notes & Agenda */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-brand-400" />
              Agenda / Notes for Candidate (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Technical Round 1: We will discuss system design, recent projects, and coding live on a shared whiteboard."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500 resize-none"
            />
          </div>

          {/* Email dispatch notice */}
          <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-start gap-2.5">
            <Mail className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Upon confirming, an email invitation with the meeting link and agenda will be sent via Nodemailer to <strong>{candidate?.email}</strong>. The candidate's application will also advance to <strong>Interview</strong> status.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-cyber-600 hover:from-brand-500 hover:to-cyber-500 shadow-lg shadow-brand-500/20 disabled:opacity-50 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Scheduling & Sending...</span>
                </>
              ) : (
                <>
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Invite & Schedule</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
