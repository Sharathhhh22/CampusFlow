import { Router } from 'express';
import { attendanceController } from '../controllers/attendance.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';
import { scanLimiter, reportLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(authenticate);

router.post('/scan', scanLimiter, requireRole('student'), attendanceController.scanAttendance);
router.get('/history', attendanceController.getAttendanceHistory);
router.get('/session/:sessionId', requireRole(['faculty', 'admin']), attendanceController.getSessionAttendance);
router.post('/report-issue', reportLimiter, requireRole('student'), attendanceController.reportIssue);

export default router;

