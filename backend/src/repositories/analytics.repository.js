import { db } from '../config/db.js';

export const analyticsRepository = {
  async getSummary(institutionId) {
    if (db.isPostgres()) {
      const [
        studentsRes,
        sessionsRes,
        submissionsRes,
        pendingRecoveriesRes,
        facultyReviewRes,
        resolvedCasesRes,
        agentRunsRes
      ] = await Promise.all([
        db.query("SELECT COUNT(*) FROM profiles WHERE institution_id = $1 AND role = 'student'", [institutionId]),
        db.query("SELECT COUNT(*) FROM attendance_sessions WHERE institution_id = $1", [institutionId]),
        db.query("SELECT COUNT(*) FROM attendance_records WHERE institution_id = $1", [institutionId]),
        db.query("SELECT COUNT(*) FROM verification_cases WHERE institution_id = $1 AND status IN ('submitted', 'under_investigation')", [institutionId]),
        db.query("SELECT COUNT(*) FROM verification_cases WHERE institution_id = $1 AND status = 'pending_faculty_review'", [institutionId]),
        db.query("SELECT COUNT(*) FROM verification_cases WHERE institution_id = $1 AND status IN ('approved', 'rejected', 'closed')", [institutionId]),
        db.query("SELECT COUNT(*) FROM agent_runs WHERE institution_id = $1", [institutionId])
      ]);

      return {
        total_students: parseInt(studentsRes.rows[0].count, 10),
        total_sessions: parseInt(sessionsRes.rows[0].count, 10),
        valid_submissions: parseInt(submissionsRes.rows[0].count, 10),
        pending_recovery_requests: parseInt(pendingRecoveriesRes.rows[0].count, 10),
        requiring_faculty_review: parseInt(facultyReviewRes.rows[0].count, 10),
        resolved_cases: parseInt(resolvedCasesRes.rows[0].count, 10),
        total_agent_investigations: parseInt(agentRunsRes.rows[0].count, 10)
      };
    }

    const store = db.getStore();
    const students = store.profiles.filter(p => p.institution_id === institutionId && p.role === 'student').length;
    const sessions = store.attendance_sessions.filter(s => s.institution_id === institutionId).length;
    const submissions = store.attendance_records.filter(r => r.institution_id === institutionId).length;
    const pending = store.verification_cases.filter(c => c.institution_id === institutionId && ['submitted', 'under_investigation'].includes(c.status)).length;
    const facultyReview = store.verification_cases.filter(c => c.institution_id === institutionId && c.status === 'pending_faculty_review').length;
    const resolved = store.verification_cases.filter(c => c.institution_id === institutionId && ['approved', 'rejected', 'closed'].includes(c.status)).length;
    const agentRuns = store.agent_runs.filter(a => a.institution_id === institutionId).length;

    return {
      total_students: students,
      total_sessions: sessions,
      valid_submissions: submissions,
      pending_recovery_requests: pending,
      requiring_faculty_review: facultyReview,
      resolved_cases: resolved,
      total_agent_investigations: agentRuns
    };
  },

  async getIssuesBreakdown(institutionId) {
    if (db.isPostgres()) {
      const { rows } = await db.query(
        `SELECT issue_category, COUNT(*) as count
         FROM verification_cases
         WHERE institution_id = $1
         GROUP BY issue_category
         ORDER BY count DESC`,
        [institutionId]
      );
      return rows.map(r => ({ category: r.issue_category, count: parseInt(r.count, 10) }));
    }

    const store = db.getStore();
    const counts = {};
    store.verification_cases
      .filter(c => c.institution_id === institutionId)
      .forEach(c => {
        counts[c.issue_category] = (counts[c.issue_category] || 0) + 1;
      });

    return Object.entries(counts).map(([category, count]) => ({ category, count }));
  },

  async getRecoveryTrends(institutionId) {
    if (db.isPostgres()) {
      const { rows } = await db.query(
        `SELECT DATE(reported_at) as date,
           COUNT(*) as total_cases,
           COUNT(*) FILTER (WHERE status = 'approved') as approved_cases,
           COUNT(*) FILTER (WHERE status = 'rejected') as rejected_cases
         FROM verification_cases
         WHERE institution_id = $1
         GROUP BY DATE(reported_at)
         ORDER BY date DESC
         LIMIT 14`,
        [institutionId]
      );
      return rows;
    }

    const store = db.getStore();
    const map = {};
    store.verification_cases
      .filter(c => c.institution_id === institutionId)
      .forEach(c => {
        const d = (c.reported_at || c.created_at).split('T')[0];
        if (!map[d]) {
          map[d] = { date: d, total_cases: 0, approved_cases: 0, rejected_cases: 0 };
        }
        map[d].total_cases += 1;
        if (c.status === 'approved') map[d].approved_cases += 1;
        if (c.status === 'rejected') map[d].rejected_cases += 1;
      });

    return Object.values(map).sort((a, b) => b.date.localeCompare(a.date));
  }
};

