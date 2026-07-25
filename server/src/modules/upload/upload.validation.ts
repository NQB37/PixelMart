import z from 'zod';

export const UPLOAD_FOLDERS = [
  'categories',
  'vendors/logos',
  'vendors/identity',
  'products',
  'avatars',
] as const;

export const uploadImageSchema = z.object({
  folder: z.enum(UPLOAD_FOLDERS, 'Invalid upload folder'),
});

export type UploadImageInput = z.infer<typeof uploadImageSchema>;
