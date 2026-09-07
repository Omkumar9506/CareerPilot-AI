import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  ExternalLink, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  ChevronRight,
  Sparkles,
  SlidersHorizontal,
  X,
  TrendingUp,
  Cpu,
  Calendar
} from 'lucide-react';
import api from '../services/api';
import { ScheduleInterviewModal } from '../components/interviews/ScheduleInterviewModal';

export const RecruiterApplicantsPage = () => {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    underReview: 0,
    shortlisted: 0,
    interview: 0,
    selected: 0,
    rejected: 0,
  });
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('match'); // 'match' | 'date'
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [selectedMatchModal, setSelectedMatchModal] = useState(null);
  const [scheduleModalData, setScheduleModalData] = useState(null);

  const statusTabs = [
    'All',
    'Applied',
    'Under Review',
    'Shortlisted',
    'Interview',
    'Selected',
    'Rejected',
  ];

  const fetchApplicants = async (status = selectedStatus, sort = sortBy) => {
    try {
      const params = new URLSearchParams();
      if (status && status !== 'All') params.append('status', status);
      if (sort === 'match') params.append('sortBy', 'match');

      const url = `/applications/recruiter?${params.toString()}`;
      const res = await api.get(url);
      if (res.success && res.data) {
        setApplications(res.data.applications || []);
        if (res.data.stats) setStats(res.data.stats);
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to fetch applicants' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants(selectedStatus, sortBy);
  }, [selectedStatus, sortBy]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const res = await api.patch(`/applications/${appId}/status`, { status: newStatus });
      if (res.success) {
        setApplications(
          applications.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
        );
        setStatusMessage({ type: 'success', text: `Applicant marked as ${newStatus}` });
        fetchApplicants(selectedStatus, sortBy);
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Error updating applicant status' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-cyber-500 animate-spin" />
        <p className="text-sm text-slate-400">Loading candidate applicant pipeline...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 text-xs font-semibold uppercase mb-2">
            <Cpu className="w-3.5 h-3.5" />
            AI Compatibility Screening Active
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Applicant Screening Pipeline
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review submissions, evaluate AI qualification rankings, and advance candidates through hiring stages
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/recruiter/interviews"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-brand-300 bg-brand-500/10 border border-brand-500/30 hover:bg-brand-500/20 transition-colors w-fit"
          >
            <Calendar className="w-3.5 h-3.5 text-brand-400" />
            <span>Scheduled Interviews</span>
          </Link>
          <Link
            to="/recruiter/jobs"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors w-fit"
          >
            Manage Vacancies
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {statusTabs.map((tab) => {
          const key = tab === 'All' ? 'total' : tab === 'Under Review' ? 'underReview' : tab.toLowerCase();
          const count = stats[key] !== undefined ? stats[key] : 0;
          const isActive = selectedStatus === tab;

          return (
            <button
              key={tab}
              onClick={() => setSelectedStatus(tab)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                isActive
                  ? 'bg-cyber-500/15 border-cyber-500/40 text-white shadow-md shadow-cyber-500/10'
                  : 'glass-card border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <p className="text-[10px] font-bold uppercase truncate">{tab}</p>
              <p className="text-xl font-extrabold text-white mt-1">{count}</p>
            </button>
          );
        })}
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-xs text-slate-400 hover:text-white">
            ×
          </button>
        </div>
      )}

      {/* Applicants Table Card */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-white">Candidates ({applications.length})</h3>
            <span className="text-xs text-slate-400">Filter: {selectedStatus}</span>
          </div>

          {/* Sort Controller */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Rank by:</span>
            <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-800">
              <button
                onClick={() => setSortBy('match')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  sortBy === 'match'
                    ? 'bg-brand-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3 h-3 text-brand-300" />
                Best AI Match
              </button>
              <button
                onClick={() => setSortBy('date')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  sortBy === 'date'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Newest Date
              </button>
            </div>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-white">No applicants matching "{selectedStatus}"</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Candidate applications will appear here as soon as job seekers apply to your postings.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Applied Role</th>
                  <th className="py-3 px-4">AI Match Fit</th>
                  <th className="py-3 px-4">Applied Date</th>
                  <th className="py-3 px-4">Documents</th>
                  <th className="py-3 px-4">Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            app.candidate?.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              app.candidate?.name || 'Candidate'
                            )}`
                          }
                          alt={app.candidate?.name}
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-700"
                        />
                        <div>
                          <p className="font-semibold text-white text-sm">{app.candidate?.name}</p>
                          <p className="text-xs text-slate-500">{app.candidate?.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-white text-xs">{app.job?.title}</p>
                        <p className="text-[11px] text-slate-500">{app.job?.workplaceType} • {app.job?.location}</p>
                      </div>
                    </td>

                    {/* AI Match Column */}
                    <td className="py-4 px-4">
                      {app.aiMatch ? (
                        <div className="space-y-1">
                          <button
                            onClick={() =>
                              setSelectedMatchModal({
                                candidate: app.candidate,
                                job: app.job,
                                match: app.aiMatch,
                              })
                            }
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-xs font-bold transition hover:scale-105 ${app.aiMatch.badgeColor}`}
                          >
                            <Sparkles className="w-3 h-3 text-brand-400" />
                            {app.aiMatch.score}% Match
                          </button>
                          
                          {/* Matched skills preview */}
                          <div className="flex flex-wrap gap-1 text-[10px]">
                            {app.aiMatch.matchedSkills?.slice(0, 3).map((s, idx) => (
                              <span key={idx} className="text-emerald-400 font-medium">
                                ✓{s}
                              </span>
                            ))}
                            {app.aiMatch.matchedSkills?.length > 3 && (
                              <span className="text-slate-500">+{app.aiMatch.matchedSkills.length - 3}</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">Evaluating...</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-400">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-4 space-x-2">
                      {app.resume ? (
                        <a
                          href={app.resume}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-cyber-400 hover:underline"
                        >
                          Resume
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-500">No Resume URL</span>
                      )}
                      {app.coverLetter && (
                        <button
                          onClick={() =>
                            setSelectedNote({
                              name: app.candidate?.name,
                              role: app.job?.title,
                              text: app.coverLetter,
                            })
                          }
                          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white underline ml-2"
                        >
                          Cover Note
                        </button>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app._id, e.target.value)}
                          className={`text-xs px-2.5 py-1 rounded-xl font-bold border transition-colors ${
                            app.status === 'Selected'
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : app.status === 'Shortlisted' || app.status === 'Interview'
                              ? 'bg-cyber-500/15 text-cyber-300 border-cyber-500/30'
                              : app.status === 'Rejected'
                              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          <option value="Applied" className="bg-slate-900 text-white">Applied</option>
                          <option value="Under Review" className="bg-slate-900 text-white">Under Review</option>
                          <option value="Shortlisted" className="bg-slate-900 text-white">Shortlisted</option>
                          <option value="Interview" className="bg-slate-900 text-white">Interview</option>
                          <option value="Selected" className="bg-slate-900 text-white">Selected</option>
                          <option value="Rejected" className="bg-slate-900 text-white">Rejected</option>
                        </select>

                        <button
                          onClick={() =>
                            setScheduleModalData({
                              candidate: app.candidate,
                              job: app.job,
                              applicationId: app._id,
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-brand-500/15 hover:bg-brand-500/25 border border-brand-500/30 text-brand-300 text-xs font-semibold transition shrink-0"
                          title="Schedule Interview with Candidate"
                        >
                          <Calendar className="w-3 h-3 text-brand-400" />
                          <span className="hidden sm:inline">Schedule</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Match Breakdown Modal */}
      {selectedMatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">{selectedMatchModal.candidate?.name}</h3>
                <p className="text-xs text-brand-400">Match for {selectedMatchModal.job?.title}</p>
              </div>
              <button onClick={() => setSelectedMatchModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between">
                <span className="text-xs text-slate-400">AI Compatibility Score</span>
                <span className="text-base font-extrabold text-emerald-400">
                  {selectedMatchModal.match.score}% ({selectedMatchModal.match.level})
                </span>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-emerald-400 uppercase mb-1.5">
                  Matched Skills ({selectedMatchModal.match.matchedSkills?.length || 0})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMatchModal.match.matchedSkills?.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-medium"
                    >
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>

              {selectedMatchModal.match.missingSkills?.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-rose-400 uppercase mb-1.5">
                    Gaps / Missing Skills ({selectedMatchModal.match.missingSkills?.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMatchModal.match.missingSkills?.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs font-medium"
                      >
                        + {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedMatchModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">{selectedNote.name}</h3>
                <p className="text-xs text-cyber-400">Application Note for {selectedNote.role}</p>
              </div>
              <button onClick={() => setSelectedNote(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-sm text-slate-300 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-line p-3 bg-slate-950 rounded-xl border border-slate-800">
              {selectedNote.text}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedNote(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {scheduleModalData && (
        <ScheduleInterviewModal
          isOpen={!!scheduleModalData}
          onClose={() => setScheduleModalData(null)}
          candidate={scheduleModalData.candidate}
          job={scheduleModalData.job}
          applicationId={scheduleModalData.applicationId}
          onSuccess={(interview) => {
            setStatusMessage({
              type: 'success',
              text: `Interview successfully scheduled with ${scheduleModalData.candidate?.name}! Invitation email sent.`,
            });
            fetchApplicants(selectedStatus, sortBy);
          }}
        />
      )}
    </div>
  );
};

export default RecruiterApplicantsPage;
