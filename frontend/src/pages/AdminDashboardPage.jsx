import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Briefcase,
  TrendingUp,
  FileCheck,
  Calendar,
  Sparkles,
  Bot,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  UserX,
  RefreshCw,
  Trash2,
  Shield,
  Activity,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Check,
  Building,
  MapPin,
  Clock,
  Layers,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import api from '../services/api';
import { useChartTheme } from '../hooks/useChartTheme';

export const AdminDashboardPage = () => {
  const chartTheme = useChartTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // User management state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState(null);
  const [actionErrorMsg, setActionErrorMsg] = useState(null);

  // Job moderation state
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobPage, setJobPage] = useState(1);
  const [jobTotalPages, setJobTotalPages] = useState(1);
  const [jobSearch, setJobSearch] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState('');

  // Active tab: 'overview' | 'users' | 'jobs'
  const [activeTab, setActiveTab] = useState('overview');

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/dashboard');
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard stats:', err);
      setError(err.message || 'Failed to load platform analytics.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const params = new URLSearchParams();
      params.append('page', userPage);
      params.append('limit', 10);
      if (userSearch) params.append('search', userSearch);
      if (userRoleFilter) params.append('role', userRoleFilter);
      if (userStatusFilter) params.append('status', userStatusFilter);

      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.success) {
        setUsers(res.data.users);
        setUserTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      setJobsLoading(true);
      const params = new URLSearchParams();
      params.append('page', jobPage);
      params.append('limit', 10);
      if (jobSearch) params.append('search', jobSearch);
      if (jobStatusFilter) params.append('status', jobStatusFilter);

      const res = await api.get(`/admin/jobs?${params.toString()}`);
      if (res.success) {
        setJobs(res.data.jobs);
        setJobTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error('Error loading jobs:', err);
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'jobs') {
      fetchJobs();
    }
  }, [activeTab, userPage, userRoleFilter, userStatusFilter, jobPage, jobStatusFilter]);

  const handleUserSearchSubmit = (e) => {
    e.preventDefault();
    setUserPage(1);
    fetchUsers();
  };

  const handleJobSearchSubmit = (e) => {
    e.preventDefault();
    setJobPage(1);
    fetchJobs();
  };

  const showNotification = (msg, isError = false) => {
    if (isError) {
      setActionErrorMsg(msg);
      setTimeout(() => setActionErrorMsg(null), 5000);
    } else {
      setActionSuccessMsg(msg);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/status`, {
        isActive: !currentStatus,
      });
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isActive: !currentStatus } : u))
        );
        showNotification(`User account ${!currentStatus ? 'activated' : 'deactivated'} successfully.`);
        fetchDashboardStats(); // Refresh platform metrics
      }
    } catch (err) {
      showNotification(err.message || 'Failed to update user status.', true);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
        showNotification(`User role updated to ${newRole}.`);
        fetchDashboardStats();
      }
    } catch (err) {
      showNotification(err.message || 'Failed to update role.', true);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${userName}"? This cannot be undone.`)) {
      return;
    }
    try {
      const res = await api.delete(`/admin/users/${userId}`);
      if (res.success) {
        setUsers((prev) => prev.filter((u) => u._id !== userId));
        showNotification(`User ${userName} deleted permanently.`);
        fetchDashboardStats();
      }
    } catch (err) {
      showNotification(err.message || 'Failed to delete user.', true);
    }
  };

  const handleToggleJobStatus = async (jobId, newStatus) => {
    try {
      const res = await api.patch(`/admin/jobs/${jobId}/status`, { status: newStatus });
      if (res.success) {
        setJobs((prev) =>
          prev.map((j) => (j._id === jobId ? { ...j, status: newStatus } : j))
        );
        showNotification(`Job listing status updated to ${newStatus}.`);
        fetchDashboardStats();
      }
    } catch (err) {
      showNotification(err.message || 'Failed to update job status.', true);
    }
  };

  const handleDeleteJob = async (jobId, jobTitle) => {
    if (!window.confirm(`Permanently remove job "${jobTitle}" from platform?`)) {
      return;
    }
    try {
      const res = await api.delete(`/admin/jobs/${jobId}`);
      if (res.success) {
        setJobs((prev) => prev.filter((j) => j._id !== jobId));
        showNotification(`Job "${jobTitle}" removed by admin.`);
        fetchDashboardStats();
      }
    } catch (err) {
      showNotification(err.message || 'Failed to delete job.', true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Banner Alert Messages */}
        {actionSuccessMsg && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 animate-fadeIn">
            <Check className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{actionSuccessMsg}</span>
          </div>
        )}
        {actionErrorMsg && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 animate-fadeIn">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{actionErrorMsg}</span>
          </div>
        )}

        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-sm font-semibold tracking-wider uppercase mb-1">
              <ShieldAlert className="w-4 h-4" />
              <span>Platform Administration</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Admin Moderation Center
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm sm:text-base">
              Monitor platform metrics, manage user permissions, and enforce job posting compliance.
            </p>
          </div>

          {/* Navigation Tab Pills */}
          <div className="flex items-center gap-1.5 p-1.5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Users</span>
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'jobs'
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Job Listings</span>
            </button>
          </div>
        </div>

        {/* Global Loading / Error State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw className="w-10 h-10 text-brand-400 animate-spin mb-4" />
            <p className="text-slate-400 text-sm font-medium">Gathering ecosystem analytics...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center py-12">
            <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">Failed to Load Platform Analytics</h3>
            <p className="text-rose-300 text-sm mb-4">{error}</p>
            <button
              onClick={fetchDashboardStats}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm transition"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-fadeIn">
                
                {/* KPI Metrics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
                      <Users className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">{stats?.kpis?.totalUsers || 0}</div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                      <span>{stats?.kpis?.activeUsers || 0} active</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider">Candidates</span>
                      <UserCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">{stats?.kpis?.totalCandidates || 0}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">Talent seekers</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider">Recruiters</span>
                      <Building className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">{stats?.kpis?.totalRecruiters || 0}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">Company managers</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider">Total Jobs</span>
                      <Briefcase className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">{stats?.kpis?.totalJobs || 0}</div>
                    <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-medium">{stats?.kpis?.activeJobs || 0} active postings</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider">Applications</span>
                      <FileCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">{stats?.kpis?.totalApplications || 0}</div>
                    <div className="text-[11px] text-purple-600 dark:text-purple-400 mt-1 font-medium">Talent submissions</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider">Interviews</span>
                      <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">{stats?.kpis?.totalInterviews || 0}</div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">{stats?.kpis?.upcomingInterviews || 0} scheduled</div>
                  </div>
                </div>

                {/* Growth & Distribution Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Platform Growth Trend (AreaChart) */}
                  <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Platform Growth & Activity</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Monthly new user registrations vs applications</p>
                      </div>
                      <span className="px-2.5 py-1 text-xs rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 font-semibold">
                        Last 6 Months
                      </span>
                    </div>

                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats?.platformGrowth || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                            </linearGradient>
                            <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#9333ea" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#9333ea" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} />
                          <XAxis dataKey="month" stroke={chartTheme.axisStroke} tick={{ fill: chartTheme.tickFill }} fontSize={12} tickLine={false} />
                          <YAxis stroke={chartTheme.axisStroke} tick={{ fill: chartTheme.tickFill }} fontSize={12} tickLine={false} />
                          <Tooltip
                            contentStyle={chartTheme.tooltipContentStyle}
                            itemStyle={chartTheme.tooltipItemStyle}
                            labelStyle={chartTheme.tooltipLabelStyle}
                          />
                          <Legend wrapperStyle={{ color: chartTheme.tickFill }} />
                          <Area
                            type="monotone"
                            dataKey="newUsers"
                            name="New Users"
                            stroke="#0284c7"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#userGrad)"
                          />
                          <Area
                            type="monotone"
                            dataKey="applications"
                            name="Applications"
                            stroke="#9333ea"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#appGrad)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Role Breakdown Distribution (Pie/Donut) */}
                  <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">User Ecosystem</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Distribution across roles</p>
                      
                      <div className="h-56 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={stats?.roleDistribution || []}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="count"
                            >
                              {(stats?.roleDistribution || []).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={chartTheme.tooltipContentStyle}
                              itemStyle={chartTheme.tooltipItemStyle}
                              labelStyle={chartTheme.tooltipLabelStyle}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-200 dark:border-slate-800/80 text-center">
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Seekers</div>
                        <div className="text-base font-bold text-sky-600 dark:text-sky-400">
                          {stats?.kpis?.totalCandidates || 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Recruiters</div>
                        <div className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                          {stats?.kpis?.totalRecruiters || 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Admins</div>
                        <div className="text-base font-bold text-amber-600 dark:text-amber-400">
                          {stats?.kpis?.totalAdmins || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Application Funnel Stages (BarChart) */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Application Pipeline Velocity</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Platform-wide application status stages</p>
                    </div>
                  </div>

                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats?.applicationStatusDistribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} />
                        <XAxis dataKey="stage" stroke={chartTheme.axisStroke} tick={{ fill: chartTheme.tickFill }} fontSize={12} tickLine={false} />
                        <YAxis stroke={chartTheme.axisStroke} tick={{ fill: chartTheme.tickFill }} fontSize={12} tickLine={false} />
                        <Tooltip
                          contentStyle={chartTheme.tooltipContentStyle}
                          itemStyle={chartTheme.tooltipItemStyle}
                          labelStyle={chartTheme.tooltipLabelStyle}
                        />
                        <Bar dataKey="count" fill="#0284c7" radius={[6, 6, 0, 0]}>
                          {(stats?.applicationStatusDistribution || []).map((entry, index) => (
                            <Cell key={`bar-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Subsystem Health Status Banner */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 shadow-sm">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    Subsystem Diagnostics & Architecture
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-500 dark:text-slate-400 mb-1">Database Engine</div>
                      <div className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        {stats?.systemHealth?.database}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-500 dark:text-slate-400 mb-1">File Storage</div>
                      <div className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {stats?.systemHealth?.storage}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-500 dark:text-slate-400 mb-1">AI Intelligence</div>
                      <div className="font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                        {stats?.systemHealth?.aiEngine}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-500 dark:text-slate-400 mb-1">Dispatch Gateway</div>
                      <div className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        {stats?.systemHealth?.mailer}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* USERS MANAGEMENT TAB */}
            {activeTab === 'users' && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Search & Filters */}
                <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                  <form onSubmit={handleUserSearchSubmit} className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search users by name or email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                    />
                  </form>

                  <div className="flex items-center gap-3">
                    <select
                      value={userRoleFilter}
                      onChange={(e) => {
                        setUserRoleFilter(e.target.value);
                        setUserPage(1);
                      }}
                      className="bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    >
                      <option value="">All Roles</option>
                      <option value="candidate">Candidates</option>
                      <option value="recruiter">Recruiters</option>
                      <option value="admin">Admins</option>
                    </select>

                    <select
                      value={userStatusFilter}
                      onChange={(e) => {
                        setUserStatusFilter(e.target.value);
                        setUserPage(1);
                      }}
                      className="bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    >
                      <option value="">All Statuses</option>
                      <option value="active">Active Only</option>
                      <option value="deactivated">Deactivated</option>
                    </select>

                    <button
                      onClick={fetchUsers}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition shadow-sm"
                      title="Refresh users"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Users Directory Table */}
                <div className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                      <thead className="bg-slate-50 dark:bg-slate-900/80 text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="px-6 py-4">User</th>
                          <th className="px-6 py-4">Role</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Joined</th>
                          <th className="px-6 py-4 text-right">Moderation Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                        {usersLoading ? (
                          <tr>
                            <td colSpan="5" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-500" />
                              Loading user directory...
                            </td>
                          </tr>
                        ) : users.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                              No users match the search criteria.
                            </td>
                          </tr>
                        ) : (
                          users.map((u) => (
                            <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-brand-600 dark:text-brand-300 border border-slate-200 dark:border-slate-700 uppercase">
                                    {u.name?.slice(0, 2) || 'U'}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-slate-900 dark:text-white">{u.name}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">{u.email}</div>
                                  </div>
                                </div>
                              </td>

                              <td className="px-6 py-4">
                                <select
                                  value={u.role}
                                  onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 font-medium"
                                >
                                  <option value="candidate" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Candidate</option>
                                  <option value="recruiter" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Recruiter</option>
                                  <option value="admin" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Admin</option>
                                </select>
                              </td>

                              <td className="px-6 py-4">
                                {u.isActive !== false ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Active
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                    <XCircle className="w-3.5 h-3.5" />
                                    Deactivated
                                  </span>
                                )}
                              </td>

                              <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                                {new Date(u.createdAt).toLocaleDateString()}
                              </td>

                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleToggleUserStatus(u._id, u.isActive !== false)}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                                      u.isActive !== false
                                        ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                                    }`}
                                    title={u.isActive !== false ? 'Deactivate account' : 'Reactivate account'}
                                  >
                                    {u.isActive !== false ? (
                                      <>
                                        <UserX className="w-3.5 h-3.5" />
                                        <span>Deactivate</span>
                                      </>
                                    ) : (
                                      <>
                                        <UserCheck className="w-3.5 h-3.5" />
                                        <span>Activate</span>
                                      </>
                                    )}
                                  </button>

                                  <button
                                    onClick={() => handleDeleteUser(u._id, u.name)}
                                    className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-200 hover:bg-rose-500/10 border border-rose-500/20 transition"
                                    title="Delete User"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Footer */}
                  {userTotalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
                      <span>Page {userPage} of {userTotalPages}</span>
                      <div className="flex items-center gap-2">
                        <button
                          disabled={userPage <= 1}
                          onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                          className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          disabled={userPage >= userTotalPages}
                          onClick={() => setUserPage((p) => Math.min(userTotalPages, p + 1))}
                          className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* JOB MODERATION TAB */}
            {activeTab === 'jobs' && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Search & Status Filters */}
                <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                  <form onSubmit={handleJobSearchSubmit} className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search jobs by title or company..."
                      value={jobSearch}
                      onChange={(e) => setJobSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                    />
                  </form>

                  <div className="flex items-center gap-3">
                    <select
                      value={jobStatusFilter}
                      onChange={(e) => {
                        setJobStatusFilter(e.target.value);
                        setJobPage(1);
                      }}
                      className="bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    >
                      <option value="">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="Closed">Closed</option>
                      <option value="Draft">Draft</option>
                    </select>

                    <button
                      onClick={fetchJobs}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition shadow-sm"
                      title="Refresh job listings"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Job Listings Moderation Table */}
                <div className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                      <thead className="bg-slate-50 dark:bg-slate-900/80 text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="px-6 py-4">Job Title & Company</th>
                          <th className="px-6 py-4">Workplace</th>
                          <th className="px-6 py-4">Posted By</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Moderation Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                        {jobsLoading ? (
                          <tr>
                            <td colSpan="5" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-500" />
                              Loading job listings...
                            </td>
                          </tr>
                        ) : jobs.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                              No jobs match the search criteria.
                            </td>
                          </tr>
                        ) : (
                          jobs.map((j) => (
                            <tr key={j._id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition">
                              <td className="px-6 py-4">
                                <div>
                                  <Link
                                    to={`/jobs/${j._id}`}
                                    className="font-semibold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition flex items-center gap-1.5"
                                  >
                                    <span>{j.title}</span>
                                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                                  </Link>
                                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                                    <span>{j.company}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                                      {j.location}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                                  {j.workplaceType || 'On-site'}
                                </span>
                              </td>

                              <td className="px-6 py-4">
                                <div className="text-xs">
                                  <div className="font-medium text-slate-800 dark:text-slate-200">{j.recruiter?.name || 'Recruiter'}</div>
                                  <div className="text-slate-400 dark:text-slate-500">{j.recruiter?.email || ''}</div>
                                </div>
                              </td>

                              <td className="px-6 py-4">
                                <select
                                  value={j.status}
                                  onChange={(e) => handleToggleJobStatus(j._id, e.target.value)}
                                  className={`border rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none transition ${
                                    j.status === 'Active'
                                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                                      : j.status === 'Closed'
                                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                                      : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                                  }`}
                                >
                                  <option value="Active" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Active</option>
                                  <option value="Closed" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Closed</option>
                                  <option value="Draft" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Draft</option>
                                </select>
                              </td>

                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => handleDeleteJob(j._id, j.title)}
                                  className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-200 hover:bg-rose-500/10 border border-rose-500/20 transition"
                                  title="Delete Job"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Footer */}
                  {jobTotalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
                      <span>Page {jobPage} of {jobTotalPages}</span>
                      <div className="flex items-center gap-2">
                        <button
                          disabled={jobPage <= 1}
                          onClick={() => setJobPage((p) => Math.max(1, p - 1))}
                          className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          disabled={jobPage >= jobTotalPages}
                          onClick={() => setJobPage((p) => Math.min(jobTotalPages, p + 1))}
                          className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};
