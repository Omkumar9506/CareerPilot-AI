import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema(
  {
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
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
      index: true,
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      index: true,
      default: null,
    },
    date: {
      type: Date,
      required: [true, 'Interview date is required'],
      index: true,
    },
    time: {
      type: String,
      required: [true, 'Interview time is required (e.g. 10:30 AM or 14:00)'],
      trim: true,
    },
    meetingLink: {
      type: String,
      required: [true, 'Meeting link is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
        message: '{VALUE} is not a valid interview status',
      },
      default: 'Scheduled',
      index: true,
    },
    notes: {
      type: String,
      default: '',
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    },
    cancellationReason: {
      type: String,
      default: '',
      maxlength: [500, 'Cancellation reason cannot exceed 500 characters'],
    },
    emailNotificationSent: {
      type: Boolean,
      default: false,
    },
    emailNotificationTimestamp: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for querying upcoming recruiter and candidate interviews
interviewSchema.index({ recruiter: 1, date: 1, status: 1 });
interviewSchema.index({ candidate: 1, date: 1, status: 1 });
interviewSchema.index({ job: 1, candidate: 1 });

const Interview = mongoose.model('Interview', interviewSchema);

export default Interview;
