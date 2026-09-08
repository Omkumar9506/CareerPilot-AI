import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Lightbulb,
  FileText,
  Target,
  ArrowRight,
  TrendingUp,
  History,
  RotateCcw,
  UploadCloud,
  ChevronRight,
  Award,
  Layers,
  Check,
  Copy,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import api from '../services/api';
import { useChartTheme } from '../hooks/useChartTheme';

export const ResumeAnalyzerPage = () => {
  const { textColor, tooltipStyle } = useChartTheme();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'paste'
  const [resumeText, setResumeText] = useState('');
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingJobs, setFetchingJobs] = useState(true);
  const [analyses, setAnalyses] = useState([]);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [copiedKeyword, setCopiedKeyword] = useState(null);

  useEffect(() => {
    fetchJobs();
    fetchPastAnalyses();
  }, []);

  const fetchJobs = async () => {
    try {
      setFetchingJobs(true);
      const res = await api.get('/jobs?limit=30');
      const jobList = res.data?.jobs || res.data || [];
      setJobs(jobList);
    } catch (err) {
      console.error('Failed to load target jobs:', err);
    } finally {
      setFetchingJobs(false);
    }
  };

  const fetchPastAnalyses = async () => {
    try {
      const res = await api.get('/ai/analyses');
      const list = res.data || [];
      setAnalyses(list);
      if (list.length > 0 && !currentAnalysis) {
        setCurrentAnalysis(list[0]);
      }
    } catch (err) {
      console.error('Failed to load past analyses:', err);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {};
      if (selectedJobId) {
        payload.jobId = selectedJobId;
      }

      if (activeTab === 'paste') {
        if (!resumeText.trim()) {
          setError('Please paste your resume text before running analysis.');
          setLoading(false);
          return;
        }
        payload.resumeText = resumeText.trim();
      }

      const res = await api.post('/ai/analyze-resume', payload);
      const newAnalysis = res.data;
      setCurrentAnalysis(newAnalysis);
      setAnalyses((prev) => [newAnalysis, ...prev.filter((a) => a._id !== newAnalysis._id)]);
    } catch (err) {
      setError(err.message || 'Failed to analyze resume. Please check your input or profile.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyword(text);
    setTimeout(() => setCopiedKeyword(null), 2000);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 65) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  const getBarColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 65) return '#f59e0b';
    return '#f43f5e';
  };

  // Prepare chart data if analysis exists
  const chartData = currentAnalysis
    ? [
        { name: 'ATS Compatibility', value: currentAnalysis.atsScore },
        { name: 'Role Match', value: currentAnalysis.matchScore },
        { name: 'Experience Relevance', value: currentAnalysis.experienceRelevance || 75 },
      ]
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-brand-950/40 to-slate-900 border border-slate-800/80 p-8 sm:p-10 overflow-hidden shadow-2xl">
        <div className="absolute -right-10 -top-10 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              Powered by Google Gemini 1.5 Flash
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              AI Resume & ATS Optimization Engine
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Screen your resume against modern corporate Applicant Tracking Systems (ATS).
              Identify missing keywords, calculate match benchmarks, and implement actionable improvements.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/resume"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition shadow-sm"
            >
              <UploadCloud className="w-4 h-4 text-brand-400" />
              Manage Resume File
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Control & Input Panel + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Configuration & Run Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-lg backdrop-blur space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5 text-white font-semibold text-base">
                <Target className="w-5 h-5 text-brand-400" />
                Target Analysis Parameters
              </div>
            </div>

            <form onSubmit={handleAnalyze} className="space-y-5">
              {/* Target Job Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Target Job Position (Optional)
                </label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  disabled={loading || fetchingJobs}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition"
                >
                  <option value="">-- General Tech Industry Standards (All-around) --</option>
                  {jobs.map((job) => (
                    <option key={job._id} value={job._id}>
                      {job.title} • {job.company}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1.5">
                  Select a live platform vacancy to calculate tailored match accuracy against exact role skills.
                </p>
              </div>

              {/* Input Mode Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Resume Source
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className={`py-2 px-3 text-xs font-medium rounded-lg transition flex items-center justify-center gap-1.5 ${
                      activeTab === 'profile'
                        ? 'bg-brand-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Profile & Saved Resume
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('paste')}
                    className={`py-2 px-3 text-xs font-medium rounded-lg transition flex items-center justify-center gap-1.5 ${
                      activeTab === 'paste'
                        ? 'bg-brand-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Paste Text / Draft
                  </button>
                </div>
              </div>

              {/* Source Content Area */}
              {activeTab === 'profile' ? (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2 text-emerald-400 font-medium text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    Auto-Linked Candidate Profile
                  </div>
                  <p>
                    The AI engine automatically compiles your profile title, executive summary, verified skills, and job experience history.
                  </p>
                  <Link
                    to="/profile"
                    className="inline-flex items-center gap-1 text-brand-400 hover:text-brand-300 font-medium pt-1"
                  >
                    Edit profile details <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs text-slate-400">
                    Paste Resume Text or Markdown:
                  </label>
                  <textarea
                    rows={7}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste resume sections (Summary, Skills, Work Experience, Education)..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 font-mono leading-relaxed"
                  />
                </div>
              )}

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-brand-600/25 transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    Running Gemini ATS Audit...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Run AI Resume Analysis
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Past Analyses Drawer */}
          {analyses.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1.5">
                  <History className="w-4 h-4 text-brand-400" />
                  Past Audits ({analyses.length})
                </span>
              </div>
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {analyses.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => setCurrentAnalysis(item)}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                      currentAnalysis?._id === item._id
                        ? 'bg-brand-500/10 border-brand-500/40'
                        : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="truncate">
                      <p className="text-xs font-medium text-slate-200 truncate">
                        {item.targetJob?.title || 'General Tech Benchmark'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div
                      className={`text-xs font-bold px-2 py-0.5 rounded-md border shrink-0 ${getScoreColor(
                        item.atsScore
                      )}`}
                    >
                      {item.atsScore}%
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Dynamic Analysis Report (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!currentAnalysis ? (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-400 mx-auto flex items-center justify-center">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">No Analysis Selected</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                Select your parameters on the left and click "Run AI Resume Analysis" to get an instant, in-depth ATS evaluation report.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overall Score Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      ATS Score
                    </span>
                    <Award className="w-4 h-4 text-brand-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white">
                      {currentAnalysis.atsScore}
                    </span>
                    <span className="text-xs text-slate-500">/ 100</span>
                  </div>
                  <div className="mt-3 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${currentAnalysis.atsScore}%`,
                        backgroundColor: getBarColor(currentAnalysis.atsScore),
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    {currentAnalysis.atsScore >= 80
                      ? '🌟 Outstanding ATS readability'
                      : currentAnalysis.atsScore >= 65
                      ? '⚡ Good formatting, room for keywords'
                      : '⚠️ Critical formatting adjustments needed'}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Target Job Fit
                    </span>
                    <Target className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white">
                      {currentAnalysis.matchScore}%
                    </span>
                  </div>
                  <div className="mt-3 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${currentAnalysis.matchScore}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    {currentAnalysis.targetJob?.title
                      ? `Matched with ${currentAnalysis.targetJob.title}`
                      : 'Benchmarked with Industry Standards'}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Relevance Index
                    </span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white">
                      {currentAnalysis.experienceRelevance || 75}%
                    </span>
                  </div>
                  <div className="mt-3 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${currentAnalysis.experienceRelevance || 75}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Evaluated career timeline relevance
                  </p>
                </div>
              </div>

              {/* Recharts Bar Breakdown */}
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-brand-400" />
                    Comparative Dimension Benchmarks
                  </h3>
                </div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                      <XAxis type="number" domain={[0, 100]} stroke={textColor} tick={{ fontSize: 11 }} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke={textColor}
                        tick={{ fontSize: 11 }}
                        width={130}
                      />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={16}>
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={index === 0 ? '#38bdf8' : index === 1 ? '#818cf8' : '#34d399'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Skills Analysis: Matched vs Missing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Matched Skills */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/20 shadow space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    Matched Skills ({currentAnalysis.matchedSkills?.length || 0})
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {currentAnalysis.matchedSkills?.length > 0 ? (
                      currentAnalysis.matchedSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">None detected</span>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-rose-500/20 shadow space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4" />
                    Missing / High-Value Gaps ({currentAnalysis.missingSkills?.length || 0})
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {currentAnalysis.missingSkills?.length > 0 ? (
                      currentAnalysis.missingSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium"
                        >
                          + {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">No major skill gaps identified!</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow space-y-3">
                  <div className="flex items-center gap-2 text-brand-400 text-xs font-semibold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    Resume Strengths
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {currentAnalysis.strengths?.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-brand-400 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    Areas to Elevate
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {currentAnalysis.weaknesses?.map((w, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Gemini Actionable Recommendations */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-brand-950/20 to-slate-900 border border-brand-500/20 shadow space-y-4">
                <div className="flex items-center gap-2 text-brand-300 text-sm font-semibold">
                  <Lightbulb className="w-4 h-4 text-brand-400" />
                  Gemini Optimization Recommendations
                </div>
                <div className="space-y-2.5">
                  {currentAnalysis.recommendations?.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-200 flex items-start gap-3"
                    >
                      <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0 text-[11px] font-bold">
                        {idx + 1}
                      </span>
                      <p className="leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Keyword Optimization Cloud */}
              {currentAnalysis.keywordOptimization?.length > 0 && (
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Recommended Keyword Injections
                    </span>
                    <span className="text-xs text-slate-500">Click to copy</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentAnalysis.keywordOptimization.map((kw, idx) => (
                      <button
                        key={idx}
                        onClick={() => copyToClipboard(kw)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition active:scale-95"
                      >
                        {copiedKeyword === kw ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span>{kw}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzerPage;
