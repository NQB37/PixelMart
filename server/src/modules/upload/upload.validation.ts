import z from 'zod';

export const UPLOAD_FOLDERS = [
  'shops/logos',
  'shops/identity',
  'avatars',
  'products',
] as const;

export const uploadImageSchema = z.object({
  folder: z.enum(UPLOAD_FOLDERS, 'Invalid upload folder'),
});

export type UploadImageInput = z.infer<typeof uploadImageSchema>;
