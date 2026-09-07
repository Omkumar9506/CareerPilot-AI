import Interview from '../models/Interview.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import Application from '../models/Application.js';
import {
  sendInterviewInvitationEmail,
  sendInterviewStatusUpdateEmail,
} from '../services/emailService.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * @route   POST /api/interviews/schedule
 * @desc    Schedule an interview with a candidate for a specific job & send email notification
 * @access  Private (Recruiter / Admin)
 */
export const scheduleInterview = asyncHandler(async (req, res) => {
  const recruiterId = req.user._id;
  const {
    candidateId,
    jobId,
    applicationId,
    date,
    time,
    meetingLink,
    notes = '',
  } = req.body;

  // Validation
  if (!candidateId) throw new ApiError(400, 'Candidate ID is required');
  if (!jobId) throw new ApiError(400, 'Job ID is required');
  if (!date) throw new ApiError(400, 'Interview date is required');
  if (!time || !time.trim()) throw new ApiError(400, 'Interview time is required');
  if (!meetingLink || !meetingLink.trim()) {
    throw new ApiError(400, 'Meeting link is required');
  }

  // Validate candidate
  const candidate = await User.findById(candidateId).select('name email role');
  if (!candidate) {
    throw new ApiError(404, 'Candidate not found');
  }

  // Validate job (must belong to this recruiter unless admin)
  const jobQuery = { _id: jobId };
  if (req.user.role !== 'admin') {
    jobQuery.recruiter = recruiterId;
  }
  const job = await Job.findOne(jobQuery);
  if (!job) {
    throw new ApiError(404, 'Job vacancy not found or unauthorized to manage');
  }

  // Find or verify application
  let application = null;
  if (applicationId) {
    application = await Application.findById(applicationId);
  } else {
    application = await Application.findOne({ job: jobId, candidate: candidateId });
  }

  // Parse date
  const interviewDate = new Date(date);
  if (isNaN(interviewDate.getTime())) {
    throw new ApiError(400, 'Invalid date format');
  }

  // Create Interview document
  const interview = await Interview.create({
    candidate: candidateId,
    recruiter: recruiterId,
    job: jobId,
    application: application ? application._id : null,
    date: interviewDate,
    time: time.trim(),
    meetingLink: meetingLink.trim(),
    notes: notes.trim(),
    status: 'Scheduled',
  });

  // Automatically synchronize Application status to 'Interview'
  if (application && application.status !== 'Interview' && application.status !== 'Selected') {
    application.status = 'Interview';
    await application.save();
  }

  // Send Email Notification using Nodemailer
  const emailResult = await sendInterviewInvitationEmail({
    candidateEmail: candidate.email,
    candidateName: candidate.name,
    recruiterName: req.user.name,
    companyName: job.company,
    jobTitle: job.title,
    date: interviewDate,
    time: time.trim(),
    meetingLink: meetingLink.trim(),
    notes: notes.trim(),
  });

  if (emailResult.success) {
    interview.emailNotificationSent = true;
    interview.emailNotificationTimestamp = new Date();
    await interview.save();
  }

  const populatedInterview = await Interview.findById(interview._id)
    .populate('candidate', 'name email avatar')
    .populate('recruiter', 'name email')
    .populate('job', 'title company location workplaceType')
    .populate('application', 'status appliedAt');

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        interview: populatedInterview,
        emailStatus: emailResult,
      },
      'Interview scheduled successfully and invitation email dispatched'
    )
  );
});

/**
 * @route   GET /api/interviews/recruiter
 * @desc    Get all scheduled interviews for the current recruiter
 * @access  Private (Recruiter / Admin)
 */
export const getRecruiterInterviews = asyncHandler(async (req, res) => {
  const recruiterId = req.user._id;
  const { status, timeframe, jobId } = req.query;

  const query = {};
  if (req.user.role !== 'admin') {
    query.recruiter = recruiterId;
  }

  if (status && status !== 'All') {
    query.status = status;
  }

  if (jobId) {
    query.job = jobId;
  }

  const now = new Date();
  if (timeframe === 'upcoming') {
    query.date = { $gte: new Date(now.setHours(0, 0, 0, 0)) };
    query.status = { $in: ['Scheduled', 'Rescheduled'] };
  } else if (timeframe === 'past') {
    query.$or = [
      { date: { $lt: new Date(now.setHours(0, 0, 0, 0)) } },
      { status: { $in: ['Completed', 'Cancelled'] } },
    ];
  }

  const interviews = await Interview.find(query)
    .populate('candidate', 'name email avatar')
    .populate('job', 'title company location workplaceType')
    .populate('application', 'status appliedAt')
    .sort({ date: 1, time: 1 });

  // Compute summary stats for recruiter
  const allRecruiterInterviews = await Interview.find({ recruiter: recruiterId });
  const stats = {
    total: allRecruiterInterviews.length,
    scheduled: allRecruiterInterviews.filter((i) => i.status === 'Scheduled').length,
    completed: allRecruiterInterviews.filter((i) => i.status === 'Completed').length,
    cancelled: allRecruiterInterviews.filter((i) => i.status === 'Cancelled').length,
    rescheduled: allRecruiterInterviews.filter((i) => i.status === 'Rescheduled').length,
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        count: interviews.length,
        stats,
        interviews,
      },
      'Recruiter interviews retrieved successfully'
    )
  );
});

/**
 * @route   GET /api/interviews/candidate
 * @desc    Get all scheduled interviews for the current logged-in candidate
 * @access  Private (Candidate / Admin)
 */
export const getCandidateInterviews = asyncHandler(async (req, res) => {
  const candidateId = req.user._id;
  const { timeframe } = req.query;

  const query = { candidate: candidateId };

  const now = new Date();
  if (timeframe === 'upcoming') {
    query.date = { $gte: new Date(now.setHours(0, 0, 0, 0)) };
    query.status = { $in: ['Scheduled', 'Rescheduled'] };
  } else if (timeframe === 'past') {
    query.$or = [
      { date: { $lt: new Date(now.setHours(0, 0, 0, 0)) } },
      { status: { $in: ['Completed', 'Cancelled'] } },
    ];
  }

  const interviews = await Interview.find(query)
    .populate('recruiter', 'name email')
    .populate('job', 'title company location workplaceType salary')
    .populate('application', 'status appliedAt')
    .sort({ date: 1, time: 1 });

  const allInterviews = await Interview.find({ candidate: candidateId });
  const stats = {
    total: allInterviews.length,
    upcoming: allInterviews.filter(
      (i) =>
        ['Scheduled', 'Rescheduled'].includes(i.status) &&
        new Date(i.date) >= new Date(now.setHours(0, 0, 0, 0))
    ).length,
    completed: allInterviews.filter((i) => i.status === 'Completed').length,
    cancelled: allInterviews.filter((i) => i.status === 'Cancelled').length,
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        count: interviews.length,
        stats,
        interviews,
      },
      'Candidate interviews retrieved successfully'
    )
  );
});

/**
 * @route   PATCH /api/interviews/scheduled/:id
 * @desc    Update interview status, schedule time, link, or cancellation notes
 * @access  Private (Recruiter / Admin)
 */
export const updateInterviewStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, cancellationReason, date, time, meetingLink, notes } = req.body;

  const interview = await Interview.findById(id)
    .populate('candidate', 'name email')
    .populate('job', 'title company');

  if (!interview) {
    throw new ApiError(404, 'Interview record not found');
  }

  // Authorization check
  if (
    req.user.role !== 'admin' &&
    interview.recruiter.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, 'Unauthorized to modify this interview');
  }

  const previousStatus = interview.status;

  if (status) {
    const validStatuses = ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'];
    if (!validStatuses.includes(status)) {
      throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
    interview.status = status;
  }

  if (date) {
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime())) {
      interview.date = parsedDate;
    }
  }

  if (time && time.trim()) interview.time = time.trim();
  if (meetingLink && meetingLink.trim()) interview.meetingLink = meetingLink.trim();
  if (notes !== undefined) interview.notes = notes.trim();
  if (cancellationReason !== undefined) interview.cancellationReason = cancellationReason.trim();

  await interview.save();

  // If status changed to Cancelled or Rescheduled, send email notification
  if (
    (interview.status === 'Cancelled' || interview.status === 'Rescheduled') &&
    interview.status !== previousStatus
  ) {
    await sendInterviewStatusUpdateEmail({
      candidateEmail: interview.candidate.email,
      candidateName: interview.candidate.name,
      recruiterName: req.user.name,
      companyName: interview.job?.company,
      jobTitle: interview.job?.title,
      status: interview.status,
      reason: cancellationReason || notes,
      date: interview.date,
      time: interview.time,
      meetingLink: interview.meetingLink,
    });
  }

  const updatedInterview = await Interview.findById(id)
    .populate('candidate', 'name email avatar')
    .populate('job', 'title company location workplaceType')
    .populate('recruiter', 'name email');

  return res.status(200).json(
    new ApiResponse(200, { interview: updatedInterview }, `Interview marked as ${interview.status}`)
  );
});

/**
 * @route   GET /api/interviews/scheduled/:id
 * @desc    Get single scheduled interview details
 * @access  Private (Candidate / Recruiter / Admin)
 */
export const getInterviewById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const interview = await Interview.findById(id)
    .populate('candidate', 'name email avatar')
    .populate('recruiter', 'name email')
    .populate('job', 'title company location workplaceType description')
    .populate('application', 'status appliedAt coverLetter resume');

  if (!interview) {
    throw new ApiError(404, 'Interview not found');
  }

  // Must be candidate, recruiter, or admin
  const isCandidate = interview.candidate?._id?.toString() === req.user._id.toString();
  const isRecruiter = interview.recruiter?._id?.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isCandidate && !isRecruiter && !isAdmin) {
    throw new ApiError(403, 'Unauthorized to view this interview');
  }

  return res.status(200).json(
    new ApiResponse(200, { interview }, 'Interview retrieved successfully')
  );
});
