import { z } from 'zod';

export const createSessionSchema = z.object({
  class_id: z.string().min(1, 'Valid Class ID is required'),
  subject_id: z.string().min(1, 'Valid Subject ID is required'),
  duration_minutes: z.coerce.number().int().min(1, 'Duration must be at least 1 minute').max(240, 'Duration cannot exceed 240 minutes').default(15),
  description: z.string().max(500).optional()
});

export const scanAttendanceSchema = z.object({
  session_id: z.string().min(1, 'Valid Session ID is required'),
  token: z.string().min(1, 'QR Token is required'),
  device_info: z.string().max(1000).optional()
});

export const reportIssueSchema = z.object({
  session_id: z.string().min(1, 'Valid Session ID is required').optional().nullable(),
  class_id: z.string().min(1, 'Valid Class ID is required').optional().nullable(),
  issue_category: z.enum([
    'qr_scan_failure',
    'network_failure',
    'app_error',
    'session_expiry',
    'attendance_not_appearing',
    'other'
  ], {
    errorMap: () => ({ message: 'Please select a valid issue category' })
  }),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description cannot exceed 1000 characters'),
  occurred_at: z.string().datetime().optional()
});

