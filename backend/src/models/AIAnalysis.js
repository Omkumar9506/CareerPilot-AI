import mongoose from 'mongoose';

const aiAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    resume: {
      type: String,
      default: '',
    },
    targetJob: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      default: null,
    },
    atsScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    matchScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    matchedSkills: {
      type: [String],
      default: [],
    },
    missingSkills: {
      type: [String],
      default: [],
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
    experienceRelevance: {
      type: Number,
      default: 75,
      min: 0,
      max: 100,
    },
    keywordOptimization: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

aiAnalysisSchema.index({ user: 1, createdAt: -1 });

const AIAnalysis = mongoose.model('AIAnalysis', aiAnalysisSchema);

export default AIAnalysis;
