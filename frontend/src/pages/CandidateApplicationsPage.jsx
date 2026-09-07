import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ExternalLink, 
  FileText, 
  Building2, 
  ChevronRight,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import api from '../services/api';

export const CandidateApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoverLetter, setSelectedCoverLetter] = useState(null);

  useEffect(() => {
    const fetchMyApplications = async () => {
      try {
        const res = await api.get('/applications/my-applications');
        if (res.success && res.data?.applications) {
          setApplications(res.data.applications);
        }
      } catch (err) {
        console.error('Failed to load applications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyApplications();
  }, []);

  const pipelineStages = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected'];

  const getStageIndex = (status) => {
    if (status === 'Rejected') return 4; // Final outcome
    const idx = pipelineStages.indexOf(status);
    return idx === -1 ? 0 : idx;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-sm text-slate-400">Loading your submitted applications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Application Pipeline Tracker
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time status updates and hiring stages for your active job submissions
          </p>
        </div>

        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors w-fit"
        >
          <Briefcase className="w-3.5 h-3.5 text-brand-400" />
          Explore More Roles
        </Link>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 mx-auto flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">No Applications Submitted Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Browse our curated engineering and tech openings to submit your first application.
          </p>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-600/30 transition-all"
          >
            Browse Openings
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => {
            const currentStageIdx = getStageIndex(app.status);
            const isRejected = app.status === 'Rejected';

            return (
              <div
                key={app._id}
                className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-brand-400 font-extrabold text-base shadow-inner">
                      {app.job?.company?.[0] || 'C'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-brand-400">{app.job?.company}</span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                            isRejected
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : app.status === 'Selected'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-brand-500/10 text-brand-400 border-brand-500/20'
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
                        {app.job?.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {app.job?.location} ({app.job?.workplaceType})
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          Applied {new Date(app.appliedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {app.coverLetter && (
                      <button
                        onClick={() => setSelectedCoverLetter({ title: app.job?.title, text: app.coverLetter })}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700"
                      >
                        View Note
                      </button>
                    )}
                    <Link
                      to={`/jobs/${app.job?._id}`}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800"
                      title="View Job"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Visual Hiring Pipeline Stepper */}
                <div className="pt-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase mb-4">Application Progress</p>
                  
                  <div className="grid grid-cols-5 gap-2 relative">
                    {pipelineStages.map((stage, idx) => {
                      const isPassed = idx < currentStageIdx;
                      const isCurrent = idx === currentStageIdx;
                      const isFinalRejected = isRejected && idx === 4;

                      return (
                        <div key={stage} className="flex flex-col items-center text-center space-y-2">
                          {/* Dot / Indicator */}
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              isFinalRejected
                                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                                : isCurrent
                                ? 'bg-brand-600 text-white ring-4 ring-brand-500/20 animate-pulse'
                                : isPassed
                                ? 'bg-emerald-500 text-white shadow'
                                : 'bg-slate-900 border border-slate-800 text-slate-600'
                            }`}
                          >
                            {isFinalRejected ? (
                              <XCircle className="w-4 h-4" />
                            ) : isPassed ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <span>{idx + 1}</span>
                            )}
                          </div>

                          {/* Stage Label */}
                          <span
                            className={`text-[11px] font-medium leading-tight ${
                              isFinalRejected
                                ? 'text-rose-400 font-bold'
                                : isCurrent
                                ? 'text-brand-300 font-bold'
                                : isPassed
                                ? 'text-slate-300'
                                : 'text-slate-600'
                            }`}
                          >
                            {isFinalRejected ? 'Rejected' : stage}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cover Letter Modal */}
      {selectedCoverLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Cover Note: {selectedCoverLetter.title}</h3>
              <button onClick={() => setSelectedCoverLetter(null)} className="text-slate-400 hover:text-white">
                ×
              </button>
            </div>
            <div className="text-sm text-slate-300 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-line p-2 bg-slate-950 rounded-xl border border-slate-800">
              {selectedCoverLetter.text}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedCoverLetter(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
