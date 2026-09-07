import JobSeekerProfile from '../models/JobSeekerProfile.js';
import { uploadFile } from '../services/cloudinaryService.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * @route   POST /api/resumes/upload
 * @desc    Upload or replace candidate resume
 * @access  Private (Candidate only)
 */
export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Please select a valid PDF, DOC, or DOCX resume to upload');
  }

  const userId = req.user._id;

  // Stream upload via Cloudinary or local disk
  const uploadResult = await uploadFile(
    req.file.buffer,
    req.file.originalname,
    req.file.mimetype
  );

  // Update candidate profile with new resume URL
  const profile = await JobSeekerProfile.findOneAndUpdate(
    { user: userId },
    { $set: { resume: uploadResult.url } },
    { new: true, upsert: true }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        resumeUrl: uploadResult.url,
        fileName: req.file.originalname,
        fileSize: `${(req.file.size / 1024).toFixed(1)} KB`,
        storageType: uploadResult.storageType,
        profile,
      },
      'Resume uploaded and saved to profile successfully'
    )
  );
});

/**
 * @route   GET /api/resumes/my-resume
 * @desc    Get current candidate's uploaded resume URL
 * @access  Private (Candidate only)
 */
export const getMyResume = asyncHandler(async (req, res) => {
  const profile = await JobSeekerProfile.findOne({ user: req.user._id });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        hasResume: !!profile?.resume,
        resumeUrl: profile?.resume || null,
      },
      'Resume status retrieved'
    )
  );
});

/**
 * @route   DELETE /api/resumes/my-resume
 * @desc    Remove candidate's resume from profile
 * @access  Private (Candidate only)
 */
export const deleteResume = asyncHandler(async (req, res) => {
  await JobSeekerProfile.findOneAndUpdate(
    { user: req.user._id },
    { $set: { resume: '' } }
  );

  return res.status(200).json(
    new ApiResponse(200, null, 'Resume removed from your profile successfully')
  );
});
