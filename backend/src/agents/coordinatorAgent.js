import { runIntegrityAgent } from './integrityAgent.js';
import { runRecoveryAgent } from './recoveryAgent.js';
import { runEvidenceAgent } from './evidenceAgent.js';
import { callGeminiStructured } from '../services/ai.service.js';
import { coordinatorAgentOutputSchema } from '../validators/agent.validator.js';
import { db } from '../config/db.js';

/**
 * Coordinator Agent (Orchestrator)
 * Manages bounded multi-agent execution pipeline:
 * 1. Executes Integrity Agent (if session records exist)
 * 2. Executes Recovery Agent (investigates student technical claim)
 * 3. Executes Evidence Agent (compiles facts & timeline)
 * 4. Aggregates findings and dispatches to Faculty Review Queue
 * 5. Logs all runs to database `agent_runs` table
 */
export async function runCoordinatorAgent({ verificationCase, session, events = [], records = [] }) {
  const executedAgents = [];
  const findings = [];
  const uncertainties = [];
  const agentRunLogs = [];

  // Helper to persist agent run
  async function recordAgentRun(agentName, status, inputSummary, outputJson, error = null) {
    const runId = crypto.randomUUID();
    const runRecord = {
      id: runId,
      institution_id: verificationCase.institution_id,
      case_id: verificationCase.id,
      agent_name: agentName,
      status,
      input_summary: inputSummary,
      output_json: outputJson,
      error_message: error,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    if (db.isPostgres()) {
      try {
        await db.query(
          `INSERT INTO agent_runs (id, institution_id, case_id, agent_name, status, input_summary, output_json, error_message, started_at, completed_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            runRecord.id,
            runRecord.institution_id,
            runRecord.case_id,
            runRecord.agent_name,
            runRecord.status,
            JSON.stringify(runRecord.input_summary),
            JSON.stringify(runRecord.output_json),
            runRecord.error_message,
            runRecord.started_at,
            runRecord.completed_at
          ]
        );
      } catch (err) {
        console.warn('⚠️ Could not insert into agent_runs table:', err.message);
      }
    } else {
      db.getStore().agent_runs.push(runRecord);
    }
    agentRunLogs.push(runRecord);
  }

  // --- Step 1: Run Recovery Agent ---
  let recoveryResult = null;
  try {
    recoveryResult = await runRecoveryAgent({
      verificationCase,
      session,
      studentEvents: events.filter(e => e.student_id === verificationCase.student_id),
      relatedClassEvents: events
    });
    executedAgents.push('recovery');
    findings.push(...(recoveryResult.available_system_evidence || []));
    uncertainties.push(...(recoveryResult.missing_information || []));
    await recordAgentRun('recovery', 'completed', { case_id: verificationCase.id }, recoveryResult);
  } catch (err) {
    console.error('❌ Recovery Agent failed:', err.message);
    await recordAgentRun('recovery', 'failed', { case_id: verificationCase.id }, {}, err.message);
  }

  // --- Step 2: Run Integrity Agent ---
  let integrityResult = null;
  try {
    integrityResult = await runIntegrityAgent({
      session,
      events,
      records,
      caseContext: verificationCase
    });
    executedAgents.push('integrity');
    if (integrityResult.findings) {
      findings.push(...integrityResult.findings.map(f => f.finding));
    }
    await recordAgentRun('integrity', 'completed', { session_id: session?.id }, integrityResult);
  } catch (err) {
    console.error('❌ Integrity Agent failed:', err.message);
    await recordAgentRun('integrity', 'failed', { session_id: session?.id }, {}, err.message);
  }

  // --- Step 3: Run Evidence Agent ---
  let evidenceResult = null;
  try {
    evidenceResult = await runEvidenceAgent({
      verificationCase,
      session,
      events,
      existingEvidence: []
    });
    executedAgents.push('evidence');
    if (evidenceResult.missing_evidence) {
      uncertainties.push(...evidenceResult.missing_evidence);
    }
    await recordAgentRun('evidence', 'completed', { case_id: verificationCase.id }, evidenceResult);

    // Save evidence records to database
    if (evidenceResult.timeline) {
      for (const item of evidenceResult.timeline) {
        const evId = crypto.randomUUID();
        const evRecord = {
          id: evId,
          institution_id: verificationCase.institution_id,
          case_id: verificationCase.id,
          evidence_type: 'Timeline Event',
          source_type: item.source === 'database_record' ? 'database_record' : 'student_statement',
          source_record_id: item.record_reference || null,
          description: item.event,
          verification_status: item.source === 'database_record' ? 'verified' : 'unverified',
          created_at: new Date().toISOString()
        };

        if (db.isPostgres()) {
          try {
            await db.query(
              `INSERT INTO evidence_records (id, institution_id, case_id, evidence_type, source_type, source_record_id, description, verification_status)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
              [evRecord.id, evRecord.institution_id, evRecord.case_id, evRecord.evidence_type, evRecord.source_type, evRecord.source_record_id, evRecord.description, evRecord.verification_status]
            );
          } catch (e) {
            // ignore duplicate evidence inserts
          }
        } else {
          db.getStore().evidence_records.push(evRecord);
        }
      }
    }
  } catch (err) {
    console.error('❌ Evidence Agent failed:', err.message);
    await recordAgentRun('evidence', 'failed', { case_id: verificationCase.id }, {}, err.message);
  }

  // --- Step 4: Coordinator Synthesis ---
  executedAgents.push('coordinator');

  const prompt = `You are CampusFlow's Coordinator Agent.
Synthesize the findings of Recovery, Integrity, and Evidence agents for Case ${verificationCase.id}.
Rule: Human faculty review is mandatory for all attendance corrections.

Executed Agents: ${executedAgents.join(', ')}
Findings count: ${findings.length}
Uncertainties: ${uncertainties.length}

Return a valid JSON object matching this schema:
{
  "agent": "coordinator",
  "status": "completed",
  "case_id": "${verificationCase.id}",
  "agents_executed": ${JSON.stringify(executedAgents)},
  "investigation_summary": "Synthesized investigation summary for faculty",
  "findings": ${JSON.stringify(findings.slice(0, 5))},
  "uncertainties": ${JSON.stringify(uncertainties.slice(0, 5))},
  "recommended_next_step": "faculty_review",
  "requires_human_decision": true
}`;

  const aiCoordinator = await callGeminiStructured({
    prompt,
    schema: coordinatorAgentOutputSchema,
    timeoutMs: 12000
  });

  const finalResult = aiCoordinator || coordinatorAgentOutputSchema.parse({
    agent: 'coordinator',
    status: 'completed',
    case_id: verificationCase.id,
    agents_executed: executedAgents,
    investigation_summary: `Multi-agent investigation completed for Case ${verificationCase.id}. System evaluated session state (${recoveryResult?.session_status || 'unverified'}), verified integrity risk level (${integrityResult?.risk_level || 'low'}), and synthesized evidence timeline. Final authorization escalated to Faculty Decision Center.`,
    findings: findings.slice(0, 5),
    uncertainties: uncertainties.slice(0, 5),
    recommended_next_step: 'faculty_review',
    requires_human_decision: true
  });

  await recordAgentRun('coordinator', 'completed', { case_id: verificationCase.id }, finalResult);

  // Update verification case status to 'pending_faculty_review'
  if (db.isPostgres()) {
    try {
      await db.query(
        "UPDATE verification_cases SET status = 'pending_faculty_review', updated_at = NOW() WHERE id = $1",
        [verificationCase.id]
      );
    } catch (err) {
      console.warn('⚠️ Could not update verification case status in DB:', err.message);
    }
  } else {
    const c = db.getStore().verification_cases.find(x => x.id === verificationCase.id);
    if (c) {
      c.status = 'pending_faculty_review';
      c.updated_at = new Date().toISOString();
    }
  }

  return {
    coordinator: finalResult,
    recovery: recoveryResult,
    integrity: integrityResult,
    evidence: evidenceResult,
    agent_runs: agentRunLogs
  };
}

