import { Router } from 'express';
import { caseController } from '../controllers/case.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', caseController.listCases);
router.get('/:id', caseController.getCaseById);
router.post('/:id/additional-information', requireRole('student'), caseController.addAdditionalInfo);
router.post('/:id/analyze', requireRole(['faculty', 'admin']), caseController.triggerAnalysis);
router.get('/:id/agent-activity', requireRole(['faculty', 'admin']), caseController.getAgentActivity);

export default router;

