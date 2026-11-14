import { db } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';

export const caseRepository = {
  async create({ institution_id, student_id, session_id = null, issue_category, description, occurred_at = null, priority = 'medium' }) {
    const id = crypto.randomUUID();
    const reportedAt = occurred_at || new Date().toISOString();

    if (db.isPostgres()) {
      const { rows } = await db.query(
        `INSERT INTO verification_cases (id, institution_id, student_id, session_id, case_type, issue_category, description, reported_at, status, priority)
         VALUES ($1, $2, $3, $4, 'attendance_recovery', $5, $6, $7, 'submitted', $8)
         RETURNING *`,
        [id, institution_id, student_id, session_id, issue_category, description, reportedAt, priority]
      );
      return rows[0];
    }

    const newCase = {
      id,
      institution_id,
      student_id,
      session_id,
      case_type: 'attendance_recovery',
      issue_category,
      description,
      reported_at: reportedAt,
      status: 'submitted',
      priority,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.getStore().verification_cases.push(newCase);
    return newCase;
  },

  async findById(id) {
    if (db.isPostgres()) {
      const { rows } = await db.query(
        `SELECT vc.*, p.full_name as student_name, p.email as student_email,
           s.session_date, s.starts_at, s.expires_at, s.status as session_status,
           sub.name as subject_name, sub.subject_code, c.name as class_name, c.section,
           fac.full_name as faculty_name
         FROM verification_cases vc
         JOIN profiles p ON vc.student_id = p.id
         LEFT JOIN attendance_sessions s ON vc.session_id = s.id
         LEFT JOIN subjects sub ON s.subject_id = sub.id
         LEFT JOIN classes c ON s.class_id = c.id
         LEFT JOIN profiles fac ON s.faculty_id = fac.id
         WHERE vc.id = $1`,
        [id]
      );
      if (rows.length === 0) return null;
      const caseRecord = rows[0];

      // Fetch evidence records
      const { rows: evidence } = await db.query(
        'SELECT * FROM evidence_records WHERE case_id = $1 ORDER BY created_at ASC',
        [id]
      );
      // Fetch agent runs
      const { rows: agentRuns } = await db.query(
        'SELECT * FROM agent_runs WHERE case_id = $1 ORDER BY created_at ASC',
        [id]
      );
      // Fetch faculty decisions
      const { rows: decisions } = await db.query(
        `SELECT fd.*, p.full_name as faculty_name
         FROM faculty_decisions fd
         JOIN profiles p ON fd.faculty_id = p.id
         WHERE fd.case_id = $1
         ORDER BY fd.created_at DESC`,
        [id]
      );

      return {
        ...caseRecord,
        evidence,
        agent_runs: agentRuns,
        decisions
      };
    }

    const store = db.getStore();
    const vc = store.verification_cases.find(x => x.id === id);
    if (!vc) return null;

    const student = store.profiles.find(p => p.id === vc.student_id);
    const session = store.attendance_sessions.find(s => s.id === vc.session_id);
    const subject = session ? store.subjects.find(sub => sub.id === session.subject_id) : null;
    const cls = session ? store.classes.find(c => c.id === session.class_id) : null;
    const fac = session ? store.profiles.find(p => p.id === session.faculty_id) : null;

    const evidence = store.evidence_records.filter(e => e.case_id === id);
    const agentRuns = store.agent_runs.filter(a => a.case_id === id);
    const decisions = store.faculty_decisions
      .filter(d => d.case_id === id)
      .map(d => {
        const f = store.profiles.find(p => p.id === d.faculty_id);
        return { ...d, faculty_name: f?.full_name || 'Faculty Member' };
      });

    return {
      ...vc,
      student_name: student?.full_name || 'Student',
      student_email: student?.email || '',
      session_date: session?.session_date || null,
      starts_at: session?.starts_at || null,
      expires_at: session?.expires_at || null,
      session_status: session?.status || 'unverified',
      subject_name: subject?.name || 'Class Session',
      subject_code: subject?.subject_code || '',
      class_name: cls?.name || '',
      section: cls?.section || '',
      faculty_name: fac?.full_name || 'Faculty Member',
      evidence,
      agent_runs: agentRuns,
      decisions
    };
  },

  async list(institutionId, { studentId = null, status = null, issueCategory = null, page = 1, limit = 50 } = {}) {
    if (db.isPostgres()) {
      let query = `
        SELECT vc.*, p.full_name as student_name, p.email as student_email,
          sub.name as subject_name, sub.subject_code, c.name as class_name, c.section,
          (SELECT COUNT(*) FROM evidence_records er WHERE er.case_id = vc.id) as evidence_count,
          (SELECT COUNT(*) FROM agent_runs ar WHERE ar.case_id = vc.id) as agent_runs_count
        FROM verification_cases vc
        JOIN profiles p ON vc.student_id = p.id
        LEFT JOIN attendance_sessions s ON vc.session_id = s.id
        LEFT JOIN subjects sub ON s.subject_id = sub.id
        LEFT JOIN classes c ON s.class_id = c.id
        WHERE vc.institution_id = $1
      `;
      const params = [institutionId];
      let pIdx = 2;

      if (studentId) {
        query += ` AND vc.student_id = $${pIdx++}`;
        params.push(studentId);
      }
      if (status) {
        query += ` AND vc.status = $${pIdx++}`;
        params.push(status);
      }
      if (issueCategory) {
        query += ` AND vc.issue_category = $${pIdx++}`;
        params.push(issueCategory);
      }

      query += ` ORDER BY vc.reported_at DESC LIMIT $${pIdx++} OFFSET $${pIdx++}`;
      params.push(limit, (page - 1) * limit);

      const { rows } = await db.query(query, params);
      return rows;
    }

    const store = db.getStore();
    return store.verification_cases
      .filter(vc => {
        if (vc.institution_id !== institutionId) return false;
        if (studentId && vc.student_id !== studentId) return false;
        if (status && vc.status !== status) return false;
        if (issueCategory && vc.issue_category !== issueCategory) return false;
        return true;
      })
      .map(vc => {
        const p = store.profiles.find(x => x.id === vc.student_id);
        const s = store.attendance_sessions.find(x => x.id === vc.session_id);
        const sub = s ? store.subjects.find(x => x.id === s.subject_id) : null;
        const c = s ? store.classes.find(x => x.id === s.class_id) : null;
        const evidenceCount = store.evidence_records.filter(e => e.case_id === vc.id).length;
        const runsCount = store.agent_runs.filter(a => a.case_id === vc.id).length;
        return {
          ...vc,
          student_name: p?.full_name || 'Student',
          student_email: p?.email || '',
          subject_name: sub?.name || 'Class Session',
          subject_code: sub?.subject_code || '',
          class_name: c?.name || '',
          section: c?.section || '',
          evidence_count: evidenceCount,
          agent_runs_count: runsCount
        };
      })
      .sort((a, b) => new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime());
  },

  async addStudentInformation(caseId, studentId, additionalInfo) {
    const evId = crypto.randomUUID();
    const now = new Date().toISOString();

    if (db.isPostgres()) {
      await db.query(
        `INSERT INTO evidence_records (id, institution_id, case_id, evidence_type, source_type, description, verification_status)
         VALUES ($1, (SELECT institution_id FROM verification_cases WHERE id = $2), $2, 'Student Additional Statement', 'student_statement', $3, 'unverified')`,
        [evId, caseId, additionalInfo]
      );
      await db.query(
        "UPDATE verification_cases SET status = 'pending_faculty_review', updated_at = NOW() WHERE id = $1 AND student_id = $2",
        [caseId, studentId]
      );
      return { success: true };
    }

    const store = db.getStore();
    const vc = store.verification_cases.find(x => x.id === caseId && x.student_id === studentId);
    if (!vc) throw new AppError('Verification case not found or not owned by student.', 404, 'CASE_NOT_FOUND');

    store.evidence_records.push({
      id: evId,
      institution_id: vc.institution_id,
      case_id: caseId,
      evidence_type: 'Student Additional Statement',
      source_type: 'student_statement',
      description: additionalInfo,
      verification_status: 'unverified',
      created_at: now
    });

    vc.status = 'pending_faculty_review';
    vc.updated_at = now;
    return { success: true };
  },

  async recordFacultyDecision({ case_id, faculty_id, decision, reason, internal_note = null }) {
    const decisionId = crypto.randomUUID();
    const now = new Date().toISOString();

    // Map decision to case status
    let newStatus = 'closed';
    if (decision === 'approved') newStatus = 'approved';
    else if (decision === 'rejected') newStatus = 'rejected';
    else if (decision === 'more_info_requested') newStatus = 'awaiting_student_info';

    if (db.isPostgres()) {
      await db.query('BEGIN');
      try {
        // 1. Fetch case info
        const { rows: cases } = await db.query('SELECT * FROM verification_cases WHERE id = $1', [case_id]);
        if (cases.length === 0) throw new AppError('Verification case not found.', 404, 'CASE_NOT_FOUND');
        const vc = cases[0];

        // 2. Insert decision record
        await db.query(
          `INSERT INTO faculty_decisions (id, institution_id, case_id, faculty_id, decision, reason, internal_note, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [decisionId, vc.institution_id, case_id, faculty_id, decision, reason, internal_note, now]
        );

        // 3. Update case status
        await db.query(
          'UPDATE verification_cases SET status = $1, updated_at = NOW() WHERE id = $2',
          [newStatus, case_id]
        );

        // 4. If approved, record/update attendance to 'recovered'
        if (decision === 'approved' && vc.session_id) {
          const arId = crypto.randomUUID();
          await db.query(
            `INSERT INTO attendance_records (id, institution_id, session_id, student_id, attendance_status, recorded_at, source)
             VALUES ($1, $2, $3, $4, 'recovered', NOW(), 'faculty_recovery_approval')
             ON CONFLICT (session_id, student_id)
             DO UPDATE SET attendance_status = 'recovered', recorded_at = NOW(), source = 'faculty_recovery_approval'`,
            [arId, vc.institution_id, vc.session_id, vc.student_id]
          );
        }

        // 5. Audit Log
        await db.query(
          `INSERT INTO audit_logs (id, institution_id, actor_id, action, entity_type, entity_id, details)
           VALUES ($1, $2, $3, $4, 'verification_case', $5, $6)`,
          [
            crypto.randomUUID(),
            vc.institution_id,
            faculty_id,
            `faculty_decision_${decision}`,
            case_id,
            JSON.stringify({ decision, reason, internal_note })
          ]
        );

        await db.query('COMMIT');
        return { decision_id: decisionId, status: newStatus };
      } catch (err) {
        await db.query('ROLLBACK');
        throw err;
      }
    }

    const store = db.getStore();
    const vc = store.verification_cases.find(x => x.id === case_id);
    if (!vc) throw new AppError('Verification case not found.', 404, 'CASE_NOT_FOUND');

    const decisionRecord = {
      id: decisionId,
      institution_id: vc.institution_id,
      case_id,
      faculty_id,
      decision,
      reason,
      internal_note,
      created_at: now
    };
    store.faculty_decisions.push(decisionRecord);
    vc.status = newStatus;
    vc.updated_at = now;

    if (decision === 'approved' && vc.session_id) {
      const existing = store.attendance_records.find(
        r => r.session_id === vc.session_id && r.student_id === vc.student_id
      );
      if (existing) {
        existing.attendance_status = 'recovered';
        existing.source = 'faculty_recovery_approval';
        existing.recorded_at = now;
      } else {
        store.attendance_records.push({
          id: crypto.randomUUID(),
          institution_id: vc.institution_id,
          session_id: vc.session_id,
          student_id: vc.student_id,
          attendance_status: 'recovered',
          recorded_at: now,
          source: 'faculty_recovery_approval',
          created_at: now
        });
      }
    }

    store.audit_logs.push({
      id: crypto.randomUUID(),
      institution_id: vc.institution_id,
      actor_id: faculty_id,
      action: `faculty_decision_${decision}`,
      entity_type: 'verification_case',
      entity_id: case_id,
      details: { decision, reason, internal_note },
      created_at: now
    });

    return { decision_id: decisionId, status: newStatus };
  }
};

