import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100, 'Full name cannot exceed 100 characters'),
  department_id: z.string().uuid('Invalid department ID').optional(),
  institution_slug: z.string().default('apex-tech')
});

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const profileUpdateSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  department_id: z.string().uuid().optional()
});

