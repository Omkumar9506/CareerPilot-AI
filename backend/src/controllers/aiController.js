import AIAnalysis from '../models/AIAnalysis.js';
import Job from '../models/Job.js';
import JobSeekerProfile from '../models/JobSeekerProfile.js';
import { analyzeResumeWithGemini } from '../services/geminiService.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * @desc    Analyze resume content against target job or industry standards
 * @route   POST /api/ai/analyze-resume
 * @access  Private (Candidate)
 */
export const analyzeResume = asyncHandler(async (req, res) => {
  const { resumeText, jobId } = req.body;

  let contentToAnalyze = resumeText?.trim();
  let resumeReference = '';

  // If explicit text not provided, inspect candidate profile
  if (!contentToAnalyze) {
    const profile = await JobSeekerProfile.findOne({ user: req.user._id });
    if (!profile) {
      throw new ApiError(400, 'No resume text provided and no candidate profile found. Please provide resume text or complete your profile.');
    }

    resumeReference = profile.resume || '';

    // Construct comprehensive profile text if raw resume file text cannot be extracted
    const profileParts = [];
    if (profile.title) profileParts.push(`Professional Title: ${profile.title}`);
    if (profile.summary) profileParts.push(`Summary: ${profile.summary}`);
    if (profile.skills && profile.skills.length > 0) {
      profileParts.push(`Skills: ${profile.skills.join(', ')}`);
    }
    if (profile.experience && profile.experience.length > 0) {
      profileParts.push(
        `Experience:\n` +
          profile.experience
            .map((e) => `- ${e.title} at ${e.company} (${e.startDate ? new Date(e.startDate).getFullYear() : ''} - ${e.current ? 'Present' : e.endDate ? new Date(e.endDate).getFullYear() : ''}): ${e.description || ''}`)
            .join('\n')
      );
    }
    if (profile.education && profile.education.length > 0) {
      profileParts.push(
        `Education:\n` +
          profile.education
            .map((ed) => `- ${ed.degree} in ${ed.fieldOfStudy} from ${ed.institution}`)
            .join('\n')
      );
    }

    contentToAnalyze = profileParts.join('\n\n');

    if (!contentToAnalyze.trim()) {
      throw new ApiError(400, 'Your profile does not contain enough text for analysis. Please paste your resume text or update your profile details.');
    }
  }

  // Load target job if specified
  let targetJob = null;
  if (jobId) {
    targetJob = await Job.findById(jobId).select('title company location skills description requirements');
    if (!targetJob) {
      throw new ApiError(404, 'Specified target job not found');
    }
  }

  // Run AI / Heuristic Analysis
  const analysisResult = await analyzeResumeWithGemini(contentToAnalyze, targetJob);

  // Save to database
  const analysis = await AIAnalysis.create({
    user: req.user._id,
    resume: resumeReference || 'Text submission',
    targetJob: targetJob ? targetJob._id : null,
    atsScore: analysisResult.atsScore,
    matchScore: analysisResult.matchScore,
    matchedSkills: analysisResult.matchedSkills,
    missingSkills: analysisResult.missingSkills,
    strengths: analysisResult.strengths,
    weaknesses: analysisResult.weaknesses,
    recommendations: analysisResult.recommendations,
    experienceRelevance: analysisResult.experienceRelevance,
    keywordOptimization: analysisResult.keywordOptimization,
  });

  const populatedAnalysis = await AIAnalysis.findById(analysis._id).populate('targetJob', 'title company location');

  res.status(201).json(new ApiResponse(201, populatedAnalysis, 'Resume analyzed successfully'));
});

/**
 * @desc    Get all resume analyses for logged-in user
 * @route   GET /api/ai/analyses
 * @access  Private (Candidate)
 */
export const getMyAnalyses = asyncHandler(async (req, res) => {
  const analyses = await AIAnalysis.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate('targetJob', 'title company location')
    .limit(20);

  res.status(200).json(new ApiResponse(200, analyses, 'Retrieved previous resume analyses'));
});

/**
 * @desc    Get single resume analysis by ID
 * @route   GET /api/ai/analyses/:id
 * @access  Private (Candidate)
 */
export const getAnalysisById = asyncHandler(async (req, res) => {
  const analysis = await AIAnalysis.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).populate('targetJob', 'title company location');

  if (!analysis) {
    throw new ApiError(404, 'Analysis report not found');
  }

  res.status(200).json(new ApiResponse(200, analysis, 'Analysis report retrieved successfully'));
});
