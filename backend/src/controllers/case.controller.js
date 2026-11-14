import { caseRepository } from '../repositories/case.repository.js';
import { sessionRepository } from '../repositories/session.repository.js';
import { runCoordinatorAgent } from '../agents/coordinatorAgent.js';
import { additionalInfoSchema, caseQuerySchema } from '../validators/case.validator.js';
import { AppError } from '../middleware/errorHandler.js';
import { db } from '../config/db.js';

export const caseController = {
  async listCases(req, res, next) {
    try {
      const query = caseQuerySchema.parse(req.query);
      const studentId = req.user.role === 'student' ? req.user.id : (query.student_id || null);

      const cases = await caseRepository.list(req.user.institution_id, {
        studentId,
        status: query.status,
        issueCategory: query.issue_category,
        page: query.page,
        limit: query.limit
      });

      res.json({
        success: true,
        data: cases,
        message: 'Verification cases retrieved successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  async getCaseById(req, res, next) {
    try {
      const caseItem = await caseRepository.findById(req.params.id);
      if (!caseItem || caseItem.institution_id !== req.user.institution_id) {
        throw new AppError('Verification case not found', 404, 'CASE_NOT_FOUND');
      }

      // Enforce student access restriction
      if (req.user.role === 'student' && caseItem.student_id !== req.user.id) {
        throw new AppError('Access denied. You can only view your own cases.', 403, 'FORBIDDEN_CASE_ACCESS');
      }

      res.json({
        success: true,
        data: caseItem,
        message: 'Verification case details retrieved successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  async addAdditionalInfo(req, res, next) {
    try {
      const validated = additionalInfoSchema.parse(req.body);

      const result = await caseRepository.addStudentInformation(
        req.params.id,
        req.user.id,
        validated.additional_information
      );

      res.json({
        success: true,
        data: result,
        message: 'Additional information successfully submitted and case returned to faculty review queue.'
      });
    } catch (err) {
      next(err);
    }
  },

  async triggerAnalysis(req, res, next) {
    try {
      const caseItem = await caseRepository.findById(req.params.id);
      if (!caseItem || caseItem.institution_id !== req.user.institution_id) {
        throw new AppError('Verification case not found', 404, 'CASE_NOT_FOUND');
      }

      let session = null;
      if (caseItem.session_id) {
        session = await sessionRepository.findById(caseItem.session_id);
      }

      // Fetch relevant events
      let events = [];
      let records = [];

      if (db.isPostgres() && caseItem.session_id) {
        const { rows: evRows } = await db.query(
          'SELECT * FROM attendance_events WHERE session_id = $1 ORDER BY occurred_at ASC',
          [caseItem.session_id]
        );
        events = evRows;
        const { rows: recRows } = await db.query(
          'SELECT * FROM attendance_records WHERE session_id = $1',
          [caseItem.session_id]
        );
        records = recRows;
      } else {
        const store = db.getStore();
        events = store.attendance_events.filter(e => e.session_id === caseItem.session_id);
        records = store.attendance_records.filter(r => r.session_id === caseItem.session_id);
      }

      // Run Coordinator Agent
      const investigation = await runCoordinatorAgent({
        verificationCase: caseItem,
        session,
        events,
        records
      });

      res.json({
        success: true,
        data: investigation,
        message: 'Multi-agent AI investigation completed successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  async getAgentActivity(req, res, next) {
    try {
      const caseItem = await caseRepository.findById(req.params.id);
      if (!caseItem || caseItem.institution_id !== req.user.institution_id) {
        throw new AppError('Verification case not found', 404, 'CASE_NOT_FOUND');
      }

      // Student security guard: internal agent logs are restricted to faculty/admin
      if (req.user.role === 'student') {
        throw new AppError('Internal agent activity logs are restricted to authorized faculty and administrators.', 403, 'FORBIDDEN_AGENT_LOGS');
      }

      let runs = [];
      if (db.isPostgres()) {
        const { rows } = await db.query(
          'SELECT * FROM agent_runs WHERE case_id = $1 ORDER BY started_at ASC',
          [req.params.id]
        );
        runs = rows;
      } else {
        runs = db.getStore().agent_runs.filter(a => a.case_id === req.params.id);
      }

      res.json({
        success: true,
        data: runs,
        message: 'Agent activity retrieved successfully'
      });
    } catch (err) {
      next(err);
    }
  }
};

