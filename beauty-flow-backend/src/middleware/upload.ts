import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// Configure memory storage for Cloudinary
const storage = multer.memoryStorage();

// File filter
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Create multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Middleware for single file upload
export const uploadSingle = (fieldName: string) => upload.single(fieldName);

// Middleware for multiple files upload
export const uploadMultiple = (fieldName: string, maxCount: number = 10) => 
  upload.array(fieldName, maxCount);

// Middleware for fields with different names
export const uploadFields = (fields: multer.Field[]) => upload.fields(fields);

// Legacy functions for backward compatibility (will be removed later)
export const deleteUploadedFile = async (_filePath: string): Promise<void> => {
  // No longer needed with Cloudinary
  console.warn('deleteUploadedFile is deprecated. Use cloudStorageService.deleteFile instead.');
};

export const getFileUrl = (_filePath: string, _baseUrl: string): string => {
  // No longer needed with Cloudinary
  console.warn('getFileUrl is deprecated. URLs are provided by Cloudinary.');
  return '';
};

/** Every salon's public files live under saloneo/<kind>/<salonId>/ (avatars, logos, service photos…). */
export const uploadFolder = (kind: string, salonId: string) => `saloneo/${kind}/${salonId}`;

/**
 * The storage key of a file this salon uploaded, from what a client sends (key, public id or /uploads/… URL);
 * null when it is not theirs, or not a plain key (no "..", no absolute path): such a delete is refused.
 */
export function ownedUploadKey(raw: unknown, salonId: string): string | null {
  if (typeof raw !== 'string' || !/^[a-f0-9]{24}$/.test(salonId)) return null;
  const key = raw.trim().replace(/^https?:\/\/[^/]+/, '').replace(/^\/?uploads\//, '');
  if (key.includes('..') || key.includes('\\') || key.includes('\0')) return null;
  // File names keep the original name (spaces, accents): anything but a separator
  return new RegExp(`^saloneo/[a-z]+/${salonId}/[^/]+$`).test(key) ? key : null;
}
