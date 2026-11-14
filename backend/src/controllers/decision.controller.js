import { caseRepository } from '../repositories/case.repository.js';
import { facultyDecisionSchema } from '../validators/case.validator.js';
import { db } from '../config/db.js';

export const decisionController = {
  async recordDecision(req, res, next) {
    try {
      const validated = facultyDecisionSchema.parse(req.body);

      const result = await caseRepository.recordFacultyDecision({
        case_id: req.params.id,
        faculty_id: req.user.id,
        decision: validated.decision,
        reason: validated.reason,
        internal_note: validated.internal_note || null
      });

      res.status(200).json({
        success: true,
        data: result,
        message: `Faculty decision recorded: Case status updated to '${result.status}'.`
      });
    } catch (err) {
      next(err);
    }
  },

  async listDecisions(req, res, next) {
    try {
      if (db.isPostgres()) {
        const { rows } = await db.query(
          `SELECT fd.*, p.full_name as faculty_name, p.email as faculty_email
           FROM faculty_decisions fd
           JOIN profiles p ON fd.faculty_id = p.id
           WHERE fd.case_id = $1
           ORDER BY fd.created_at DESC`,
          [req.params.id]
        );
        return res.json({
          success: true,
          data: rows,
          message: 'Case decisions retrieved successfully'
        });
      }

      const store = db.getStore();
      const decisions = store.faculty_decisions
        .filter(d => d.case_id === req.params.id)
        .map(d => {
          const fac = store.profiles.find(p => p.id === d.faculty_id);
          return {
            ...d,
            faculty_name: fac?.full_name || 'Faculty Member',
            faculty_email: fac?.email || ''
          };
        });

      res.json({
        success: true,
        data: decisions,
        message: 'Case decisions retrieved successfully'
      });
    } catch (err) {
      next(err);
    }
  }
};

