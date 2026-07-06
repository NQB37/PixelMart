import { asyncHandler } from '@/utils/asyncHandler';
import { ApiResponse } from '@/utils/ApiResponse';
import { ApiError } from '@/utils/ApiError';
import { uploadService } from './upload.service';

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No file provided');

  const url = await uploadService.uploadImage(req.file, req.body.folder);

  ApiResponse.created(res, { url }, 'Image uploaded successfully');
});

export { uploadImage };
