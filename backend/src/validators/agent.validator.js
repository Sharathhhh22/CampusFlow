import { z } from 'zod';

export const integrityAgentOutputSchema = z.object({
  agent: z.literal('integrity'),
  status: z.enum(['completed', 'failed']),
  risk_level: z.enum(['low', 'medium', 'high', 'unknown']),
  findings: z.array(z.object({
    finding: z.string(),
    record_references: z.array(z.string()).default([]),
    confidence: z.number().min(0).max(1)
  })).default([]),
  limitations: z.array(z.string()).default([]),
  requires_faculty_review: z.boolean().default(false),
  recommended_action: z.string().default('No additional action')
});

export const recoveryAgentOutputSchema = z.object({
  agent: z.literal('recovery'),
  status: z.enum(['completed', 'failed']),
  issue_category: z.string(),
  session_status: z.enum(['valid', 'expired', 'not_found', 'unverified']),
  available_system_evidence: z.array(z.string()).default([]),
  student_report_summary: z.string(),
  missing_information: z.array(z.string()).default([]),
  requires_faculty_review: z.boolean().default(true),
  recommended_action: z.string().default('Review the available evidence')
});

export const evidenceAgentOutputSchema = z.object({
  agent: z.literal('evidence'),
  status: z.enum(['completed', 'failed']),
  timeline: z.array(z.object({
    timestamp: z.string(),
    event: z.string(),
    source: z.string(),
    record_reference: z.string().optional().nullable()
  })).default([]),
  verified_facts: z.array(z.string()).default([]),
  student_provided_information: z.array(z.string()).default([]),
  missing_evidence: z.array(z.string()).default([]),
  summary: z.string()
});

export const coordinatorAgentOutputSchema = z.object({
  agent: z.literal('coordinator'),
  status: z.enum(['completed', 'failed']),
  case_id: z.string(),
  agents_executed: z.array(z.string()).default([]),
  investigation_summary: z.string(),
  findings: z.array(z.string()).default([]),
  uncertainties: z.array(z.string()).default([]),
  recommended_next_step: z.string().default('faculty_review'),
  requires_human_decision: z.literal(true).default(true)
});

