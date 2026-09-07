import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, default: 'Article' }, // Documentation, Course, Project, Video
    url: { type: String, default: '' },
  },
  { _id: false }
);

const skillGapSchema = new mongoose.Schema(
  {
    skill: { type: String, required: true, trim: true },
    category: { type: String, default: 'Core Essential' },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'High',
    },
    status: {
      type: String,
      enum: ['Missing', 'In Progress', 'Completed'],
      default: 'Missing',
    },
  },
  { _id: true }
);

const milestoneSchema = new mongoose.Schema(
  {
    phase: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    timeframe: { type: String, default: 'Weeks 1-3' },
    description: { type: String, default: '' },
    skillsCovered: { type: [String], default: [] },
    recommendedProjects: { type: [String], default: [] },
    resources: { type: [resourceSchema], default: [] },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { _id: true }
);

const careerRoadmapSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetRole: {
      type: String,
      required: [true, 'Target role is required'],
      trim: true,
    },
    targetJob: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
    },
    currentSkills: {
      type: [String],
      default: [],
    },
    readinessScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    estimatedWeeks: {
      type: Number,
      default: 12,
    },
    skillGaps: {
      type: [skillGapSchema],
      default: [],
    },
    milestones: {
      type: [milestoneSchema],
      default: [],
    },
    aiSummary: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Archived'],
      default: 'Active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for finding candidate roadmaps
careerRoadmapSchema.index({ user: 1, createdAt: -1 });

const CareerRoadmap = mongoose.model('CareerRoadmap', careerRoadmapSchema);

export default CareerRoadmap;
