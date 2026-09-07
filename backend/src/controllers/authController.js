import crypto from 'crypto';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Helper to build sanitized auth response payload
 */
const sendAuthResponse = (user, statusCode, message, res) => {
  const token = user.generateAuthToken();

  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
  };

  return res.status(statusCode).json(
    new ApiResponse(
      statusCode,
      {
        user: userData,
        token,
      },
      message
    )
  );
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (Job Seeker or Recruiter)
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'Please provide name, email, and password');
  }

  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters long');
  }

  // Check if email already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(400, 'An account with this email address already exists');
  }

  // Guard against unauthorized admin self-registration
  const assignedRole = role === 'recruiter' ? 'recruiter' : 'candidate';

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: assignedRole,
  });

  return sendAuthResponse(user, 201, 'Account registered successfully', res);
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Please provide both email and password');
  }

  // Find user and explicitly include password field
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  return sendAuthResponse(user, 200, 'Logged in successfully', res);
});

/**
 * @route   GET /api/auth/me
 * @desc    Get profile of currently logged-in user
 * @access  Private (Protected)
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  return res.status(200).json(new ApiResponse(200, { user }, 'User profile fetched successfully'));
});

/**
 * @route   PUT /api/auth/update-password
 * @desc    Update password for authenticated user
 * @access  Private (Protected)
 */
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Please provide current and new password');
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters long');
  }

  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  return sendAuthResponse(user, 200, 'Password updated successfully', res);
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Generate password reset token
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, 'Please provide an email address');
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    // For security reasons, don't disclose whether an email exists or not
    return res.status(200).json(
      new ApiResponse(
        200,
        null,
        'If an account with that email exists, password reset instructions have been generated'
      )
    );
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // In Phase 12 we hook Nodemailer. For now, return resetToken in dev environment for easy verification
  return res.status(200).json(
    new ApiResponse(
      200,
      { resetToken },
      'Password reset token generated successfully'
    )
  );
});

/**
 * @route   PUT /api/auth/reset-password/:resetToken
 * @desc    Reset password using reset token
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  const { resetToken } = req.params;

  if (!newPassword || newPassword.length < 6) {
    throw new ApiError(400, 'Please provide a valid new password with at least 6 characters');
  }

  // Hash incoming token to match stored hash
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, 'Password reset token is invalid or has expired');
  }

  // Set new password
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  return sendAuthResponse(user, 200, 'Password has been reset successfully', res);
});
