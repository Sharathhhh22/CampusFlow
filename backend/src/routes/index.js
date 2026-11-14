import { Router } from 'express';
import authRoutes from './auth.routes.js';
import classRoutes from './class.routes.js';
import sessionRoutes from './session.routes.js';
import attendanceRoutes from './attendance.routes.js';
import caseRoutes from './case.routes.js';
import decisionRoutes from './decision.routes.js';
import analyticsRoutes from './analytics.routes.js';
import adminRoutes from './admin.routes.js';
import copilotRoutes from './copilot.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'CampusFlow',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

router.use('/auth', authRoutes);
router.use('/classes', classRoutes);
router.use('/sessions', sessionRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/cases', caseRoutes);
router.use('/cases', decisionRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);
router.use('/copilot', copilotRoutes);

export default router;

