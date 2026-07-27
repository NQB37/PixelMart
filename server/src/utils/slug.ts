import { z } from 'zod';

export const slugSchema = z
  .string('Slug is required')
  .min(2)
  .max(100)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug must be lowercase, dash-separated',
  );
