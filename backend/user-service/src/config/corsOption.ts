import { FRONTEND_URL } from './env.js';

export const corsOption = {
  origin: FRONTEND_URL,
  credentials: true,
};
