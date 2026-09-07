import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recruiter ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [150, 'Job title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Job location is required'],
      trim: true,
    },
    employmentType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
      default: 'Full-time',
      index: true,
    },
    experienceLevel: {
      type: String,
      enum: ['Entry', 'Mid-Level', 'Senior', 'Lead', 'Executive'],
      default: 'Mid-Level',
      index: true,
    },
    workplaceType: {
      type: String,
      enum: ['Remote', 'On-site', 'Hybrid'],
      default: 'Remote',
      index: true,
    },
    salary: {
      min: {
        type: Number,
        default: 0,
      },
      max: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: 'USD',
      },
      isNegotiable: {
        type: Boolean,
        default: false,
      },
    },
    skills: {
      type: [String],
      default: [],
      index: true,
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    requirements: {
      type: [String],
      default: [],
    },
    deadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Active', 'Closed', 'Draft'],
      default: 'Active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for search matching
jobSchema.index(
  {
    title: 'text',
    company: 'text',
    skills: 'text',
    description: 'text',
  },
  {
    weights: {
      title: 10,
      skills: 8,
      company: 5,
      description: 2,
    },
    name: 'JobSearchTextIndex',
  }
);

// Compound query index for fast filter retrieval
jobSchema.index({ status: 1, workplaceType: 1, createdAt: -1 });
jobSchema.index({ status: 1, employmentType: 1, createdAt: -1 });
jobSchema.index({ status: 1, experienceLevel: 1, createdAt: -1 });

const Job = mongoose.model('Job', jobSchema);

export default Job;
