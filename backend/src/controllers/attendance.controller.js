import { attendanceRepository } from '../repositories/attendance.repository.js';
import { caseRepository } from '../repositories/case.repository.js';
import { runCoordinatorAgent } from '../agents/coordinatorAgent.js';
import { sessionRepository } from '../repositories/session.repository.js';
import { scanAttendanceSchema, reportIssueSchema } from '../validators/attendance.validator.js';
import { db } from '../config/db.js';

export const attendanceController = {
  async scanAttendance(req, res, next) {
    try {
      const validated = scanAttendanceSchema.parse(req.body);

      const record = await attendanceRepository.recordScan({
        institution_id: req.user.institution_id,
        session_id: validated.session_id,
        student_id: req.user.id,
        token: validated.token,
        device_info: validated.device_info || req.headers['user-agent']
      });

      res.status(200).json({
        success: true,
        data: record,
        message: 'Attendance recorded successfully! Check-in confirmed.'
      });
    } catch (err) {
      next(err);
    }
  },

  async getAttendanceHistory(req, res, next) {
    try {
      const studentId = req.user.role === 'student' ? req.user.id : (req.query.studentId || req.user.id);
      const history = await attendanceRepository.getStudentHistory(studentId);

      res.json({
        success: true,
        data: history,
        message: 'Attendance history retrieved successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  async getSessionAttendance(req, res, next) {
    try {
      const records = await attendanceRepository.getSessionRecords(req.params.sessionId);
      res.json({
        success: true,
        data: records,
        message: 'Session attendance records retrieved successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  async reportIssue(req, res, next) {
    try {
      const validated = reportIssueSchema.parse(req.body);

      // 1. Create verification case
      const newCase = await caseRepository.create({
        institution_id: req.user.institution_id,
        student_id: req.user.id,
        session_id: validated.session_id || null,
        issue_category: validated.issue_category,
        description: validated.description,
        occurred_at: validated.occurred_at || null
      });

      // 2. Log event
      if (validated.session_id) {
        await attendanceRepository.logEvent({
          institution_id: req.user.institution_id,
          session_id: validated.session_id,
          student_id: req.user.id,
          event_type: 'recovery_requested',
          source: 'campusflow_web',
          metadata: { case_id: newCase.id, issue_category: validated.issue_category }
        });
      }

      // 3. Initiate Coordinator Agent asynchronously / non-blocking
      let session = null;
      if (validated.session_id) {
        session = await sessionRepository.findById(validated.session_id);
      }

      // Execute investigation workflow
      runCoordinatorAgent({
        verificationCase: newCase,
        session,
        events: db.isPostgres() ? [] : db.getStore().attendance_events,
        records: db.isPostgres() ? [] : db.getStore().attendance_records
      }).catch(err => {
        console.warn('⚠️ Asynchronous AI Coordinator execution error:', err.message);
      });

      res.status(201).json({
        success: true,
        data: newCase,
        message: 'Attendance recovery request submitted successfully. Case is under investigation.'
      });
    } catch (err) {
      next(err);
    }
  }
};

