import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary if credentials are provided
const isCloudinaryConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME &&
  env.CLOUDINARY_API_KEY &&
  env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log('☁️  Cloudinary configured successfully.');
} else {
  console.log('📁 Cloudinary credentials not detected; using local storage fallback for uploads.');
}

/**
 * Upload a file buffer to Cloudinary (or local storage fallback)
 * @param {Buffer} buffer - File buffer
 * @param {string} originalname - Original file name
 * @param {string} mimetype - MIME type
 * @returns {Promise<{ url: string, public_id?: string, storageType: 'cloudinary' | 'local' }>}
 */
export const uploadFile = async (buffer, originalname, mimetype) => {
  // If Cloudinary is available, stream upload
  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'careerpilot_resumes',
          resource_type: 'auto',
          format: 'pdf',
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            storageType: 'cloudinary',
          });
        }
      );
      uploadStream.end(buffer);
    });
  }

  // Local file storage fallback
  const uploadsDir = path.resolve(__dirname, '../../uploads/resumes');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const extension = path.extname(originalname) || '.pdf';
  const sanitizedBase = path
    .basename(originalname, extension)
    .replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${sanitizedBase}_${Date.now()}${extension}`;
  const targetPath = path.join(uploadsDir, filename);

  await fs.promises.writeFile(targetPath, buffer);

  const localUrl = `/uploads/resumes/${filename}`;

  return {
    url: localUrl,
    public_id: filename,
    storageType: 'local',
  };
};
