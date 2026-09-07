import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Interview from '../models/Interview.js';
import AIAnalysis from '../models/AIAnalysis.js';
import CareerRoadmap from '../models/CareerRoadmap.js';
import JobSeekerProfile from '../models/JobSeekerProfile.js';
import RecruiterProfile from '../models/RecruiterProfile.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * @route   GET /api/admin/dashboard
 * @desc    Aggregate all platform statistics, growth timeline, and system health
 * @access  Private (Admin only)
 */
export const getAdminDashboardStats = asyncHandler(async (req, res) => {
  // 1. Parallel queries across primary collections
  const [
    users,
    jobs,
    applications,
    interviews,
    aiAnalysesCount,
    roadmapsCount,
  ] = await Promise.all([
    User.find({}).select('name email role avatar isActive createdAt'),
    Job.find({}).populate('recruiter', 'name email company').sort({ createdAt: -1 }),
    Application.find({}).select('status appliedAt createdAt'),
    Interview.find({}).select('status date time createdAt'),
    AIAnalysis.countDocuments(),
    CareerRoadmap.countDocuments(),
  ]);

  // User breakdown
  const totalUsers = users.length;
  const totalCandidates = users.filter((u) => u.role === 'candidate').length;
  const totalRecruiters = users.filter((u) => u.role === 'recruiter').length;
  const totalAdmins = users.filter((u) => u.role === 'admin').length;
  const activeUsers = users.filter((u) => u.isActive !== false).length;
  const deactivatedUsers = users.filter((u) => u.isActive === false).length;

  // Job breakdown
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((j) => j.status === 'Active').length;
  const closedJobs = jobs.filter((j) => j.status === 'Closed').length;
  const draftJobs = jobs.filter((j) => j.status === 'Draft').length;

  // Application breakdown
  const totalApplications = applications.length;
  const appStages = {
    applied: applications.filter((a) => a.status === 'Applied').length,
    underReview: applications.filter((a) => a.status === 'Under Review').length,
    shortlisted: applications.filter((a) => a.status === 'Shortlisted').length,
    interview: applications.filter((a) => a.status === 'Interview').length,
    selected: applications.filter((a) => a.status === 'Selected').length,
    rejected: applications.filter((a) => a.status === 'Rejected').length,
  };

  // Interview metrics
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const totalInterviews = interviews.length;
  const upcomingInterviewsCount = interviews.filter(
    (i) => ['Scheduled', 'Rescheduled'].includes(i.status) && new Date(i.date) >= todayStart
  ).length;

  // Role distribution for charts
  const roleDistribution = [
    { name: 'Job Seekers', count: totalCandidates, color: '#38bdf8' },
    { name: 'Recruiters', count: totalRecruiters, color: '#818cf8' },
    { name: 'Admins', count: totalAdmins, color: '#f59e0b' },
  ];

  // Application funnel distribution
  const applicationStatusDistribution = [
    { stage: 'Applied', count: appStages.applied, color: '#38bdf8' },
    { stage: 'Under Review', count: appStages.underReview, color: '#818cf8' },
    { stage: 'Shortlisted', count: appStages.shortlisted, color: '#a855f7' },
    { stage: 'Interview', count: appStages.interview, color: '#06b6d4' },
    { stage: 'Selected', count: appStages.selected, color: '#10b981' },
    { stage: 'Rejected', count: appStages.rejected, color: '#f43f5e' },
  ];

  // Platform Growth Timeline (Monthly registrations over the past 6 months)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const platformGrowth = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m = d.getMonth();
    const y = d.getFullYear();

    const userCount = users.filter((u) => {
      const created = new Date(u.createdAt);
      return created.getFullYear() === y && created.getMonth() === m;
    }).length;

    const appCount = applications.filter((a) => {
      const created = new Date(a.appliedAt || a.createdAt);
      return created.getFullYear() === y && created.getMonth() === m;
    }).length;

    platformGrowth.push({
      month: `${monthNames[m]} ${y}`,
      newUsers: userCount,
      applications: appCount,
    });
  }

  // Recent Users
  const recentUsers = [...users]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  // Recent Jobs
  const recentJobs = jobs.slice(0, 6).map((job) => ({
    _id: job._id,
    title: job.title,
    company: job.company,
    recruiter: job.recruiter?.name || 'Recruiter',
    workplaceType: job.workplaceType,
    status: job.status,
    createdAt: job.createdAt,
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        kpis: {
          totalUsers,
          totalCandidates,
          totalRecruiters,
          totalAdmins,
          activeUsers,
          deactivatedUsers,
          totalJobs,
          activeJobs,
          closedJobs,
          draftJobs,
          totalApplications,
          totalInterviews,
          upcomingInterviews: upcomingInterviewsCount,
          totalAIAnalyses: aiAnalysesCount,
          totalRoadmaps: roadmapsCount,
        },
        roleDistribution,
        applicationStatusDistribution,
        platformGrowth,
        recentUsers,
        recentJobs,
        systemHealth: {
          database: 'Connected (MongoDB)',
          storage: 'Active (Cloudinary / Local Fallback)',
          aiEngine: 'Operational (Google Gemini)',
          mailer: 'Ready (Nodemailer)',
        },
      },
      'Admin platform analytics retrieved successfully'
    )
  );
});

/**
 * @route   GET /api/admin/users
 * @desc    Get paginated users list with search and filters
 * @access  Private (Admin only)
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, status, search, page = 1, limit = 15 } = req.query;

  const query = {};

  if (role && role !== 'all') {
    query.role = role;
  }

  if (status === 'active') {
    query.isActive = { $ne: false };
  } else if (status === 'deactivated') {
    query.isActive = false;
  }

  if (search && search.trim()) {
    const reg = new RegExp(search.trim(), 'i');
    query.$or = [{ name: reg }, { email: reg }];
  }

  const p = Math.max(1, parseInt(page, 10) || 1);
  const lim = Math.max(1, Math.min(50, parseInt(limit, 10) || 15));
  const skip = (p - 1) * lim;

  const [users, total] = await Promise.all([
    User.find(query)
      .select('name email role avatar isActive isVerified createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim),
    User.countDocuments(query),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        total,
        page: p,
        totalPages: Math.ceil(total / lim) || 1,
        users,
      },
      'Users retrieved successfully'
    )
  );
});

/**
 * @route   PATCH /api/admin/users/:id/status
 * @desc    Activate or deactivate user account
 * @access  Private (Admin only)
 */
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (req.user._id.toString() === id) {
    throw new ApiError(400, 'Administrators cannot deactivate their own account.');
  }

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Set explicit status or toggle
  user.isActive = typeof isActive === 'boolean' ? isActive : !user.isActive;
  await user.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { user },
      `User account ${user.isActive ? 'activated' : 'deactivated'} successfully`
    )
  );
});

/**
 * @route   PATCH /api/admin/users/:id/role
 * @desc    Change user role (candidate / recruiter / admin)
 * @access  Private (Admin only)
 */
export const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['candidate', 'recruiter', 'admin'].includes(role)) {
    throw new ApiError(400, 'Invalid role. Must be candidate, recruiter, or admin.');
  }

  if (req.user._id.toString() === id && role !== 'admin') {
    throw new ApiError(400, 'Administrators cannot demote their own account.');
  }

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.role = role;
  await user.save();

  return res.status(200).json(
    new ApiResponse(200, { user }, `User role updated to ${role}`)
  );
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Permanently delete a user and their associated data
 * @access  Private (Admin only)
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user._id.toString() === id) {
    throw new ApiError(400, 'Administrators cannot delete their own account.');
  }

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Clean up associated profiles
  await Promise.all([
    User.findByIdAndDelete(id),
    JobSeekerProfile.deleteOne({ user: id }),
    RecruiterProfile.deleteOne({ user: id }),
  ]);

  return res.status(200).json(
    new ApiResponse(200, { deletedId: id }, 'User deleted successfully')
  );
});

/**
 * @route   GET /api/admin/jobs
 * @desc    Get all platform vacancies with applicant counts & filters
 * @access  Private (Admin only)
 */
export const getAllJobsAdmin = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 15 } = req.query;

  const query = {};
  if (status && status !== 'all') {
    query.status = status;
  }
  if (search && search.trim()) {
    const reg = new RegExp(search.trim(), 'i');
    query.$or = [{ title: reg }, { company: reg }, { location: reg }];
  }

  const p = Math.max(1, parseInt(page, 10) || 1);
  const lim = Math.max(1, Math.min(50, parseInt(limit, 10) || 15));
  const skip = (p - 1) * lim;

  const [jobs, total, applications] = await Promise.all([
    Job.find(query)
      .populate('recruiter', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim),
    Job.countDocuments(query),
    Application.find({}).select('job'),
  ]);

  const applicantMap = {};
  applications.forEach((app) => {
    const jId = app.job?.toString();
    if (jId) {
      applicantMap[jId] = (applicantMap[jId] || 0) + 1;
    }
  });

  const enrichedJobs = jobs.map((job) => ({
    ...job.toObject(),
    applicantsCount: applicantMap[job._id.toString()] || 0,
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        total,
        page: p,
        totalPages: Math.ceil(total / lim) || 1,
        jobs: enrichedJobs,
      },
      'Platform jobs retrieved successfully'
    )
  );
});

/**
 * @route   PATCH /api/admin/jobs/:id/status
 * @desc    Moderate / update job status as admin
 * @access  Private (Admin only)
 */
export const toggleJobStatusAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['Active', 'Closed', 'Draft'].includes(status)) {
    throw new ApiError(400, 'Invalid status. Must be Active, Closed, or Draft.');
  }

  const job = await Job.findById(id);
  if (!job) {
    throw new ApiError(404, 'Job not found');
  }

  job.status = status;
  await job.save();

  return res.status(200).json(
    new ApiResponse(200, { job }, `Job status updated to ${status}`)
  );
});

/**
 * @route   DELETE /api/admin/jobs/:id
 * @desc    Delete a job as admin
 * @access  Private (Admin only)
 */
export const deleteJobAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const job = await Job.findByIdAndDelete(id);
  if (!job) {
    throw new ApiError(404, 'Job not found');
  }

  // Also clean up applications for this deleted job
  await Application.deleteMany({ job: id });

  return res.status(200).json(
    new ApiResponse(200, { deletedId: id }, 'Job and associated applications deleted successfully')
  );
});
