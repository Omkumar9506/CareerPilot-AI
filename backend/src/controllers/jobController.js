import Job from '../models/Job.js';
import RecruiterProfile from '../models/RecruiterProfile.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * @route   GET /api/jobs
 * @desc    Search and filter jobs with pagination & sorting
 * @access  Public
 */
export const getJobs = asyncHandler(async (req, res) => {
  const {
    keyword,
    location,
    employmentType,
    experienceLevel,
    workplaceType,
    skills,
    minSalary,
    sort = 'newest',
    page = 1,
    limit = 10,
  } = req.query;

  const query = { status: 'Active' };

  // 1. Keyword search (checks title, company, skills, description)
  if (keyword && keyword.trim()) {
    query.$text = { $search: keyword.trim() };
  }

  // 2. Location filter
  if (location && location.trim()) {
    query.location = { $regex: location.trim(), $options: 'i' };
  }

  // 3. Employment Type
  if (employmentType) {
    const types = Array.isArray(employmentType) ? employmentType : employmentType.split(',');
    query.employmentType = { $in: types };
  }

  // 4. Experience Level
  if (experienceLevel) {
    const levels = Array.isArray(experienceLevel) ? experienceLevel : experienceLevel.split(',');
    query.experienceLevel = { $in: levels };
  }

  // 5. Workplace Type (Remote, Hybrid, On-site)
  if (workplaceType) {
    const types = Array.isArray(workplaceType) ? workplaceType : workplaceType.split(',');
    query.workplaceType = { $in: types };
  }

  // 6. Skills filter
  if (skills) {
    const skillList = Array.isArray(skills)
      ? skills
      : skills.split(',').map((s) => s.trim()).filter(Boolean);
    if (skillList.length > 0) {
      query.skills = { $in: skillList.map((s) => new RegExp(`^${s}$`, 'i')) };
    }
  }

  // 7. Salary filter
  if (minSalary && !isNaN(Number(minSalary))) {
    query.$or = [
      { 'salary.min': { $gte: Number(minSalary) } },
      { 'salary.max': { $gte: Number(minSalary) } },
    ];
  }

  // Sorting
  let sortOption = { createdAt: -1 };
  if (sort === 'oldest') {
    sortOption = { createdAt: 1 };
  } else if (sort === 'salary_high') {
    sortOption = { 'salary.max': -1, 'salary.min': -1 };
  } else if (sort === 'salary_low') {
    sortOption = { 'salary.min': 1 };
  } else if (sort === 'deadline') {
    sortOption = { deadline: 1 };
  }

  const pageNumber = Math.max(1, parseInt(page, 10));
  const limitNumber = Math.max(1, Math.min(50, parseInt(limit, 10)));
  const skip = (pageNumber - 1) * limitNumber;

  const totalJobs = await Job.countDocuments(query);
  const jobs = await Job.find(query)
    .populate('recruiter', 'name email avatar')
    .sort(sortOption)
    .skip(skip)
    .limit(limitNumber);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        jobs,
        pagination: {
          total: totalJobs,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(totalJobs / limitNumber) || 1,
        },
      },
      'Jobs retrieved successfully'
    )
  );
});

/**
 * @route   GET /api/jobs/:id
 * @desc    Get single job details and company info
 * @access  Public
 */
export const getJobById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const job = await Job.findById(id).populate('recruiter', 'name email avatar');

  if (!job) {
    throw new ApiError(404, 'Job not found');
  }

  // Fetch recruiter company profile
  const recruiterProfile = await RecruiterProfile.findOne({ user: job.recruiter?._id });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        job,
        recruiterProfile,
      },
      'Job details fetched successfully'
    )
  );
});

/**
 * @route   POST /api/jobs
 * @desc    Post a new job vacancy
 * @access  Private (Recruiter only)
 */
export const createJob = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    company,
    location,
    employmentType,
    experienceLevel,
    workplaceType,
    salary,
    skills,
    responsibilities,
    requirements,
    deadline,
    status,
  } = req.body;

  if (!title || !description || !location) {
    throw new ApiError(400, 'Title, description, and location are required');
  }

  // Auto-detect company name from recruiter profile if not provided
  let companyName = company;
  if (!companyName) {
    const profile = await RecruiterProfile.findOne({ user: req.user._id });
    companyName = profile?.companyName || `${req.user.name}'s Organization`;
  }

  const job = await Job.create({
    recruiter: req.user._id,
    title,
    description,
    company: companyName,
    location,
    employmentType: employmentType || 'Full-time',
    experienceLevel: experienceLevel || 'Mid-Level',
    workplaceType: workplaceType || 'Remote',
    salary: salary || { min: 0, max: 0, currency: 'USD', isNegotiable: false },
    skills: Array.isArray(skills) ? skills.map((s) => s.trim()).filter(Boolean) : [],
    responsibilities: Array.isArray(responsibilities) ? responsibilities.filter(Boolean) : [],
    requirements: Array.isArray(requirements) ? requirements.filter(Boolean) : [],
    deadline: deadline || null,
    status: status || 'Active',
  });

  return res.status(201).json(new ApiResponse(201, { job }, 'Job created successfully'));
});

/**
 * @route   PUT /api/jobs/:id
 * @desc    Update a job vacancy
 * @access  Private (Recruiter only)
 */
export const updateJob = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const job = await Job.findById(id);

  if (!job) {
    throw new ApiError(404, 'Job not found');
  }

  // Ownership verification
  if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You are not authorized to edit this job posting');
  }

  const updatedJob = await Job.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  return res.status(200).json(new ApiResponse(200, { job: updatedJob }, 'Job updated successfully'));
});

/**
 * @route   DELETE /api/jobs/:id
 * @desc    Delete a job vacancy
 * @access  Private (Recruiter only)
 */
export const deleteJob = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const job = await Job.findById(id);

  if (!job) {
    throw new ApiError(404, 'Job not found');
  }

  // Ownership check
  if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You are not authorized to delete this job posting');
  }

  await Job.findByIdAndDelete(id);

  return res.status(200).json(new ApiResponse(200, null, 'Job deleted successfully'));
});

/**
 * @route   GET /api/jobs/recruiter/my-jobs
 * @desc    Get all jobs posted by the logged-in recruiter
 * @access  Private (Recruiter only)
 */
export const getMyPostedJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ recruiter: req.user._id }).sort({ createdAt: -1 });

  const activeCount = jobs.filter((j) => j.status === 'Active').length;
  const closedCount = jobs.filter((j) => j.status === 'Closed').length;
  const draftCount = jobs.filter((j) => j.status === 'Draft').length;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        jobs,
        stats: {
          total: jobs.length,
          active: activeCount,
          closed: closedCount,
          draft: draftCount,
        },
      },
      'Recruiter jobs fetched successfully'
    )
  );
});

/**
 * @route   PATCH /api/jobs/:id/status
 * @desc    Toggle or change status of a job
 * @access  Private (Recruiter only)
 */
export const toggleJobStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['Active', 'Closed', 'Draft'].includes(status)) {
    throw new ApiError(400, 'Invalid job status value');
  }

  const job = await Job.findById(id);
  if (!job) {
    throw new ApiError(404, 'Job not found');
  }

  if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You are not authorized to update this job status');
  }

  job.status = status;
  await job.save();

  return res.status(200).json(new ApiResponse(200, { job }, `Job marked as ${status}`));
});
