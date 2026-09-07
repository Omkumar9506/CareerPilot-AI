import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  SlidersHorizontal,
  DollarSign,
  MapPin,
  Sparkles,
  Users
} from 'lucide-react';
import api from '../services/api';

export const RecruiterJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, closed: 0, draft: 0 });
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);

  // Create Job Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [topCandidatesModal, setTopCandidatesModal] = useState(null);
  const [loadingTopCandidates, setLoadingTopCandidates] = useState(false);
  const [topCandidates, setTopCandidates] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    workplaceType: 'Remote',
    employmentType: 'Full-time',
    experienceLevel: 'Mid-Level',
    minSalary: '',
    maxSalary: '',
    skills: [],
    responsibilitiesText: '',
    requirementsText: '',
    deadline: '',
  });

  const fetchRecruiterJobs = async () => {
    try {
      const res = await api.get('/jobs/recruiter/my-jobs');
      if (res.success && res.data) {
        setJobs(res.data.jobs || []);
        setStats(res.data.stats || { total: 0, active: 0, closed: 0, draft: 0 });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to fetch your jobs' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruiterJobs();
  }, []);

  const handleViewTopCandidates = async (job) => {
    setTopCandidatesModal(job);
    setLoadingTopCandidates(true);
    setTopCandidates([]);
    try {
      const res = await api.get(`/matches/recruiter/job/${job._id}/top-candidates`);
      if (res.success && res.data) {
        setTopCandidates(res.data.candidates || []);
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to fetch top candidate matches' });
    } finally {
      setLoadingTopCandidates(false);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    const s = newSkill.trim();
    if (s && !formData.skills.includes(s)) {
      setFormData({ ...formData, skills: [...formData.skills, s] });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData({ ...formData, skills: formData.skills.filter((item) => item !== skill) });
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMessage(null);

    const responsibilities = formData.responsibilitiesText
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);

    const requirements = formData.requirementsText
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);

    const payload = {
      title: formData.title,
      description: formData.description,
      location: formData.location,
      workplaceType: formData.workplaceType,
      employmentType: formData.employmentType,
      experienceLevel: formData.experienceLevel,
      salary: {
        min: Number(formData.minSalary) || 0,
        max: Number(formData.maxSalary) || 0,
        currency: 'USD',
        isNegotiable: false,
      },
      skills: formData.skills,
      responsibilities,
      requirements,
      deadline: formData.deadline || null,
      status: 'Active',
    };

    try {
      const res = await api.post('/jobs', payload);
      if (res.success) {
        setStatusMessage({ type: 'success', text: 'New job vacancy posted successfully!' });
        setShowCreateModal(false);
        setFormData({
          title: '',
          description: '',
          location: '',
          workplaceType: 'Remote',
          employmentType: 'Full-time',
          experienceLevel: 'Mid-Level',
          minSalary: '',
          maxSalary: '',
          skills: [],
          responsibilitiesText: '',
          requirementsText: '',
          deadline: '',
        });
        fetchRecruiterJobs();
      } else {
        setStatusMessage({ type: 'error', text: res.message || 'Failed to create job' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Error creating job' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (jobId, newStatus) => {
    try {
      const res = await api.patch(`/jobs/${jobId}/status`, { status: newStatus });
      if (res.success) {
        setJobs(jobs.map((j) => (j._id === jobId ? { ...j, status: newStatus } : j)));
        setStatusMessage({ type: 'success', text: `Job marked as ${newStatus}` });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update job status' });
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to permanently delete this job posting?')) return;

    try {
      const res = await api.delete(`/jobs/${jobId}`);
      if (res.success) {
        setJobs(jobs.filter((j) => j._id !== jobId));
        setStatusMessage({ type: 'success', text: 'Job deleted successfully' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to delete job' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-cyber-500 animate-spin" />
        <p className="text-sm text-slate-400">Loading recruiter job portal...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Job Postings Management</h1>
          <p className="text-sm text-slate-400 mt-0.5">Post and monitor your technical role openings</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-cyber-600 hover:bg-cyber-500 shadow-lg shadow-cyber-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          Post New Vacancy
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-500 font-semibold uppercase">Total Postings</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <p className="text-xs text-emerald-400 font-semibold uppercase">Active Openings</p>
          <p className="text-2xl font-bold text-emerald-300 mt-1">{stats.active}</p>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 font-semibold uppercase">Closed / Archived</p>
          <p className="text-2xl font-bold text-slate-300 mt-1">{stats.closed}</p>
        </div>
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

      {/* Jobs Table Card */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Your Listed Positions</h3>
          <span className="text-xs text-slate-400">{jobs.length} jobs</span>
        </div>

        {jobs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Briefcase className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-white">No jobs posted yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Get started by clicking "Post New Vacancy" to attract qualified candidates.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  <th className="py-3 px-4">Role Title</th>
                  <th className="py-3 px-4">Workplace</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date Posted</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 px-4 font-semibold text-white">
                      <div className="flex flex-col">
                        <span>{job.title}</span>
                        <span className="text-xs text-slate-500 font-normal">{job.employmentType}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded text-xs bg-slate-900 border border-slate-800 text-slate-300">
                        {job.workplaceType}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-400 text-xs">{job.location}</td>
                    <td className="py-4 px-4">
                      <select
                        value={job.status}
                        onChange={(e) => handleToggleStatus(job._id, e.target.value)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-semibold border ${
                          job.status === 'Active'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        <option value="Active" className="bg-slate-900 text-white">Active</option>
                        <option value="Closed" className="bg-slate-900 text-white">Closed</option>
                        <option value="Draft" className="bg-slate-900 text-white">Draft</option>
                      </select>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-500">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleViewTopCandidates(job)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 border border-brand-500/30 text-xs font-semibold transition"
                        title="Discover Top Platform Talent Matches"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                        <span>AI Matches</span>
                      </button>
                      <Link
                        to={`/jobs/${job._id}`}
                        target="_blank"
                        className="inline-flex p-1.5 rounded-lg text-slate-400 hover:text-brand-400 hover:bg-slate-900"
                        title="View Public Listing"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteJob(job._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                        title="Delete Job"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Job Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl my-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white">Post a New Vacancy</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Role Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Full Stack Engineer"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Workplace *</label>
                  <select
                    value={formData.workplaceType}
                    onChange={(e) => setFormData({ ...formData, workplaceType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Employment *</label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Level *</label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  >
                    <option value="Entry">Entry</option>
                    <option value="Mid-Level">Mid-Level</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Austin, TX or Remote"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Min Salary ($)</label>
                  <input
                    type="number"
                    placeholder="e.g. 100000"
                    value={formData.minSalary}
                    onChange={(e) => setFormData({ ...formData, minSalary: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Max Salary ($)</label>
                  <input
                    type="number"
                    placeholder="e.g. 150000"
                    value={formData.maxSalary}
                    onChange={(e) => setFormData({ ...formData, maxSalary: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white"
                  />
                </div>
              </div>

              {/* Skills Tag Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Required Skills</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add skill (e.g. React) and press Add"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-1.5 text-sm text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {formData.skills.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-0.5 rounded-full text-xs bg-cyber-500/15 text-cyber-300 border border-cyber-500/25 flex items-center gap-1"
                    >
                      {s}
                      <button type="button" onClick={() => handleRemoveSkill(s)}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Role Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Outline the mission, scope, and day-to-day impact of this position..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Responsibilities (One per line)</label>
                  <textarea
                    rows={3}
                    placeholder="Build API microservices&#10;Optimize database queries&#10;Collaborate with product team"
                    value={formData.responsibilitiesText}
                    onChange={(e) => setFormData({ ...formData, responsibilitiesText: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Requirements (One per line)</label>
                  <textarea
                    rows={3}
                    placeholder="3+ years Node.js experience&#10;Proficiency in TypeScript&#10;Strong communication skills"
                    value={formData.requirementsText}
                    onChange={(e) => setFormData({ ...formData, requirementsText: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-xl text-xs font-semibold text-white bg-cyber-600 hover:bg-cyber-500 shadow-md shadow-cyber-600/30 flex items-center gap-2"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  Publish Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Top Talent AI Discovery Modal */}
      {topCandidatesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl my-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-400 uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Top Platform Talent Discovery
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {topCandidatesModal.title}
                </h2>
                <p className="text-xs text-slate-400">
                  Target Stack: {topCandidatesModal.skills?.join(', ') || 'General'}
                </p>
              </div>
              <button
                onClick={() => setTopCandidatesModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingTopCandidates ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                <p className="text-xs text-slate-400">Scanning active candidate database for best compatibility...</p>
              </div>
            ) : topCandidates.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <Users className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-white">No Matching Candidates Found</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Candidates with relevant skills and experience will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {topCandidates.map((item, idx) => (
                  <div
                    key={item.candidate._id || idx}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white font-bold shrink-0 text-sm">
                        {item.candidate.name?.[0] || 'C'}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{item.candidate.name}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.match.badgeColor}`}>
                            {item.match.matchScore}% Match
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{item.profile?.headline || 'Candidate'}</p>
                        <p className="text-[11px] text-slate-500">
                          {item.profile?.location || 'Remote'} • {item.match.candidateYears || 0} years experience
                        </p>

                        {/* Matched skills badges */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {item.match.matchedSkills?.map((s, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-medium"
                            >
                              ✓ {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <a
                        href={`mailto:${item.candidate.email}?subject=Opportunity%20at%20${encodeURIComponent(topCandidatesModal.company)}%3A%20${encodeURIComponent(topCandidatesModal.title)}`}
                        className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow transition"
                      >
                        Contact Candidate
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setTopCandidatesModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
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
