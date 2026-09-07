import CareerRoadmap from '../models/CareerRoadmap.js';
import Job from '../models/Job.js';
import JobSeekerProfile from '../models/JobSeekerProfile.js';
import {
  generateCareerRoadmap,
  recalculateRoadmapProgress,
} from '../services/roadmapService.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * @route   POST /api/roadmaps
 * @desc    Generate a personalized career roadmap & skill gap diagnosis
 * @access  Private (Candidate)
 */
export const createRoadmap = asyncHandler(async (req, res) => {
  const candidateId = req.user._id;
  const { targetRole, targetJobId } = req.body;

  if (!targetRole || !targetRole.trim()) {
    throw new ApiError(400, 'Please provide a target role (e.g. Senior Cloud Architect)');
  }

  const profile = await JobSeekerProfile.findOne({ user: candidateId });
  if (!profile) {
    throw new ApiError(404, 'Candidate profile not found. Please create your profile first.');
  }

  let targetJob = null;
  if (targetJobId) {
    targetJob = await Job.findById(targetJobId);
  }

  // Generate roadmap through dual engine
  const generatedData = await generateCareerRoadmap({
    candidateProfile: profile,
    targetRole: targetRole.trim(),
    targetJob,
  });

  const candidateSkills = (profile.skills || []).map((s) => (typeof s === 'string' ? s : s.name || ''));

  const roadmap = await CareerRoadmap.create({
    user: candidateId,
    targetRole: targetRole.trim(),
    targetJob: targetJobId || null,
    currentSkills: candidateSkills,
    readinessScore: generatedData.readinessScore,
    estimatedWeeks: generatedData.estimatedWeeks,
    skillGaps: generatedData.skillGaps,
    milestones: generatedData.milestones,
    aiSummary: generatedData.aiSummary,
    status: 'Active',
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      { roadmap },
      'Personalized career roadmap generated successfully'
    )
  );
});

/**
 * @route   GET /api/roadmaps
 * @desc    Retrieve all roadmaps for logged-in candidate
 * @access  Private (Candidate)
 */
export const getMyRoadmaps = asyncHandler(async (req, res) => {
  const candidateId = req.user._id;

  const roadmaps = await CareerRoadmap.find({ user: candidateId })
    .populate('targetJob', 'title company location')
    .sort({ updatedAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        total: roadmaps.length,
        roadmaps,
      },
      'Candidate roadmaps retrieved successfully'
    )
  );
});

/**
 * @route   GET /api/roadmaps/:id
 * @desc    Retrieve a single career roadmap with milestone details
 * @access  Private (Candidate)
 */
export const getRoadmapById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const candidateId = req.user._id;

  const roadmap = await CareerRoadmap.findOne({ _id: id, user: candidateId })
    .populate('targetJob', 'title company location salary workplaceType');

  if (!roadmap) {
    throw new ApiError(404, 'Career roadmap not found');
  }

  return res.status(200).json(
    new ApiResponse(200, { roadmap }, 'Roadmap retrieved successfully')
  );
});

/**
 * @route   PATCH /api/roadmaps/:id/milestones/:milestoneIndex
 * @desc    Toggle completion of a roadmap milestone and recalculate readiness score
 * @access  Private (Candidate)
 */
export const toggleMilestone = asyncHandler(async (req, res) => {
  const { id, milestoneIndex } = req.params;
  const { completed } = req.body;
  const candidateId = req.user._id;

  const idx = parseInt(milestoneIndex, 10);
  if (isNaN(idx) || idx < 0) {
    throw new ApiError(400, 'Invalid milestone index');
  }

  const roadmap = await CareerRoadmap.findOne({ _id: id, user: candidateId });
  if (!roadmap) {
    throw new ApiError(404, 'Career roadmap not found');
  }

  const milestone = roadmap.milestones[idx];
  if (!milestone) {
    throw new ApiError(404, `Milestone at index ${idx} not found`);
  }

  const isCompleted = typeof completed === 'boolean' ? completed : !milestone.completed;
  milestone.completed = isCompleted;
  milestone.completedAt = isCompleted ? new Date() : null;

  // Mark associated skill gaps as In Progress or Completed
  if (milestone.skillsCovered && milestone.skillsCovered.length > 0) {
    roadmap.skillGaps.forEach((sg) => {
      if (milestone.skillsCovered.includes(sg.skill)) {
        sg.status = isCompleted ? 'Completed' : 'Missing';
      }
    });
  }

  // Recalculate dynamic readiness score
  roadmap.readinessScore = recalculateRoadmapProgress(roadmap);

  // Check if all milestones are complete
  const allComplete = roadmap.milestones.every((m) => m.completed);
  if (allComplete) {
    roadmap.status = 'Completed';
  } else if (roadmap.status === 'Completed') {
    roadmap.status = 'Active';
  }

  await roadmap.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        roadmap,
        milestoneIndex: idx,
        isCompleted,
        newReadinessScore: roadmap.readinessScore,
      },
      `Milestone marked as ${isCompleted ? 'completed' : 'pending'}`
    )
  );
});

/**
 * @route   POST /api/roadmaps/:id/sync-skills
 * @desc    Sync newly mastered skills from roadmap directly into JobSeekerProfile
 * @access  Private (Candidate)
 */
export const syncSkillsToProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const candidateId = req.user._id;

  const roadmap = await CareerRoadmap.findOne({ _id: id, user: candidateId });
  if (!roadmap) {
    throw new ApiError(404, 'Career roadmap not found');
  }

  const profile = await JobSeekerProfile.findOne({ user: candidateId });
  if (!profile) {
    throw new ApiError(404, 'Candidate profile not found');
  }

  // Collect skills from completed milestones or skills marked Completed
  const completedSkills = [];
  roadmap.milestones.forEach((m) => {
    if (m.completed && m.skillsCovered) {
      completedSkills.push(...m.skillsCovered);
    }
  });

  roadmap.skillGaps.forEach((sg) => {
    if (sg.status === 'Completed') {
      completedSkills.push(sg.skill);
    }
  });

  const uniqueCompleted = Array.from(new Set(completedSkills));

  // Merge into candidate profile skills
  const existingSkills = (profile.skills || []).map((s) => (typeof s === 'string' ? s : s.name || ''));
  const newSkillsToAdd = uniqueCompleted.filter(
    (skill) => !existingSkills.some((es) => es.toLowerCase() === skill.toLowerCase())
  );

  if (newSkillsToAdd.length > 0) {
    profile.skills.push(...newSkillsToAdd);
    await profile.save();
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        syncedCount: newSkillsToAdd.length,
        newSkillsAdded: newSkillsToAdd,
        allProfileSkills: profile.skills,
      },
      `Successfully synced ${newSkillsToAdd.length} skills to your candidate profile`
    )
  );
});

/**
 * @route   DELETE /api/roadmaps/:id
 * @desc    Delete or archive a roadmap
 * @access  Private (Candidate)
 */
export const deleteRoadmap = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const candidateId = req.user._id;

  const roadmap = await CareerRoadmap.findOneAndDelete({ _id: id, user: candidateId });
  if (!roadmap) {
    throw new ApiError(404, 'Roadmap not found');
  }

  return res.status(200).json(
    new ApiResponse(200, null, 'Roadmap deleted successfully')
  );
});
