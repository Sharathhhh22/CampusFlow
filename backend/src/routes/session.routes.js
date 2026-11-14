import { Router } from 'express';
import { sessionController } from '../controllers/session.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', sessionController.listSessions);
router.post('/', requireRole(['faculty', 'admin']), sessionController.createSession);
router.get('/:id', sessionController.getSessionById);
router.post('/:id/close', requireRole(['faculty', 'admin']), sessionController.closeSession);
router.get('/:id/qr', requireRole(['faculty', 'admin']), sessionController.getSessionQR);

export default router;

