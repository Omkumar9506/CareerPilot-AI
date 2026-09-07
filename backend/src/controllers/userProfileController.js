import JobSeekerProfile from '../models/JobSeekerProfile.js';
import RecruiterProfile from '../models/RecruiterProfile.js';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * @route   GET /api/users/profile/me
 * @desc    Get current user's profile based on their role
 * @access  Private (Protected)
 */
export const getMyProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const role = req.user.role;

  let profile = null;

  if (role === 'candidate') {
    profile = await JobSeekerProfile.findOne({ user: userId });
    // If not found yet, create empty initial profile
    if (!profile) {
      profile = await JobSeekerProfile.create({ user: userId });
    }
  } else if (role === 'recruiter') {
    profile = await RecruiterProfile.findOne({ user: userId });
    if (!profile) {
      profile = await RecruiterProfile.create({
        user: userId,
        companyName: `${req.user.name}'s Company`,
      });
    }
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: req.user,
        profile,
      },
      'Profile fetched successfully'
    )
  );
});

/**
 * @route   PUT /api/users/profile/candidate
 * @desc    Update or create candidate profile
 * @access  Private (Candidate only)
 */
export const updateCandidateProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const {
    name,
    avatar,
    headline,
    bio,
    phone,
    location,
    skills,
    education,
    experience,
    projects,
    certifications,
    portfolio,
    github,
    linkedin,
  } = req.body;

  // Update base User fields if supplied
  if (name || avatar) {
    await User.findByIdAndUpdate(userId, {
      ...(name && { name }),
      ...(avatar && { avatar }),
    });
  }

  // Update or create JobSeekerProfile
  const profileFields = {
    headline: headline !== undefined ? headline : '',
    bio: bio !== undefined ? bio : '',
    phone: phone !== undefined ? phone : '',
    location: location !== undefined ? location : '',
    skills: Array.isArray(skills) ? skills.map((s) => s.trim()).filter(Boolean) : [],
    education: Array.isArray(education) ? education : [],
    experience: Array.isArray(experience) ? experience : [],
    projects: Array.isArray(projects) ? projects : [],
    certifications: Array.isArray(certifications) ? certifications : [],
    portfolio: portfolio !== undefined ? portfolio : '',
    github: github !== undefined ? github : '',
    linkedin: linkedin !== undefined ? linkedin : '',
  };

  const profile = await JobSeekerProfile.findOneAndUpdate(
    { user: userId },
    { $set: profileFields },
    { returnDocument: 'after', upsert: true, runValidators: true }
  );

  const updatedUser = await User.findById(userId);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: updatedUser,
        profile,
      },
      'Candidate profile updated successfully'
    )
  );
});

/**
 * @route   PUT /api/users/profile/recruiter
 * @desc    Update or create recruiter profile
 * @access  Private (Recruiter only)
 */
export const updateRecruiterProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const {
    name,
    avatar,
    companyName,
    companyLogo,
    description,
    website,
    location,
    industry,
    companySize,
  } = req.body;

  if (name || avatar) {
    await User.findByIdAndUpdate(userId, {
      ...(name && { name }),
      ...(avatar && { avatar }),
    });
  }

  const profileFields = {
    ...(companyName && { companyName }),
    ...(companyLogo !== undefined && { companyLogo }),
    ...(description !== undefined && { description }),
    ...(website !== undefined && { website }),
    ...(location !== undefined && { location }),
    ...(industry !== undefined && { industry }),
    ...(companySize !== undefined && { companySize }),
  };

  const profile = await RecruiterProfile.findOneAndUpdate(
    { user: userId },
    { $set: profileFields },
    { new: true, upsert: true, runValidators: true }
  );

  const updatedUser = await User.findById(userId);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: updatedUser,
        profile,
      },
      'Recruiter profile updated successfully'
    )
  );
});

/**
 * @route   GET /api/users/profile/candidate/:id
 * @desc    Get candidate profile by user ID
 * @access  Private (Recruiter or Admin)
 */
export const getCandidateProfileById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const candidate = await User.findById(id).select('-resetPasswordToken -resetPasswordExpire');
  if (!candidate || candidate.role !== 'candidate') {
    throw new ApiError(404, 'Candidate profile not found');
  }

  const profile = await JobSeekerProfile.findOne({ user: id });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: candidate,
        profile: profile || {},
      },
      'Candidate profile fetched successfully'
    )
  );
});

/**
 * @route   GET /api/users/profile/recruiter/:id
 * @desc    Get recruiter/company profile by user ID
 * @access  Public
 */
export const getRecruiterProfileById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const recruiter = await User.findById(id).select('name email avatar role');
  if (!recruiter || recruiter.role !== 'recruiter') {
    throw new ApiError(404, 'Recruiter company profile not found');
  }

  const profile = await RecruiterProfile.findOne({ user: id });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: recruiter,
        profile: profile || {},
      },
      'Recruiter company profile fetched successfully'
    )
  );
});
