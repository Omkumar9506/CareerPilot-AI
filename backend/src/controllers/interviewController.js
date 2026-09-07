import InterviewSession from '../models/InterviewSession.js';
import Job from '../models/Job.js';
import JobSeekerProfile from '../models/JobSeekerProfile.js';
import {
  generateQuestions,
  evaluateAnswer,
  calculateSessionScorecard,
} from '../services/interviewService.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * @route   POST /api/interviews/start
 * @desc    Start a new AI mock interview session with dynamically generated questions
 * @access  Private (Candidate)
 */
export const startInterviewSession = asyncHandler(async (req, res) => {
  const candidateId = req.user._id;
  const {
    roleTitle,
    category = 'Mixed',
    difficulty = 'Mid-Level',
    targetCompany = '',
    targetJobId = null,
    questionCount = 4,
  } = req.body;

  if (!roleTitle || !roleTitle.trim()) {
    throw new ApiError(400, 'Please provide a role title for the interview simulation (e.g. Full Stack Developer)');
  }

  // Fetch candidate profile for customized context
  const profile = await JobSeekerProfile.findOne({ user: candidateId });
  const candidateSkills = (profile?.skills || []).map((s) => (typeof s === 'string' ? s : s.name || ''));

  // Load target vacancy details if specified
  let jobDetails = null;
  if (targetJobId) {
    jobDetails = await Job.findById(targetJobId);
  }

  // Generate customized questions
  const questions = await generateQuestions({
    roleTitle: roleTitle.trim(),
    category,
    difficulty,
    targetCompany: targetCompany.trim(),
    candidateSkills,
    jobDetails,
    count: Math.min(6, Math.max(2, parseInt(questionCount, 10) || 4)),
  });

  if (!questions || questions.length === 0) {
    throw new ApiError(500, 'Unable to generate interview questions. Please try again.');
  }

  // Create session in database
  const session = await InterviewSession.create({
    user: candidateId,
    roleTitle: roleTitle.trim(),
    category,
    difficulty,
    targetCompany: targetCompany.trim(),
    targetJob: targetJobId || null,
    status: 'In Progress',
    questions: questions.map((q) => ({
      questionText: q.questionText,
      category: q.category,
      expectedKeyPoints: q.expectedKeyPoints,
      candidateAnswer: '',
      score: 0,
      feedback: '',
      strengths: [],
      improvements: [],
      idealAnswerSummary: '',
    })),
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      { session },
      'Mock interview session initialized successfully'
    )
  );
});

/**
 * @route   GET /api/interviews/session/:id
 * @desc    Get session details by ID
 * @access  Private (Candidate)
 */
export const getInterviewSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const candidateId = req.user._id;

  const session = await InterviewSession.findOne({ _id: id, user: candidateId })
    .populate('targetJob', 'title company location');

  if (!session) {
    throw new ApiError(404, 'Interview session not found');
  }

  return res.status(200).json(
    new ApiResponse(200, { session }, 'Interview session retrieved successfully')
  );
});

/**
 * @route   POST /api/interviews/session/:id/answer
 * @desc    Submit answer to a specific question and receive instant AI evaluation
 * @access  Private (Candidate)
 */
export const submitAnswer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { questionIndex, candidateAnswer } = req.body;
  const candidateId = req.user._id;

  if (typeof questionIndex !== 'number' || questionIndex < 0) {
    throw new ApiError(400, 'Valid questionIndex is required');
  }

  if (!candidateAnswer || !candidateAnswer.trim()) {
    throw new ApiError(400, 'Please provide an answer before submitting for evaluation');
  }

  const session = await InterviewSession.findOne({ _id: id, user: candidateId });
  if (!session) {
    throw new ApiError(404, 'Interview session not found');
  }

  if (session.status === 'Completed') {
    throw new ApiError(400, 'This interview session is already completed');
  }

  const question = session.questions[questionIndex];
  if (!question) {
    throw new ApiError(404, `Question at index ${questionIndex} does not exist`);
  }

  // Evaluate candidate answer with Gemini
  const evaluation = await evaluateAnswer({
    questionText: question.questionText,
    candidateAnswer: candidateAnswer.trim(),
    roleTitle: session.roleTitle,
    difficulty: session.difficulty,
    category: question.category,
    expectedKeyPoints: question.expectedKeyPoints,
  });

  // Update question subdocument
  question.candidateAnswer = candidateAnswer.trim();
  question.score = evaluation.score;
  question.feedback = evaluation.feedback;
  question.strengths = evaluation.strengths;
  question.improvements = evaluation.improvements;
  question.idealAnswerSummary = evaluation.idealAnswerSummary;
  question.answeredAt = new Date();

  await session.save();

  const isLastQuestion = questionIndex === session.questions.length - 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        questionIndex,
        question,
        isLastQuestion,
      },
      'Question evaluated successfully'
    )
  );
});

/**
 * @route   POST /api/interviews/session/:id/complete
 * @desc    Finalize interview session, generate composite scorecard & metrics
 * @access  Private (Candidate)
 */
export const completeSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const candidateId = req.user._id;

  const session = await InterviewSession.findOne({ _id: id, user: candidateId });
  if (!session) {
    throw new ApiError(404, 'Interview session not found');
  }

  // Compute scorecard
  const scorecard = calculateSessionScorecard(session);

  session.status = 'Completed';
  session.overallScore = scorecard.overallScore;
  session.metrics = scorecard.metrics;
  session.feedbackSummary = scorecard.feedbackSummary;
  session.strengths = scorecard.strengths;
  session.weaknesses = scorecard.weaknesses;
  session.recommendations = scorecard.recommendations;

  await session.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { session },
      'Interview session completed and evaluated successfully'
    )
  );
});

/**
 * @route   GET /api/interviews/history
 * @desc    Get candidate's past mock interview sessions
 * @access  Private (Candidate)
 */
export const getMyInterviewHistory = asyncHandler(async (req, res) => {
  const candidateId = req.user._id;

  const history = await InterviewSession.find({ user: candidateId })
    .select('roleTitle category difficulty status overallScore metrics createdAt')
    .sort({ createdAt: -1 })
    .limit(20);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        total: history.length,
        history,
      },
      'Interview history fetched successfully'
    )
  );
});
