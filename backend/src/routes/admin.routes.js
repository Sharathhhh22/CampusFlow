import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('admin'));

router.get('/users', adminController.listUsers);
router.patch('/users/:id/role', adminController.updateUserRole);
router.get('/institutions', adminController.listInstitutions);
router.get('/audit-logs', adminController.listAuditLogs);

export default router;

