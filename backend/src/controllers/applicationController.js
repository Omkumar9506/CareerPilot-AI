import Application from '../models/Application.js';
import Job from '../models/Job.js';
import JobSeekerProfile from '../models/JobSeekerProfile.js';
import { calculateJobMatch } from '../services/matchingService.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * @route   POST /api/applications/apply/:jobId
 * @desc    Candidate applies for a job
 * @access  Private (Candidate only)
 */
export const applyForJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const { resume, coverLetter } = req.body;
  const candidateId = req.user._id;

  // 1. Validate Job exists & is open
  const job = await Job.findById(jobId);
  if (!job) {
    throw new ApiError(404, 'Job vacancy not found');
  }

  if (job.status !== 'Active') {
    throw new ApiError(400, 'This job listing is no longer accepting applications');
  }

  // 2. Check for existing application
  const existingApp = await Application.findOne({
    job: jobId,
    candidate: candidateId,
  });

  if (existingApp) {
    throw new ApiError(400, 'You have already applied for this position');
  }

  // 3. Resolve resume: body URL or candidate profile resume
  let resumeUrl = resume;
  if (!resumeUrl) {
    const profile = await JobSeekerProfile.findOne({ user: candidateId });
    resumeUrl = profile?.resume || '';
  }

  // 4. Create Application
  const application = await Application.create({
    job: jobId,
    candidate: candidateId,
    recruiter: job.recruiter,
    resume: resumeUrl,
    coverLetter: coverLetter || '',
    status: 'Applied',
    appliedAt: new Date(),
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      { application },
      'Application submitted successfully! Track progress on your dashboard.'
    )
  );
});

/**
 * @route   GET /api/applications/my-applications
 * @desc    Get all applications submitted by logged-in candidate
 * @access  Private (Candidate only)
 */
export const getMyApplications = asyncHandler(async (req, res) => {
  const candidateId = req.user._id;

  const applications = await Application.find({ candidate: candidateId })
    .populate({
      path: 'job',
      select: 'title company location employmentType workplaceType salary deadline status',
    })
    .populate({
      path: 'recruiter',
      select: 'name email avatar',
    })
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        total: applications.length,
        applications,
      },
      'Candidate applications fetched successfully'
    )
  );
});

/**
 * @route   GET /api/applications/check/:jobId
 * @desc    Check if current candidate has already applied for a job
 * @access  Private (Candidate only)
 */
export const checkApplicationStatus = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const candidateId = req.user._id;

  const application = await Application.findOne({
    job: jobId,
    candidate: candidateId,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        hasApplied: !!application,
        application: application || null,
      },
      'Application status checked'
    )
  );
});

/**
 * @route   GET /api/applications/recruiter
 * @desc    Get all applications across recruiter's jobs with filtering & stats
 * @access  Private (Recruiter only)
 */
export const getRecruiterApplications = asyncHandler(async (req, res) => {
  const recruiterId = req.user._id;
  const { status, jobId } = req.query;

  const query = { recruiter: recruiterId };

  if (status && status !== 'All') {
    query.status = status;
  }

  if (jobId) {
    query.job = jobId;
  }

  const applications = await Application.find(query)
    .populate({
      path: 'job',
      select: 'title company location employmentType workplaceType skills experienceLevel',
    })
    .populate({
      path: 'candidate',
      select: 'name email avatar',
    })
    .sort({ createdAt: -1 });

  // Attach AI candidate match scores
  const candidateIds = applications.map((a) => a.candidate?._id).filter(Boolean);
  const profiles = await JobSeekerProfile.find({ user: { $in: candidateIds } });
  const profileMap = new Map(profiles.map((p) => [p.user.toString(), p]));

  let enrichedApplications = applications.map((app) => {
    const appObj = app.toObject();
    const profile = app.candidate?._id ? profileMap.get(app.candidate._id.toString()) : null;
    if (profile && app.job) {
      const match = calculateJobMatch(profile, app.job);
      appObj.aiMatch = {
        score: match.matchScore,
        level: match.matchLevel,
        badgeColor: match.badgeColor,
        matchedSkills: match.matchedSkills,
        missingSkills: match.missingSkills,
      };
    } else {
      appObj.aiMatch = null;
    }
    return appObj;
  });

  const { sortBy } = req.query;
  if (sortBy === 'match') {
    enrichedApplications = enrichedApplications.sort(
      (a, b) => (b.aiMatch?.score || 0) - (a.aiMatch?.score || 0)
    );
  }

  // Get breakdown counts
  const allRecruiterApps = await Application.find({ recruiter: recruiterId });
  const stats = {
    total: allRecruiterApps.length,
    applied: allRecruiterApps.filter((a) => a.status === 'Applied').length,
    underReview: allRecruiterApps.filter((a) => a.status === 'Under Review').length,
    shortlisted: allRecruiterApps.filter((a) => a.status === 'Shortlisted').length,
    interview: allRecruiterApps.filter((a) => a.status === 'Interview').length,
    selected: allRecruiterApps.filter((a) => a.status === 'Selected').length,
    rejected: allRecruiterApps.filter((a) => a.status === 'Rejected').length,
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        stats,
        total: enrichedApplications.length,
        applications: enrichedApplications,
      },
      'Recruiter applications retrieved successfully'
    )
  );
});

/**
 * @route   GET /api/applications/job/:jobId
 * @desc    Get all applicants for a specific job
 * @access  Private (Recruiter only)
 */
export const getJobApplicants = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const job = await Job.findById(jobId);
  if (!job) {
    throw new ApiError(404, 'Job not found');
  }

  if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You are not authorized to view applicants for this job');
  }

  const applicants = await Application.find({ job: jobId })
    .populate({
      path: 'candidate',
      select: 'name email avatar',
    })
    .sort({ createdAt: -1 });

  // Attach AI match scores
  const candidateIds = applicants.map((a) => a.candidate?._id).filter(Boolean);
  const profiles = await JobSeekerProfile.find({ user: { $in: candidateIds } });
  const profileMap = new Map(profiles.map((p) => [p.user.toString(), p]));

  let enrichedApplicants = applicants.map((app) => {
    const appObj = app.toObject();
    const profile = app.candidate?._id ? profileMap.get(app.candidate._id.toString()) : null;
    if (profile && job) {
      const match = calculateJobMatch(profile, job);
      appObj.aiMatch = {
        score: match.matchScore,
        level: match.matchLevel,
        badgeColor: match.badgeColor,
        matchedSkills: match.matchedSkills,
        missingSkills: match.missingSkills,
      };
    } else {
      appObj.aiMatch = null;
    }
    return appObj;
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        jobTitle: job.title,
        total: enrichedApplicants.length,
        applicants: enrichedApplicants,
      },
      'Job applicants fetched successfully'
    )
  );
});

/**
 * @route   PATCH /api/applications/:id/status
 * @desc    Recruiter changes status of an applicant
 * @access  Private (Recruiter only)
 */
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = [
    'Applied',
    'Under Review',
    'Shortlisted',
    'Interview',
    'Selected',
    'Rejected',
  ];

  if (!validStatuses.includes(status)) {
    throw new ApiError(400, `Invalid status. Permitted values: ${validStatuses.join(', ')}`);
  }

  const application = await Application.findById(id).populate('job', 'title company');
  if (!application) {
    throw new ApiError(404, 'Application not found');
  }

  if (application.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You are not authorized to modify this application');
  }

  application.status = status;
  await application.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { application },
      `Application status updated to ${status}`
    )
  );
});
