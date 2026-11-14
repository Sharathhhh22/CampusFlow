import { callGeminiStructured, sanitizePromptInput } from '../services/ai.service.js';
import { integrityAgentOutputSchema } from '../validators/agent.validator.js';

/**
 * Attendance Integrity Agent
 * Investigates unusual attendance submission patterns, rapid clustering, and duplicate attempts.
 */
export async function runIntegrityAgent({ session, events = [], records = [], caseContext = {} }) {
  // 1. Perform deterministic statistical pattern analysis
  const duplicateEvents = events.filter(e => e.event_type === 'duplicate_submission');
  const rejectedEvents = events.filter(e => e.event_type === 'scan_rejected');
  const totalSubmissions = records.length;

  // Compute submission intervals if multiple records exist
  let isClustered = false;
  if (records.length > 5) {
    const timestamps = records
      .map(r => new Date(r.recorded_at).getTime())
      .sort((a, b) => a - b);
    
    // Check if > 50% of submissions arrived in less than 30 seconds
    const diff = (timestamps[timestamps.length - 1] - timestamps[0]) / 1000;
    if (diff < 30 && records.length > 10) {
      isClustered = true;
    }
  }

  // 2. Prepare context for Gemini AI
  const prompt = `You are CampusFlow's Attendance Integrity Agent.
Analyze the following session records and events for potential integrity anomalies.
Remember: An unusual pattern is never proof of misconduct. Assign risk objectively.

Context Data:
Session ID: ${session?.id || 'Unknown'}
Subject ID: ${session?.subject_id || 'Unknown'}
Total Recorded Submissions: ${totalSubmissions}
Duplicate Submission Events: ${duplicateEvents.length}
Rejected Scan Events: ${rejectedEvents.length}
Rapid Submission Cluster Detected: ${isClustered}
Case Context: ${sanitizePromptInput(caseContext.description || 'Routine integrity scan')}

Return a valid JSON object matching the required schema:
{
  "agent": "integrity",
  "status": "completed",
  "risk_level": "low" | "medium" | "high" | "unknown",
  "findings": [
    {
      "finding": "Description of observed pattern",
      "record_references": ["record-id-1"],
      "confidence": 0.85
    }
  ],
  "limitations": ["Observation limited to session window"],
  "requires_faculty_review": boolean,
  "recommended_action": "Recommended next step"
}`;

  const aiResult = await callGeminiStructured({
    prompt,
    schema: integrityAgentOutputSchema,
    timeoutMs: 12000
  });

  if (aiResult) {
    return aiResult;
  }

  // 3. Fallback deterministic analysis
  const findings = [];
  let riskLevel = 'low';
  let requiresReview = false;

  if (duplicateEvents.length > 0) {
    findings.push({
      finding: `Detected ${duplicateEvents.length} duplicate submission attempt(s) for this session.`,
      record_references: duplicateEvents.map(e => e.id),
      confidence: 0.95
    });
    riskLevel = 'medium';
    requiresReview = true;
  }

  if (rejectedEvents.length > 0) {
    findings.push({
      finding: `${rejectedEvents.length} scan event(s) were rejected (e.g. invalid/expired token or network timeout).`,
      record_references: rejectedEvents.map(e => e.id),
      confidence: 0.90
    });
  }

  if (isClustered) {
    findings.push({
      finding: 'High temporal clustering detected: abnormal burst of check-in events within a narrow time window.',
      record_references: records.slice(0, 3).map(r => r.id),
      confidence: 0.75
    });
    riskLevel = 'medium';
    requiresReview = true;
  }

  if (findings.length === 0) {
    findings.push({
      finding: 'Standard attendance submission distribution with no abnormal duplicate bursts.',
      record_references: records.slice(0, 2).map(r => r.id || 'N/A'),
      confidence: 0.92
    });
  }

  return integrityAgentOutputSchema.parse({
    agent: 'integrity',
    status: 'completed',
    risk_level: riskLevel,
    findings,
    limitations: [
      'Analysis evaluated CampusFlow demo session records and audit events only.',
      'Statistical clustering does not constitute evidence of physical absence.'
    ],
    requires_faculty_review: requiresReview,
    recommended_action: requiresReview
      ? 'Forward to faculty review to inspect submission timeline.'
      : 'No integrity anomalies detected. Standard handling applies.'
  });
}

