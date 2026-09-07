import mongoose from 'mongoose';

const interviewQuestionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Technical', 'Behavioral', 'System Design', 'General'],
      default: 'Technical',
    },
    expectedKeyPoints: {
      type: [String],
      default: [],
    },
    candidateAnswer: {
      type: String,
      default: '',
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    feedback: {
      type: String,
      default: '',
    },
    strengths: {
      type: [String],
      default: [],
    },
    improvements: {
      type: [String],
      default: [],
    },
    idealAnswerSummary: {
      type: String,
      default: '',
    },
    answeredAt: {
      type: Date,
    },
  },
  { _id: true }
);

const interviewSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    roleTitle: {
      type: String,
      required: [true, 'Role title is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Technical', 'Behavioral', 'System Design', 'Mixed'],
      default: 'Mixed',
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['Entry', 'Mid-Level', 'Senior', 'Lead'],
      default: 'Mid-Level',
    },
    targetCompany: {
      type: String,
      trim: true,
      default: '',
    },
    targetJob: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
    },
    status: {
      type: String,
      enum: ['In Progress', 'Completed', 'Abandoned'],
      default: 'In Progress',
      index: true,
    },
    questions: {
      type: [interviewQuestionSchema],
      default: [],
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    metrics: {
      technicalAccuracy: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
      clarity: { type: Number, default: 0 },
      depth: { type: Number, default: 0 },
    },
    feedbackSummary: {
      type: String,
      default: '',
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    recommendations: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying a candidate's recent sessions
interviewSessionSchema.index({ user: 1, createdAt: -1 });

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);

export default InterviewSession;
