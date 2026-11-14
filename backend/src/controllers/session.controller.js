import { sessionRepository } from '../repositories/session.repository.js';
import { createSessionSchema } from '../validators/attendance.validator.js';
import { AppError } from '../middleware/errorHandler.js';

export const sessionController = {
  async listSessions(req, res, next) {
    try {
      const { status, classId } = req.query;
      const facultyId = req.user.role === 'faculty' ? req.user.id : null;

      const sessions = await sessionRepository.list(req.user.institution_id, {
        facultyId,
        classId: classId || null,
        status: status || null
      });

      res.json({
        success: true,
        data: sessions,
        message: 'Attendance sessions retrieved successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  async createSession(req, res, next) {
    try {
      const validated = createSessionSchema.parse(req.body);

      const session = await sessionRepository.create({
        institution_id: req.user.institution_id,
        class_id: validated.class_id,
        subject_id: validated.subject_id,
        faculty_id: req.user.id,
        duration_minutes: validated.duration_minutes
      });

      // Construct QR payload for CampusFlow attendance demonstration
      const qrPayload = JSON.stringify({
        app: 'CampusFlow',
        session_id: session.id,
        token: session.token,
        starts_at: session.starts_at,
        expires_at: session.expires_at
      });

      res.status(201).json({
        success: true,
        data: {
          session,
          qr_payload: qrPayload
        },
        message: 'Attendance session created successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  async getSessionById(req, res, next) {
    try {
      const session = await sessionRepository.findById(req.params.id);
      if (!session || session.institution_id !== req.user.institution_id) {
        throw new AppError('Attendance session not found', 404, 'SESSION_NOT_FOUND');
      }

      res.json({
        success: true,
        data: session,
        message: 'Session retrieved successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  async closeSession(req, res, next) {
    try {
      const closed = await sessionRepository.closeSession(
        req.params.id,
        req.user.role === 'faculty' ? req.user.id : null
      );

      if (!closed) {
        throw new AppError('Session not found or not authorized to close', 404, 'SESSION_NOT_FOUND');
      }

      res.json({
        success: true,
        data: closed,
        message: 'Attendance session closed successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  async getSessionQR(req, res, next) {
    try {
      const session = await sessionRepository.findById(req.params.id);
      if (!session || session.institution_id !== req.user.institution_id) {
        throw new AppError('Attendance session not found', 404, 'SESSION_NOT_FOUND');
      }

      // Check if session is expired
      if (session.status !== 'active' || new Date() > new Date(session.expires_at)) {
        throw new AppError('This attendance session is no longer active. QR code expired.', 400, 'SESSION_EXPIRED');
      }

      const qrPayload = JSON.stringify({
        app: 'CampusFlow',
        session_id: session.id,
        token: session.token || session.token_hash,
        expires_at: session.expires_at
      });

      res.json({
        success: true,
        data: {
          session_id: session.id,
          qr_payload: qrPayload,
          expires_at: session.expires_at
        },
        message: 'Session QR retrieved successfully'
      });
    } catch (err) {
      next(err);
    }
  }
};

