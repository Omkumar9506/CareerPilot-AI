import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';

/**
 * Validates whether a route parameter is a valid 24-char hex MongoDB ObjectId.
 */
export const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const val = req.params[paramName];
    if (!val || !mongoose.Types.ObjectId.isValid(val)) {
      return next(
        new ApiError(400, `Invalid ${paramName} parameter: expected a valid 24-character hexadecimal ID`)
      );
    }
    next();
  };
};

/**
 * Validates registration input payload
 */
export const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return next(new ApiError(400, 'Name is required and cannot be empty'));
  }

  if (name.length > 80) {
    return next(new ApiError(400, 'Name cannot exceed 80 characters'));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return next(new ApiError(400, 'Please provide a valid email address'));
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return next(new ApiError(400, 'Password must be at least 6 characters long'));
  }

  if (role && !['candidate', 'recruiter'].includes(role)) {
    return next(new ApiError(400, 'Role must be either "candidate" or "recruiter"'));
  }

  next();
};

/**
 * Validates login input payload
 */
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ApiError(400, 'Please provide both email and password'));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new ApiError(400, 'Please provide a valid email address'));
  }

  next();
};

/**
 * Validates job creation and update payloads
 */
export const validateJobPayload = (req, res, next) => {
  const {
    title,
    description,
    company,
    location,
    employmentType,
    experienceLevel,
    workplaceType,
    salary,
  } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return next(new ApiError(400, 'Job title is required'));
  }
  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    return next(new ApiError(400, 'Job description is required'));
  }
  if (!company || typeof company !== 'string' || company.trim().length === 0) {
    return next(new ApiError(400, 'Company name is required'));
  }
  if (!location || typeof location !== 'string' || location.trim().length === 0) {
    return next(new ApiError(400, 'Location is required'));
  }

  if (employmentType && !['Full-time', 'Part-time', 'Contract', 'Internship'].includes(employmentType)) {
    return next(new ApiError(400, 'Invalid employmentType. Must be Full-time, Part-time, Contract, or Internship'));
  }

  if (experienceLevel && !['Entry', 'Mid-Level', 'Senior', 'Lead', 'Executive'].includes(experienceLevel)) {
    return next(new ApiError(400, 'Invalid experienceLevel. Must be Entry, Mid-Level, Senior, Lead, or Executive'));
  }

  if (workplaceType && !['Remote', 'On-site', 'Hybrid'].includes(workplaceType)) {
    return next(new ApiError(400, 'Invalid workplaceType. Must be Remote, On-site, or Hybrid'));
  }

  if (salary) {
    if (typeof salary.min === 'number' && typeof salary.max === 'number') {
      if (salary.min < 0 || salary.max < 0) {
        return next(new ApiError(400, 'Salary figures cannot be negative numbers'));
      }
      if (salary.max > 0 && salary.max < salary.min) {
        return next(new ApiError(400, 'Maximum salary cannot be less than minimum salary'));
      }
    }
  }

  next();
};

/**
 * Validates interview schedule input
 */
export const validateInterviewSchedule = (req, res, next) => {
  const { candidateId, jobId, date, time, meetingLink } = req.body;

  if (!candidateId || !mongoose.Types.ObjectId.isValid(candidateId)) {
    return next(new ApiError(400, 'Valid candidateId is required'));
  }
  if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
    return next(new ApiError(400, 'Valid jobId is required'));
  }
  if (!date || isNaN(Date.parse(date))) {
    return next(new ApiError(400, 'Valid interview date is required'));
  }
  if (!time || typeof time !== 'string' || time.trim().length === 0) {
    return next(new ApiError(400, 'Interview time is required (e.g. 10:30 AM or 14:00)'));
  }
  if (!meetingLink || typeof meetingLink !== 'string' || meetingLink.trim().length === 0) {
    return next(new ApiError(400, 'Meeting link is required'));
  }

  next();
};
