/**
 * Upload Middleware
 * Handles advertisement image uploads using memory storage.
 */

import multer from 'multer';

const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    const error = new Error('Only JPG, PNG, WEBP, or GIF images are allowed');
    error.statusCode = 400;
    return cb(error);
  }

  return cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_IMAGE_SIZE_BYTES,
  },
  fileFilter,
});

export const uploadAdvertisementImage = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (!err) {
      return next();
    }

    if (err instanceof multer.MulterError) {
      err.statusCode = 400;
      if (err.code === 'LIMIT_FILE_SIZE') {
        err.message = `Image must be smaller than ${MAX_IMAGE_SIZE_MB}MB`;
      }
    }

    return next(err);
  });
};

export default uploadAdvertisementImage;
