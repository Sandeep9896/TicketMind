import express from 'express';
import * as aiTicketController from '../controllers/ai-ticket.controller.js';
import { verifyToken, requireAgentOrAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/categorize', verifyToken, aiTicketController.categorizeTicket);
router.post('/priority', verifyToken, aiTicketController.detectPriority);
router.post('/analyze', aiTicketController.analyzeTicket);
router.post('/suggest-descriptions', aiTicketController.suggestDescriptions);
router.post('/reply', verifyToken, aiTicketController.generateProfessionalReply);
router.post('/summarize', verifyToken, requireAgentOrAdmin, aiTicketController.summarizeTicketConversation);
router.get('/conversation/:ticketId', verifyToken, aiTicketController.getTicketConversation);
router.get('/chat/history/:ticketId', verifyToken, aiTicketController.getChatHistory);
router.post('/chat/message', verifyToken, aiTicketController.sendChatMessage);

export default router;
