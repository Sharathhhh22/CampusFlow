import { Router } from 'express';
import { classController } from '../controllers/class.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', classController.listClasses);
router.post('/', requireRole('admin'), classController.createClass);
router.get('/:id', classController.getClassById);
router.get('/:id/subjects', classController.listSubjects);

export default router;

