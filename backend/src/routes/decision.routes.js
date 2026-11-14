import { Router } from 'express';
import { decisionController } from '../controllers/decision.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/:id/decision', requireRole(['faculty', 'admin']), decisionController.recordDecision);
router.get('/:id/decisions', decisionController.listDecisions);

export default router;

