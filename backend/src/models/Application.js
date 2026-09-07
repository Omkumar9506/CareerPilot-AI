import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
      index: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Candidate reference is required'],
      index: true,
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recruiter reference is required'],
      index: true,
    },
    resume: {
      type: String,
      default: '',
    },
    coverLetter: {
      type: String,
      maxlength: [4000, 'Cover letter cannot exceed 4000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: [
          'Applied',
          'Under Review',
          'Shortlisted',
          'Interview',
          'Selected',
          'Rejected',
        ],
        message: '{VALUE} is not a valid application status',
      },
      default: 'Applied',
      index: true,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications for the same job by the same candidate
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

// Compound indexes for querying recruiter applicants and candidate tracker
applicationSchema.index({ recruiter: 1, status: 1, createdAt: -1 });
applicationSchema.index({ candidate: 1, createdAt: -1 });

const Application = mongoose.model('Application', applicationSchema);

export default Application;
