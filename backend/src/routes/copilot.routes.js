import { Router } from 'express';
import { copilotController } from '../controllers/copilot.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Middleware: Authenticate if token provided (soft/pass-through fallback for demo)
router.use((req, res, next) => {
  authenticate(req, res, (err) => {
    // If auth fails in demo mode, inject default student persona
    if (!req.user) {
      req.user = {
        id: 'usr-student-01',
        name: 'Alex Rivera',
        full_name: 'Alex Rivera',
        role: 'student',
        reg_number: '21BCE1042',
        department: 'Computer Science & Engineering',
        institution_id: 'inst-001'
      };
    }
    next();
  });
});

router.post('/chat', copilotController.chat);
router.post('/ask', copilotController.chat); // backwards-compatibility
router.get('/conversations', copilotController.getConversations);
router.post('/conversations', copilotController.createConversation);
router.get('/conversations/:conversationId/messages', copilotController.getMessages);
router.delete('/conversations/:conversationId', copilotController.deleteConversation);
router.post('/conversations/:conversationId/clear', copilotController.clearMessages);
router.post('/tool-execute', copilotController.executeTool);

export default router;
