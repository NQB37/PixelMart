import z from 'zod';

export const UPLOAD_FOLDERS = [
  'categories',
  'shops/logos',
  'shops/identity',
  'products',
  'avatars',
] as const;

export const uploadImageSchema = z.object({
  folder: z.enum(UPLOAD_FOLDERS, 'Invalid upload folder'),
});

export type UploadImageInput = z.infer<typeof uploadImageSchema>;
