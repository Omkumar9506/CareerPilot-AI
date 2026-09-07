import multer from 'multer';
import path from 'path';
import { ApiError } from '../utils/ApiError.js';

// Memory storage keeps file buffer in memory
const storage = multer.memoryStorage();

// Allowed MIME types & extensions
const allowedMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const allowedExtensions = ['.pdf', '.doc', '.docx'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        'Invalid file type. Only PDF, DOC, and DOCX documents are supported.'
      ),
      false
    );
  }
};

export const uploadResumeMiddleware = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
  fileFilter,
}).single('resume');
