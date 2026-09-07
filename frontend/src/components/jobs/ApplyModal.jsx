import React, { useState } from 'react';
import { X, Send, Loader2, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

export const ApplyModal = ({ job, initialResume = '', onClose, onSuccess }) => {
  const [resume, setResume] = useState(initialResume);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await api.post(`/applications/apply/${job._id}`, {
        resume,
        coverLetter,
      });

      if (res.success) {
        onSuccess(res.data?.application);
      } else {
        setError(res.message || 'Failed to submit application');
      }
    } catch (err) {
      setError(err.message || 'Network error submitting application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg my-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Apply for Position</h2>
            <p className="text-xs text-brand-400 font-medium mt-0.5">{job.title} at {job.company}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
              Resume Link (PDF / Cloud URL)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="url"
                placeholder="https://drive.google.com/... or https://example.com/resume.pdf"
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Phase 7 provides direct Cloudinary file uploads. For now you can enter any public document or portfolio URL.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
              Cover Letter / Note to Hiring Manager
            </label>
            <textarea
              rows={5}
              required
              placeholder="Introduce yourself, explain why you're a standout fit for this role, and highlight relevant accomplishments..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-600/30 flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
