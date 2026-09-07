import Job from '../models/Job.js';
import JobSeekerProfile from '../models/JobSeekerProfile.js';
import User from '../models/User.js';
import {
  calculateJobMatch,
  rankJobsForCandidate,
  rankCandidatesForJob,
} from '../services/matchingService.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * @route   GET /api/matches/recommendations
 * @desc    Fetch active jobs ranked by personalized match percentage for candidate
 * @access  Private (Candidate)
 */
export const getRecommendedJobs = asyncHandler(async (req, res) => {
  const candidateId = req.user._id;
  const { minScore = 30, limit = 12, page = 1 } = req.query;

  // Retrieve candidate profile
  const profile = await JobSeekerProfile.findOne({ user: candidateId });
  if (!profile) {
    throw new ApiError(404, 'Candidate profile not found. Please complete your profile to unlock AI recommendations.');
  }

  // Fetch all active platform vacancies
  const activeJobs = await Job.find({ status: 'Active' })
    .populate('recruiter', 'name company')
    .sort({ createdAt: -1 });

  // Rank active jobs using algorithmic multi-dimensional matcher
  const rankedJobs = rankJobsForCandidate(profile, activeJobs);

  // Apply minScore filter
  const minScoreNum = Number(minScore) || 0;
  const filteredJobs = rankedJobs.filter((j) => j.match.matchScore >= minScoreNum);

  // Pagination
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedRecommendations = filteredJobs.slice(startIndex, startIndex + limitNum);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        recommendations: paginatedRecommendations,
        total: filteredJobs.length,
        page: pageNum,
        totalPages: Math.ceil(filteredJobs.length / limitNum) || 1,
        candidateProfileSummary: {
          headline: profile.headline,
          location: profile.location,
          skillCount: profile.skills?.length || 0,
          skills: profile.skills,
        },
      },
      'Personalized job recommendations fetched successfully'
    )
  );
});

/**
 * @route   GET /api/matches/job/:jobId
 * @desc    Get detailed AI match compatibility report for a single job
 * @access  Private (Candidate)
 */
export const getJobMatchDetails = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const candidateId = req.user._id;

  const job = await Job.findById(jobId).populate('recruiter', 'name company');
  if (!job) {
    throw new ApiError(404, 'Job vacancy not found');
  }

  const profile = await JobSeekerProfile.findOne({ user: candidateId });
  if (!profile) {
    throw new ApiError(404, 'Candidate profile not found');
  }

  const match = calculateJobMatch(profile, job);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        jobId: job._id,
        jobTitle: job.title,
        company: job.company,
        match,
      },
      'Job match analysis generated successfully'
    )
  );
});

/**
 * @route   GET /api/matches/recruiter/job/:jobId/top-candidates
 * @desc    Get top platform candidates ranked by AI fit for a recruiter job vacancy
 * @access  Private (Recruiter)
 */
export const getTopCandidatesForJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const recruiterId = req.user._id;

  const job = await Job.findById(jobId);
  if (!job) {
    throw new ApiError(404, 'Job vacancy not found');
  }

  if (job.recruiter.toString() !== recruiterId.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You are not authorized to view candidates for this job');
  }

  // Retrieve candidate profiles that have skills listed
  const profiles = await JobSeekerProfile.find({
    skills: { $exists: true, $not: { $size: 0 } },
  }).populate('user', 'name email avatar role');

  const candidatesWithProfiles = profiles
    .filter((p) => p.user) // Ensure user ref exists
    .map((p) => ({
      candidate: p.user,
      profile: p,
    }));

  const rankedCandidates = rankCandidatesForJob(candidatesWithProfiles, job);

  // Return top 15 matches
  const topMatches = rankedCandidates.slice(0, 15);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        jobTitle: job.title,
        jobSkills: job.skills,
        totalEvaluated: candidatesWithProfiles.length,
        candidates: topMatches,
      },
      'Top candidate recommendations fetched successfully'
    )
  );
});
