import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Loader2, 
  Calendar, 
  BookOpen, 
  ExternalLink, 
  Layers, 
  Plus, 
  Trophy, 
  FolderGit2, 
  ChevronRight, 
  Check, 
  RefreshCw,
  Trash2,
  Briefcase,
  Target
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const RoadmapPage = () => {
  const { user, isAuthenticated } = useAuth();
  const isCandidate = isAuthenticated && user?.role === 'candidate';

  const [roadmaps, setRoadmaps] = useState([]);
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Form states
  const [targetRole, setTargetRole] = useState('Senior Cloud & DevOps Architect');
  const [platformJobs, setPlatformJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');

  const popularRolePresets = [
    'Senior Full Stack Developer',
    'Senior Cloud & DevOps Architect',
    'AI & LLM Solutions Engineer',
    'Frontend React Specialist',
    'Distributed Systems Architect',
  ];

  useEffect(() => {
    if (isCandidate) {
      fetchRoadmaps();
      fetchJobs();
    } else {
      setLoading(false);
    }
  }, [isCandidate]);

  const fetchRoadmaps = async () => {
    try {
      const res = await api.get('/roadmaps');
      if (res.success && res.data) {
        setRoadmaps(res.data.roadmaps || []);
        if (res.data.roadmaps?.length > 0) {
          setActiveRoadmap(res.data.roadmaps[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch roadmaps:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs?limit=10');
      if (res.success && res.data?.jobs) {
        setPlatformJobs(res.data.jobs || []);
      }
    } catch (err) {
      // Non-blocking
    }
  };

  // Generate new roadmap
  const handleGenerateRoadmap = async (e) => {
    e.preventDefault();
    if (!targetRole.trim()) return;

    setGenerating(true);
    setStatusMessage(null);

    try {
      const res = await api.post('/roadmaps', {
        targetRole: targetRole.trim(),
        targetJobId: selectedJobId || null,
      });

      if (res.success && res.data?.roadmap) {
        setRoadmaps([res.data.roadmap, ...roadmaps]);
        setActiveRoadmap(res.data.roadmap);
        setStatusMessage({
          type: 'success',
          text: `Personalized roadmap generated for ${res.data.roadmap.targetRole}!`,
        });
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to generate career roadmap.',
      });
    } finally {
      setGenerating(false);
    }
  };

  // Toggle milestone completion
  const handleToggleMilestone = async (milestoneIndex, currentCompleted) => {
    if (!activeRoadmap) return;

    try {
      const res = await api.patch(`/roadmaps/${activeRoadmap._id}/milestones/${milestoneIndex}`, {
        completed: !currentCompleted,
      });

      if (res.success && res.data?.roadmap) {
        setActiveRoadmap(res.data.roadmap);
        setRoadmaps(
          roadmaps.map((r) => (r._id === activeRoadmap._id ? res.data.roadmap : r))
        );
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Failed to update milestone status' });
    }
  };

  // Sync skills to profile
  const handleSyncSkills = async () => {
    if (!activeRoadmap) return;

    setSyncing(true);
    try {
      const res = await api.post(`/roadmaps/${activeRoadmap._id}/sync-skills`);
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: res.message || `Successfully synced skills to your candidate profile!`,
        });
        fetchRoadmaps();
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to sync skills' });
    } finally {
      setSyncing(false);
    }
  };

  // Delete roadmap
  const handleDeleteRoadmap = async (id) => {
    if (!window.confirm('Are you sure you want to delete this roadmap?')) return;

    try {
      const res = await api.delete(`/roadmaps/${id}`);
      if (res.success) {
        const remaining = roadmaps.filter((r) => r._id !== id);
        setRoadmaps(remaining);
        setActiveRoadmap(remaining[0] || null);
        setStatusMessage({ type: 'success', text: 'Roadmap deleted' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Failed to delete roadmap' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-sm text-slate-400">Loading your skill roadmap hub...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold uppercase">
          <TrendingUp className="w-4 h-4" />
          Skill Gap Analyzer & Learning Roadmap
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Bridge the Gap to Your <span className="gradient-text">Dream Role</span>
        </h1>
        <p className="text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Pinpoint the exact technologies, system architecture patterns, and portfolio projects required to land senior engineering roles with dynamic milestone tracking.
        </p>
      </div>

      {/* Generator Form */}
      <div className="max-w-4xl mx-auto glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <Target className="w-4 h-4 text-amber-400" />
          Target Career Goal
        </div>

        <form onSubmit={handleGenerateRoadmap} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                Target Role Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Cloud & DevOps Architect, React Lead..."
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                Target Platform Vacancy (Optional)
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition"
              >
                <option value="">None (Industry Benchmark Standard)</option>
                {platformJobs.map((j) => (
                  <option key={j._id} value={j._id}>
                    {j.title} at {j.company}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-500">Popular:</span>
            {popularRolePresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setTargetRole(preset)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                  targetRole === preset
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            {isCandidate ? (
              <button
                type="submit"
                disabled={generating}
                className="px-6 py-3 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-600/20 transition flex items-center gap-2 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Diagnosing Skill Gaps & Building Roadmap...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white" />
                    Generate AI Career Roadmap
                  </>
                )}
              </button>
            ) : (
              <Link
                to="/login"
                className="px-6 py-3 bg-amber-600 text-white text-xs font-bold rounded-xl shadow-lg"
              >
                Sign In as Candidate to Generate Roadmaps
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div
          className={`max-w-4xl mx-auto p-4 rounded-xl border text-xs flex items-center justify-between ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white">
            ×
          </button>
        </div>
      )}

      {/* Saved Roadmaps Tabs */}
      {roadmaps.length > 1 && (
        <div className="max-w-4xl mx-auto flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-xs text-slate-500 font-semibold shrink-0">Your Roadmaps:</span>
          {roadmaps.map((r) => (
            <button
              key={r._id}
              onClick={() => setActiveRoadmap(r)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition border ${
                activeRoadmap?._id === r._id
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {r.targetRole} ({r.readinessScore}%)
            </button>
          ))}
        </div>
      )}

      {/* Active Roadmap Dashboard */}
      {activeRoadmap && (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
          
          {/* Top Progress & Metrics Card */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {activeRoadmap.status} Learning Path
                  </span>
                  <span className="text-xs text-slate-400">
                    Est. {activeRoadmap.estimatedWeeks || 12} Weeks
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {activeRoadmap.targetRole}
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                  {activeRoadmap.aiSummary}
                </p>
              </div>

              {/* Readiness Score Gauge */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center shrink-0 min-w-[150px]">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                  Career Readiness
                </span>
                <span className="text-4xl font-black text-white">
                  {activeRoadmap.readinessScore}%
                </span>
                <div className="w-full h-1.5 rounded-full bg-slate-800 mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${activeRoadmap.readinessScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Sync to Profile CTA Bar */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Finished a phase? Sync acquired roadmap skills directly into your live candidate profile to boost your ATS & job match scores!
                </span>
              </div>
              <button
                type="button"
                onClick={handleSyncSkills}
                disabled={syncing}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 disabled:opacity-50"
              >
                {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                Sync Skills to Profile
              </button>
            </div>
          </div>

          {/* Skill Gap Matrix */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                Identified Skill Gap Matrix ({activeRoadmap.skillGaps?.length || 0})
              </h3>
              <span className="text-xs text-slate-400">Target Requirements</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {activeRoadmap.skillGaps?.map((gap, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-850 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">{gap.skill}</span>
                    <span className="text-[10px] text-slate-500">{gap.category}</span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      gap.status === 'Completed'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                        : gap.priority === 'High'
                        ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                    }`}
                  >
                    {gap.status === 'Completed' ? 'Mastered' : `${gap.priority} Priority`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Multi-Phase Milestone Timeline */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              Progressive Learning Timeline & Milestones
            </h3>

            <div className="space-y-6">
              {activeRoadmap.milestones?.map((milestone, idx) => {
                const isCompleted = milestone.completed;
                return (
                  <div
                    key={milestone._id || idx}
                    className={`glass-card p-6 sm:p-8 rounded-3xl border transition-all ${
                      isCompleted
                        ? 'border-emerald-500/40 bg-slate-900/70 shadow-lg shadow-emerald-500/5'
                        : 'border-slate-800/90'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-850 pb-4 mb-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                              isCompleted
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}
                          >
                            {milestone.timeframe}
                          </span>
                          <span className="text-xs text-slate-500">Phase {milestone.phase}</span>
                        </div>
                        <h4 className="text-base sm:text-lg font-bold text-white">
                          {milestone.title}
                        </h4>
                      </div>

                      {/* Complete Checkbox Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleMilestone(idx, isCompleted)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-400" />
                            Phase Completed
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 text-slate-500" />
                            Mark as Done
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-6">
                      {milestone.description}
                    </p>

                    {/* Milestone Details: Skills Covered & Recommended Projects */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      
                      {/* Skills */}
                      <div className="space-y-2">
                        <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block">
                          Skills Covered
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {milestone.skillsCovered?.map((s, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs font-medium"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Portfolio Project */}
                      <div className="space-y-2">
                        <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block flex items-center gap-1.5">
                          <FolderGit2 className="w-3.5 h-3.5 text-amber-400" />
                          Recommended Portfolio Project
                        </span>
                        {milestone.recommendedProjects?.map((p, pIdx) => (
                          <div
                            key={pIdx}
                            className="p-3 rounded-xl bg-slate-950/70 border border-slate-850 text-xs text-slate-300 leading-relaxed"
                          >
                            {p}
                          </div>
                        ))}
                      </div>

                    </div>

                    {/* Resources */}
                    {milestone.resources?.length > 0 && (
                      <div className="mt-5 pt-4 border-t border-slate-850/80">
                        <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider block mb-2">
                          Curated Learning References
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {milestone.resources.map((res, rIdx) => (
                            <a
                              key={rIdx}
                              href={res.url || '#'}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-brand-300 hover:text-white text-xs transition"
                            >
                              <BookOpen className="w-3 h-3 text-brand-400" />
                              <span>{res.title}</span>
                              <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delete Roadmap Option */}
          <div className="flex justify-end pt-4">
            <button
              onClick={() => handleDeleteRoadmap(activeRoadmap._id)}
              className="text-xs text-slate-500 hover:text-rose-400 transition flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete this roadmap
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default RoadmapPage;
