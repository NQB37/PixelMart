import { z } from 'zod';

const email = z
  .string()
  .trim()
  .email('Enter a valid email address.')
  .transform((value) => value.toLowerCase());

const password = z.string().min(8, 'Password must be at least 8 characters.');

export const signupPasswordSchema = password
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
  .regex(/[0-9]/, 'Password must contain at least one number.')
  .regex(
    /[^A-Za-z0-9]/,
    'Password must contain at least one special character.',
  );

export const loginSchema = z.object({
  email,
  password,
});

export const signupSchema = z
  .object({
    email,
    password: signupPasswordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password.'),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type LoginFormValues = z.input<typeof loginSchema>;
export type SignupFormValues = z.input<typeof signupSchema>;
