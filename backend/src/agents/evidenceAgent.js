import { callGeminiStructured, sanitizePromptInput } from '../services/ai.service.js';
import { evidenceAgentOutputSchema } from '../validators/agent.validator.js';

/**
 * Evidence Agent
 * Organizes chronological timeline, separates verified system records from self-reported data,
 * and compiles an objective, auditable dossier for faculty review.
 */
export async function runEvidenceAgent({ verificationCase, session, events = [], existingEvidence = [] }) {
  // Build chronological events timeline from database records
  const timeline = [];

  if (session) {
    timeline.push({
      timestamp: new Date(session.starts_at).toISOString(),
      event: `Faculty opened session ${session.id}`,
      source: 'database_record',
      record_reference: session.id
    });
  }

  events.forEach(e => {
    timeline.push({
      timestamp: new Date(e.occurred_at || e.created_at).toISOString(),
      event: `Event [${e.event_type}]: ${JSON.stringify(e.metadata || {})}`,
      source: 'database_record',
      record_reference: e.id
    });
  });

  if (verificationCase.reported_at) {
    timeline.push({
      timestamp: new Date(verificationCase.reported_at).toISOString(),
      event: `Student submitted attendance recovery case (${verificationCase.issue_category})`,
      source: 'student_statement',
      record_reference: verificationCase.id
    });
  }

  // Sort timeline chronologically
  timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const prompt = `You are CampusFlow's Evidence Agent.
Organize the collected facts and timeline for Case ${verificationCase.id}.
Distinguish strictly between verified system facts and student claims. Do not invent facts.

Case Description: ${sanitizePromptInput(verificationCase.description)}
Timeline Events Count: ${timeline.length}
Existing Evidence Records: ${existingEvidence.length}

Return a valid JSON object matching this schema:
{
  "agent": "evidence",
  "status": "completed",
  "timeline": ${JSON.stringify(timeline)},
  "verified_facts": ["Fact 1 verified from DB"],
  "student_provided_information": ["Claim 1 from student"],
  "missing_evidence": ["Missing evidence item"],
  "summary": "Concise faculty-readable case summary"
}`;

  const aiResult = await callGeminiStructured({
    prompt,
    schema: evidenceAgentOutputSchema,
    timeoutMs: 12000
  });

  if (aiResult) {
    return aiResult;
  }

  // Fallback deterministic evidence dossier
  const verifiedFacts = [];
  const studentClaims = [
    sanitizePromptInput(verificationCase.description)
  ];
  const missingEvidence = [];

  if (session) {
    verifiedFacts.push(`Session ${session.id} was scheduled for date ${session.session_date} from ${session.starts_at} to ${session.expires_at}.`);
  } else {
    missingEvidence.push('No linked attendance session record found.');
  }

  if (events.length > 0) {
    verifiedFacts.push(`${events.length} telemetry event record(s) logged in system for this case window.`);
  } else {
    missingEvidence.push('No device telemetry or network events were captured at the reported timestamp.');
  }

  const summary = `Case ${verificationCase.id} reported as '${verificationCase.issue_category}'. Student stated: "${sanitizePromptInput(verificationCase.description)}". The system identified ${verifiedFacts.length} verified database record(s) and logged ${timeline.length} timeline event(s). Direct faculty review is required.`;

  return evidenceAgentOutputSchema.parse({
    agent: 'evidence',
    status: 'completed',
    timeline,
    verified_facts: verifiedFacts,
    student_provided_information: studentClaims,
    missing_evidence: missingEvidence,
    summary
  });
}

