import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(8000),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),
  MAX_PRODUCT_IMAGES: z.coerce.number().int().positive(),
  FRONTEND_URL: z.string().url(),
});

const env = envSchema.parse(process.env);

export const {
  PORT,
  NODE_ENV,
  MONGO_URI,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  MAX_PRODUCT_IMAGES,
  FRONTEND_URL,
} = env;
