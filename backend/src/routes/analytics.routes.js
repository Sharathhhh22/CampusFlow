import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);
router.use(requireRole(['faculty', 'admin']));

router.get('/summary', analyticsController.getSummary);
router.get('/issues', analyticsController.getIssues);
router.get('/recovery', analyticsController.getRecovery);

export default router;

