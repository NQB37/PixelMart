import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(8000),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  ACCESS_TOKEN_SECRET: z.string().min(1, 'ACCESS_TOKEN_SECRET is required'),
  ACCESS_TOKEN_EXPIRY: z.coerce.number().int().positive(),
  REFRESH_TOKEN_SECRET: z.string().min(1, 'REFRESH_TOKEN_SECRET is required'),
  REFRESH_TOKEN_EXPIRY: z.coerce.number().int().positive(),
  FRONTEND_URL: z.string().url(),
});

const env = envSchema.parse(process.env);

export const {
  PORT,
  NODE_ENV,
  DATABASE_URL,
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRY,
  FRONTEND_URL,
} = env;
