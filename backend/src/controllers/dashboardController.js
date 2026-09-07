import User from '../models/User.js';
import JobSeekerProfile from '../models/JobSeekerProfile.js';
import Application from '../models/Application.js';
import SavedJob from '../models/SavedJob.js';
import Interview from '../models/Interview.js';
import AIAnalysis from '../models/AIAnalysis.js';
import Job from '../models/Job.js';
import CareerRoadmap from '../models/CareerRoadmap.js';
import { rankJobsForCandidate } from '../services/matchingService.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Calculate Profile Completion & identify missing items
 */
const calculateProfileCompletion = (user, profile) => {
  let score = 0;
  const missing = [];

  // Avatar / Photo (10%)
  if (user?.avatar) {
    score += 10;
  } else {
    missing.push({ field: 'avatar', label: 'Upload a professional profile photo', weight: 10 });
  }

  // Headline / Target Role (10%)
  if (profile?.headline && profile.headline.trim().length >= 3) {
    score += 10;
  } else {
    missing.push({ field: 'headline', label: 'Add a professional headline', weight: 10 });
  }

  // Bio / Summary (10%)
  if (profile?.bio && profile.bio.trim().length >= 20) {
    score += 10;
  } else {
    missing.push({ field: 'bio', label: 'Write a professional summary bio', weight: 10 });
  }

  // Skills (20%)
  const skillsCount = profile?.skills?.length || 0;
  if (skillsCount >= 3) {
    score += 20;
  } else if (skillsCount > 0) {
    score += 10;
    missing.push({ field: 'skills', label: 'Add at least 3 core technical skills', weight: 10 });
  } else {
    missing.push({ field: 'skills', label: 'Add your technical & soft skills', weight: 20 });
  }

  // Work Experience (15%)
  if (profile?.experience && profile.experience.length > 0) {
    score += 15;
  } else {
    missing.push({ field: 'experience', label: 'Add your work history or internships', weight: 15 });
  }

  // Education (15%)
  if (profile?.education && profile.education.length > 0) {
    score += 15;
  } else {
    missing.push({ field: 'education', label: 'Add your educational background', weight: 15 });
  }

  // Resume Document (10%)
  if (profile?.resume) {
    score += 10;
  } else {
    missing.push({ field: 'resume', label: 'Upload your PDF resume', weight: 10 });
  }

  // Contact / Location (10%)
  if (profile?.phone && profile?.location) {
    score += 10;
  } else if (profile?.phone || profile?.location) {
    score += 5;
    missing.push({ field: 'contact', label: 'Complete phone number and location', weight: 5 });
  } else {
    missing.push({ field: 'contact', label: 'Add contact phone and location', weight: 10 });
  }

  return {
    score: Math.min(100, score),
    missingItems: missing,
  };
};

/**
 * @route   GET /api/dashboard/candidate
 * @desc    Aggregate all candidate dashboard metrics (pipeline, interviews, saved jobs, ATS score, AI insights)
 * @access  Private (Candidate / Admin)
 */
export const getCandidateDashboard = asyncHandler(async (req, res) => {
  const candidateId = req.user._id;

  // 1. Fetch User & Profile
  const [user, profile] = await Promise.all([
    User.findById(candidateId).select('name email avatar role createdAt'),
    JobSeekerProfile.findOne({ user: candidateId }),
  ]);

  const profileCompletion = calculateProfileCompletion(user, profile);

  // 2. Applications Pipeline & Breakdown
  const applications = await Application.find({ candidate: candidateId })
    .populate('job', 'title company location workplaceType salary status')
    .sort({ appliedAt: -1 });

  const appStats = {
    total: applications.length,
    applied: applications.filter((a) => a.status === 'Applied').length,
    underReview: applications.filter((a) => a.status === 'Under Review').length,
    shortlisted: applications.filter((a) => a.status === 'Shortlisted').length,
    interview: applications.filter((a) => a.status === 'Interview').length,
    selected: applications.filter((a) => a.status === 'Selected').length,
    rejected: applications.filter((a) => a.status === 'Rejected').length,
  };

  const pipelineFunnel = [
    { stage: 'Applied', count: appStats.applied, color: '#38bdf8' },
    { stage: 'Under Review', count: appStats.underReview, color: '#818cf8' },
    { stage: 'Shortlisted', count: appStats.shortlisted, color: '#a855f7' },
    { stage: 'Interview', count: appStats.interview, color: '#06b6d4' },
    { stage: 'Selected', count: appStats.selected, color: '#10b981' },
    { stage: 'Rejected', count: appStats.rejected, color: '#f43f5e' },
  ];

  // 3. Saved Jobs
  const savedJobs = await SavedJob.find({ user: candidateId })
    .populate({
      path: 'job',
      select: 'title company location salary workplaceType experienceLevel status skillsRequired createdAt',
    })
    .sort({ createdAt: -1 });

  const validSavedJobs = savedJobs.filter((s) => s.job !== null);

  // 4. Upcoming Scheduled Interviews
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const upcomingInterviews = await Interview.find({
    candidate: candidateId,
    date: { $gte: todayStart },
    status: { $in: ['Scheduled', 'Rescheduled'] },
  })
    .populate('job', 'title company location workplaceType')
    .populate('recruiter', 'name email')
    .sort({ date: 1, time: 1 })
    .limit(3);

  // 5. Latest AI Resume ATS Analysis
  const latestAnalysis = await AIAnalysis.findOne({ user: candidateId })
    .populate('targetJob', 'title company')
    .sort({ createdAt: -1 });

  // 6. Latest Career Roadmap
  const latestRoadmap = await CareerRoadmap.findOne({ user: candidateId })
    .sort({ createdAt: -1 });

  // 7. AI Recommended Jobs
  let recommendedJobs = [];
  try {
    const activeJobs = await Job.find({ status: 'Active' })
      .populate('recruiter', 'name company')
      .limit(20);
    if (profile && activeJobs.length > 0) {
      const ranked = rankJobsForCandidate(profile, activeJobs);
      recommendedJobs = ranked.slice(0, 4);
    } else {
      recommendedJobs = activeJobs.slice(0, 4);
    }
  } catch (err) {
    console.error('Error fetching job recommendations for dashboard:', err.message);
  }

  // 8. Generate Contextual AI Career Insights
  const aiInsights = [];

  // Insight 1: Profile optimization
  if (profileCompletion.score < 80) {
    aiInsights.push({
      type: 'profile',
      priority: 'high',
      title: 'Boost Profile Visibility',
      description: `Your profile is ${profileCompletion.score}% complete. Profiles above 85% receive 3x more recruiter interview invites.`,
      actionLabel: 'Complete Profile',
      actionUrl: '/profile',
    });
  }

  // Insight 2: Interview preparation
  if (upcomingInterviews.length > 0) {
    const nextCall = upcomingInterviews[0];
    aiInsights.push({
      type: 'interview',
      priority: 'critical',
      title: `Upcoming Interview: ${nextCall.job?.title}`,
      description: `Scheduled for ${new Date(nextCall.date).toLocaleDateString()} at ${nextCall.time}. Practice technical questions with our AI Mock Interview tool.`,
      actionLabel: 'Start Practice Session',
      actionUrl: '/mock-interview',
    });
  }

  // Insight 3: Resume ATS feedback
  if (latestAnalysis) {
    if (latestAnalysis.atsScore >= 75) {
      aiInsights.push({
        type: 'resume',
        priority: 'medium',
        title: `Strong Resume ATS Score (${latestAnalysis.atsScore}/100)`,
        description: 'Your resume demonstrates high keyword alignment. Keep targeting jobs with matching tech stacks.',
        actionLabel: 'View Analysis',
        actionUrl: '/resume-analyzer',
      });
    } else {
      aiInsights.push({
        type: 'resume',
        priority: 'high',
        title: `Improve ATS Score (${latestAnalysis.atsScore}/100)`,
        description: `Consider injecting high-frequency keywords: ${(latestAnalysis.missingSkills || []).slice(0, 3).join(', ')}.`,
        actionLabel: 'Optimize Resume',
        actionUrl: '/resume-analyzer',
      });
    }
  } else {
    aiInsights.push({
      type: 'resume',
      priority: 'medium',
      title: 'Analyze Your Resume with AI',
      description: 'Run our Gemini ATS Analyzer to identify missing skills and benchmark against target roles.',
      actionLabel: 'Analyze Resume',
      actionUrl: '/resume-analyzer',
    });
  }

  // Insight 4: Skill Gaps & Roadmap
  if (latestRoadmap && latestRoadmap.skillGaps?.length > 0) {
    aiInsights.push({
      type: 'skill',
      priority: 'medium',
      title: `Target Skill Gaps: ${latestRoadmap.targetRole}`,
      description: `Focus on mastering: ${latestRoadmap.skillGaps.slice(0, 3).join(', ')} to unlock higher tier vacancies.`,
      actionLabel: 'View Skill Roadmap',
      actionUrl: '/roadmap',
    });
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user,
        profile: {
          headline: profile?.headline || '',
          location: profile?.location || '',
          skills: profile?.skills || [],
          hasResume: Boolean(profile?.resume),
        },
        profileCompletion,
        appStats,
        pipelineFunnel,
        recentApplications: applications.slice(0, 5),
        savedJobsCount: validSavedJobs.length,
        recentSavedJobs: validSavedJobs.slice(0, 4),
        upcomingInterviews,
        latestResumeAnalysis: latestAnalysis
          ? {
              atsScore: latestAnalysis.atsScore,
              matchScore: latestAnalysis.matchScore,
              matchedSkills: latestAnalysis.matchedSkills || [],
              missingSkills: latestAnalysis.missingSkills || [],
              analyzedAt: latestAnalysis.createdAt,
            }
          : null,
        skillGaps: latestRoadmap?.skillGaps || [],
        targetRole: latestRoadmap?.targetRole || profile?.headline || 'Software Engineer',
        recommendedJobs,
        aiInsights,
      },
      'Candidate dashboard data retrieved successfully'
    )
  );
});
