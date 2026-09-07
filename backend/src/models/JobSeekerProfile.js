import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema(
  {
    institution: {
      type: String,
      required: [true, 'Institution name is required'],
      trim: true,
    },
    degree: {
      type: String,
      required: [true, 'Degree or certificate is required'],
      trim: true,
    },
    fieldOfStudy: {
      type: String,
      trim: true,
    },
    startDate: Date,
    endDate: Date,
    current: {
      type: Boolean,
      default: false,
    },
    description: String,
  },
  { _id: true }
);

const experienceSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    position: {
      type: String,
      required: [true, 'Position title is required'],
      trim: true,
    },
    location: String,
    startDate: Date,
    endDate: Date,
    current: {
      type: Boolean,
      default: false,
    },
    description: String,
  },
  { _id: true }
);

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    description: String,
    link: String,
    github: String,
    technologies: [String],
  },
  { _id: true }
);

const certificationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Certification name is required'],
      trim: true,
    },
    issuer: String,
    issueDate: Date,
    credentialUrl: String,
  },
  { _id: true }
);

const jobSeekerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    headline: {
      type: String,
      trim: true,
      maxlength: [120, 'Headline cannot exceed 120 characters'],
      default: '',
    },
    bio: {
      type: String,
      maxlength: [2000, 'Bio cannot exceed 2000 characters'],
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
      index: true,
    },
    education: {
      type: [educationSchema],
      default: [],
    },
    experience: {
      type: [experienceSchema],
      default: [],
    },
    projects: {
      type: [projectSchema],
      default: [],
    },
    certifications: {
      type: [certificationSchema],
      default: [],
    },
    resume: {
      type: String,
      default: '',
    },
    portfolio: {
      type: String,
      default: '',
    },
    github: {
      type: String,
      default: '',
    },
    linkedin: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Text index for skill and keyword searching
jobSeekerProfileSchema.index({ skills: 'text', headline: 'text' });

const JobSeekerProfile = mongoose.model('JobSeekerProfile', jobSeekerProfileSchema);

export default JobSeekerProfile;
