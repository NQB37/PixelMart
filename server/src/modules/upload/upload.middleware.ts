import { NextFunction, Request, Response } from 'express';
import multer, { MulterError } from 'multer';
import { ApiError } from '@/utils/ApiError';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const singleImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(
        ApiError.badRequest('Only JPEG, PNG, or WEBP images are allowed'),
      );
    }
    cb(null, true);
  },
}).single('file');

export const uploadSingleImage = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  singleImage(req, res, (err) => {
    if (err instanceof MulterError) {
      return next(ApiError.badRequest(err.message));
    }
    if (err) return next(err);
    next();
  });
};
