import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Clock, 
  Filter, 
  ArrowRight, 
  Loader2, 
  Building2, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  SlidersHorizontal,
  X,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Cpu,
  Bookmark
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const JobsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const isCandidate = isAuthenticated && user?.role === 'candidate';

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'recommended'
  const [jobs, setJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters state
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [selectedWorkplace, setSelectedWorkplace] = useState([]);
  const [selectedExperience, setSelectedExperience] = useState([]);
  const [selectedEmployment, setSelectedEmployment] = useState([]);
  const [minSalary, setMinSalary] = useState('');
  const [minMatchScore, setMinMatchScore] = useState(30);
  const [sort, setSort] = useState('newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [candidateSummary, setCandidateSummary] = useState(null);

  const workplaceOptions = ['Remote', 'Hybrid', 'On-site'];
  const experienceOptions = ['Entry', 'Mid-Level', 'Senior', 'Lead', 'Executive'];
  const employmentOptions = ['Full-time', 'Part-time', 'Contract', 'Internship'];
  const matchTiers = [
    { label: 'All Matches (30%+)', value: 30 },
    { label: 'Good Matches (50%+)', value: 50 },
    { label: 'Strong Matches (70%+)', value: 70 },
    { label: 'Top Tier (85%+)', value: 85 },
  ];

  const fetchJobs = async (page = 1) => {
    setLoading(true);
    try {
      if (activeTab === 'recommended' && isCandidate) {
        // Fetch AI Recommended Jobs
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', 9);
        params.append('minScore', minMatchScore);

        const res = await api.get(`/matches/recommendations?${params.toString()}`);
        if (res.success) {
          setJobs(res.data.recommendations || []);
          setPagination({
            page: res.data.page || 1,
            totalPages: res.data.totalPages || 1,
            total: res.data.total || 0,
          });
          if (res.data.candidateProfileSummary) {
            setCandidateSummary(res.data.candidateProfileSummary);
          }
        }
      } else {
        // Standard Jobs Catalog
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', 9);
        params.append('sort', sort);

        if (keyword.trim()) params.append('keyword', keyword.trim());
        if (location.trim()) params.append('location', location.trim());
        if (selectedWorkplace.length > 0) params.append('workplaceType', selectedWorkplace.join(','));
        if (selectedExperience.length > 0) params.append('experienceLevel', selectedExperience.join(','));
        if (selectedEmployment.length > 0) params.append('employmentType', selectedEmployment.join(','));
        if (minSalary) params.append('minSalary', minSalary);

        const res = await api.get(`/jobs?${params.toString()}`);
        if (res.success) {
          setJobs(res.data.jobs || []);
          setPagination(res.data.pagination || { page: 1, totalPages: 1, total: 0 });
        }
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(1);
  }, [activeTab, selectedWorkplace, selectedExperience, selectedEmployment, sort, minMatchScore]);

  useEffect(() => {
    if (isCandidate) {
      api.get('/jobs/saved/ids')
        .then((res) => {
          if (res.success && res.data?.savedJobIds) {
            setSavedJobIds(new Set(res.data.savedJobIds));
          }
        })
        .catch((err) => console.error('Error fetching saved job IDs:', err));
    }
  }, [isCandidate]);

  const handleToggleSave = async (jobId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    try {
      const res = await api.post(`/jobs/${jobId}/save`);
      if (res.success) {
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          if (res.data.isSaved) {
            next.add(jobId);
          } else {
            next.delete(jobId);
          }
          return next;
        });
      }
    } catch (err) {
      console.error('Failed to toggle save job:', err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs(1);
  };

  const toggleArrayFilter = (arr, setArr, value) => {
    if (arr.includes(value)) {
      setArr(arr.filter((item) => item !== value));
    } else {
      setArr([...arr, value]);
    }
  };

  const clearAllFilters = () => {
    setKeyword('');
    setLocation('');
    setSelectedWorkplace([]);
    setSelectedExperience([]);
    setSelectedEmployment([]);
    setMinSalary('');
    setSort('newest');
  };

  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return 'Competitive';
    const currency = salary.currency === 'USD' ? '$' : salary.currency;
    if (salary.min && salary.max) {
      return `${currency}${(salary.min / 1000).toFixed(0)}k - ${currency}${(salary.max / 1000).toFixed(0)}k`;
    }
    if (salary.min) return `From ${currency}${(salary.min / 1000).toFixed(0)}k`;
    return `Up to ${currency}${(salary.max / 1000).toFixed(0)}k`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
          Curated Tech Positions
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Explore Verified Opportunities
        </h1>
        <p className="text-sm text-slate-400">
          Discover vetted high-growth engineering, design, and product roles tailored to your career aspirations.
        </p>

        {/* Candidate Feed Mode Switcher */}
        {isCandidate && (
          <div className="pt-4 flex items-center justify-center">
            <div className="inline-flex p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'all'
                    ? 'bg-slate-800 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                All Positions
              </button>
              <button
                onClick={() => setActiveTab('recommended')}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'recommended'
                    ? 'bg-gradient-to-r from-brand-600 via-indigo-600 to-cyber-600 text-white shadow-lg shadow-brand-500/30'
                    : 'text-brand-400 hover:text-brand-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                AI Recommended for You
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recommended Tab Info Banner */}
      {activeTab === 'recommended' && isCandidate && (
        <div className="p-4 sm:p-5 rounded-2xl bg-brand-50 border border-brand-200 text-slate-900 dark:bg-gradient-to-r dark:from-brand-950/40 dark:via-indigo-950/30 dark:to-slate-900/80 dark:border-brand-500/30 dark:text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Personalized AI Career Matches
                <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 font-bold">
                  Live Engine
                </span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Ranks vacancies against your profile skills ({candidateSummary?.skills?.slice(0, 4).join(', ') || 'skills'}), experience, and location fit.
              </p>
            </div>
          </div>

          {/* Threshold filter */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Match Tier:</span>
            <select
              value={minMatchScore}
              onChange={(e) => setMinMatchScore(Number(e.target.value))}
              className="bg-white border border-slate-300 dark:bg-slate-950 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-brand-600 dark:text-brand-300 font-medium focus:outline-none focus:border-brand-500"
            >
              {matchTiers.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Main Search Bar (Shown in 'all' tab) */}
      {activeTab === 'all' && (
        <form
          onSubmit={handleSearchSubmit}
          className="bg-white dark:bg-slate-900/90 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-2xl flex flex-col md:flex-row gap-2"
        >
          <div className="flex-1 flex items-center px-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-850">
            <Search className="w-4 h-4 text-slate-400 mr-3" />
            <input
              type="text"
              placeholder="Search by job title, skill (e.g. React, Node.js), or company..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full py-3 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="flex-1 flex items-center px-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-850">
            <MapPin className="w-4 h-4 text-slate-400 mr-3" />
            <input
              type="text"
              placeholder="City, state, or 'Remote'..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full py-3 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            Search Roles
          </button>
        </form>
      )}

      {/* Mobile Filter Toggle */}
      {activeTab === 'all' && (
        <div className="lg:hidden flex items-center justify-between">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 dark:bg-slate-900 dark:border-slate-800 text-xs font-semibold dark:text-slate-300"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters {selectedWorkplace.length + selectedExperience.length + selectedEmployment.length > 0 && `(${selectedWorkplace.length + selectedExperience.length + selectedEmployment.length})`}
          </button>
          <span className="text-xs text-slate-500">{pagination.total} positions found</span>
        </div>
      )}

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Filter Sidebar (Only in 'all' tab) */}
        {activeTab === 'all' && (
          <aside
            className={`lg:block ${
              mobileFilterOpen ? 'block' : 'hidden'
            } space-y-6 bg-white border border-slate-200 dark:bg-slate-900/80 dark:border-slate-800 text-slate-900 dark:text-white shadow-sm p-6 rounded-2xl sticky top-24`}
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white text-sm font-bold">
                <Filter className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                Refine Search
              </div>
              <button
                onClick={clearAllFilters}
                className="text-xs text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 transition-colors"
              >
                Reset
              </button>
            </div>

            <div className="space-y-6">
              {/* Workplace Type */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Workplace Mode</h4>
                {workplaceOptions.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedWorkplace.includes(opt)}
                      onChange={() => toggleArrayFilter(selectedWorkplace, setSelectedWorkplace, opt)}
                      className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-brand-600 focus:ring-brand-500"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>

              {/* Experience Level */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Experience Level</h4>
                {experienceOptions.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedExperience.includes(opt)}
                      onChange={() => toggleArrayFilter(selectedExperience, setSelectedExperience, opt)}
                      className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-brand-600 focus:ring-brand-500"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>

              {/* Employment Type */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Employment Type</h4>
                {employmentOptions.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedEmployment.includes(opt)}
                      onChange={() => toggleArrayFilter(selectedEmployment, setSelectedEmployment, opt)}
                      className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-brand-600 focus:ring-brand-500"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>

              {/* Min Salary Input */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Min Annual Salary ($)</h4>
                <input
                  type="number"
                  placeholder="e.g. 80000"
                  value={minSalary}
                  onChange={(e) => setMinSalary(e.target.value)}
                  onBlur={() => fetchJobs(1)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </aside>
        )}

        {/* Jobs Results Column */}
        <main className={`${activeTab === 'recommended' ? 'lg:col-span-4' : 'lg:col-span-3'} space-y-6`}>
          
          {/* Results Summary & Sorting */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/90 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 shadow-sm">
            <div>
              {activeTab === 'recommended' ? (
                <span>
                  Showing <span className="text-slate-900 dark:text-white font-semibold">{jobs.length}</span> high-match vacancies matching your profile
                </span>
              ) : (
                <span>
                  Showing <span className="text-slate-900 dark:text-white font-semibold">{jobs.length}</span> of{' '}
                  <span className="text-slate-900 dark:text-white font-semibold">{pagination.total}</span> available positions
                </span>
              )}
            </div>

            {activeTab === 'all' && (
              <div className="flex items-center gap-2">
                <span>Sort by:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="salary_high">Highest Salary</option>
                  <option value="salary_low">Lowest Salary</option>
                  <option value="deadline">Application Deadline</option>
                </select>
              </div>
            )}
          </div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {activeTab === 'recommended' ? 'Calculating multidimensional AI matches...' : 'Searching active opportunities...'}
              </p>
            </div>
          )}

          {/* Empty State */}
          {!loading && jobs.length === 0 && (
            <div className="p-12 bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
              <p className="text-slate-600 dark:text-slate-400 text-sm">No job opportunities matched your current search filters.</p>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-500 transition"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Job Cards Grid */}
          {!loading && jobs.length > 0 && (
            <div className={`grid grid-cols-1 ${activeTab === 'recommended' ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
              {jobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-white dark:bg-slate-900/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between group relative overflow-hidden shadow-sm hover:shadow-md hover:border-brand-500/40 transition-all duration-200"
                >
                  {/* Subtle top accent if high match */}
                  {job.match?.matchScore >= 85 && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
                  )}

                  <div className="space-y-4">
                    
                    {/* Top Row: AI Match Badge (if recommended) or Company & Workplace */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-sm">
                          {job.company?.[0] || 'C'}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{job.company}</p>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors line-clamp-1">
                            {job.title}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            job.workplaceType === 'Remote'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                              : job.workplaceType === 'Hybrid'
                              ? 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyber-500/10 dark:text-cyber-400 dark:border-cyber-500/20'
                              : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                          }`}
                        >
                          {job.workplaceType}
                        </span>
                        {isCandidate && (
                          <button
                            type="button"
                            onClick={(e) => handleToggleSave(job._id, e)}
                            title={savedJobIds.has(job._id) ? 'Remove from saved' : 'Save job'}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-amber-500 dark:bg-slate-850 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-750 transition"
                          >
                            <Bookmark
                              className={`w-3.5 h-3.5 ${
                                savedJobIds.has(job._id) ? 'fill-amber-500 text-amber-500' : ''
                              }`}
                            />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* AI Match Badge when present */}
                    {job.match && (
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 animate-pulse" />
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {job.match.matchScore}% Match
                            </span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${job.match.badgeColor}`}>
                            {job.match.matchLevel}
                          </span>
                        </div>

                        {/* Matched skills count & gaps */}
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                            <CheckCircle2 className="w-3 h-3" />
                            {job.match.matchedSkills?.length || 0} Matched
                          </span>
                          <span>•</span>
                          <span>
                            {job.match.missingSkills?.length > 0 ? `${job.match.missingSkills.length} to build` : 'Zero major gaps'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.employmentType}</span>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>{formatSalary(job.salary)}</span>
                      </div>
                    </div>

                    {/* Skills pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.skills?.slice(0, 4).map((s) => {
                        const isSkillMatched = job.match?.matchedSkills?.includes(s);
                        return (
                          <span
                            key={s}
                            className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                              isSkillMatched
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30'
                                : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/90 dark:text-slate-300 dark:border-slate-800'
                            }`}
                          >
                            {isSkillMatched && '✓ '}{s}
                          </span>
                        );
                      })}
                      {job.skills?.length > 4 && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-500 text-[10px]">
                          +{job.skills.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Action */}
                  <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                    <Link
                      to={`/jobs/${job._id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
                    >
                      View Role & Match
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchJobs(pagination.page - 1)}
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white disabled:opacity-40 shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 px-3">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchJobs(pagination.page + 1)}
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white disabled:opacity-40 shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </main>

      </div>
    </div>
  );
};

export default JobsPage;
