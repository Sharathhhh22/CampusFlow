import { callGeminiStructured, sanitizePromptInput } from '../services/ai.service.js';
import { recoveryAgentOutputSchema } from '../validators/agent.validator.js';

/**
 * Smart Recovery Agent
 * Investigates student-reported attendance failures and checks technical plausibility.
 */
export async function runRecoveryAgent({ verificationCase, session, studentEvents = [], relatedClassEvents = [] }) {
  const reportedTime = verificationCase.reported_at ? new Date(verificationCase.reported_at) : new Date();
  
  // Check session validity at the time of the event
  let sessionStatus = 'unverified';
  if (session) {
    const startsAt = new Date(session.starts_at);
    const expiresAt = new Date(session.expires_at);
    if (reportedTime >= startsAt && reportedTime <= expiresAt) {
      sessionStatus = 'valid';
    } else if (reportedTime > expiresAt) {
      sessionStatus = 'expired';
    } else {
      sessionStatus = 'valid';
    }
  } else {
    sessionStatus = 'not_found';
  }

  // Check for rejected scan logs or errors from student or classmates
  const studentRejectedLogs = studentEvents.filter(e => e.event_type === 'scan_rejected');
  const classErrorLogs = relatedClassEvents.filter(e => e.event_type === 'scan_rejected' || e.event_type === 'issue_reported');

  const prompt = `You are CampusFlow's Smart Recovery Agent.
Investigate this student-reported attendance recovery case.
Do not fabricate logs or claim access to external systems.

Case Details:
Case ID: ${verificationCase.id}
Issue Category: ${verificationCase.issue_category}
Student Description: ${sanitizePromptInput(verificationCase.description)}
Reported Occurrence Time: ${verificationCase.reported_at}
Session ID: ${session?.id || 'Not specified'}
Session Status at Occurrence: ${sessionStatus}
Matched Student Scan Rejected Logs: ${studentRejectedLogs.length}
Matched Classmate Exception Reports: ${classErrorLogs.length}

Return a valid JSON object matching this schema:
{
  "agent": "recovery",
  "status": "completed",
  "issue_category": "${verificationCase.issue_category}",
  "session_status": "${sessionStatus}",
  "available_system_evidence": ["Evidence point 1"],
  "student_report_summary": "Objective summary of student statement",
  "missing_information": ["Missing info 1"],
  "requires_faculty_review": true,
  "recommended_action": "Recommended next step"
}`;

  const aiResult = await callGeminiStructured({
    prompt,
    schema: recoveryAgentOutputSchema,
    timeoutMs: 12000
  });

  if (aiResult) {
    return aiResult;
  }

  // Fallback deterministic analysis
  const availableEvidence = [];
  const missingInfo = [];

  if (session) {
    availableEvidence.push(`Attendance session (${session.id}) was recorded active from ${session.starts_at} to ${session.expires_at}.`);
  } else {
    missingInfo.push('Exact matching attendance session record was not linked to this report.');
  }

  if (studentRejectedLogs.length > 0) {
    availableEvidence.push(`Detected ${studentRejectedLogs.length} rejected scan event(s) logged on server for this student around the reported time.`);
  } else {
    missingInfo.push('No server-side scan_rejected telemetry event found for student device.');
  }

  if (classErrorLogs.length > 1) {
    availableEvidence.push(`Corroborating technical issue: ${classErrorLogs.length} other students reported exceptions for the same class/session.`);
  }

  return recoveryAgentOutputSchema.parse({
    agent: 'recovery',
    status: 'completed',
    issue_category: verificationCase.issue_category || 'other',
    session_status: sessionStatus,
    available_system_evidence: availableEvidence,
    student_report_summary: sanitizePromptInput(verificationCase.description),
    missing_information: missingInfo,
    requires_faculty_review: true,
    recommended_action: 'Present synthesized telemetry to faculty for manual recovery authorization.'
  });
}

