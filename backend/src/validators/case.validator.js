import { z } from 'zod';

export const facultyDecisionSchema = z.object({
  decision: z.enum(['approved', 'rejected', 'more_info_requested'], {
    errorMap: () => ({ message: 'Decision must be approved, rejected, or more_info_requested' })
  }),
  reason: z.string().min(5, 'A clear mandatory decision reason must be provided (min 5 characters)').max(1000, 'Reason cannot exceed 1000 characters'),
  internal_note: z.string().max(1000).optional().nullable()
});

export const additionalInfoSchema = z.object({
  additional_information: z.string().min(5, 'Please provide detailed additional information (at least 5 characters)').max(2000, 'Additional information cannot exceed 2000 characters')
});

export const caseQuerySchema = z.object({
  status: z.enum([
    'submitted',
    'under_investigation',
    'awaiting_student_info',
    'pending_faculty_review',
    'approved',
    'rejected',
    'closed'
  ]).optional(),
  issue_category: z.enum([
    'qr_scan_failure',
    'network_failure',
    'app_error',
    'session_expiry',
    'attendance_not_appearing',
    'other'
  ]).optional(),
  student_id: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

