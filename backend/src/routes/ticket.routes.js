import express from 'express';
import * as ticketController from '../controllers/ticket.controller.js';
import {
  verifyToken,
  requireAdmin,
  requireAgentOrAdmin
} from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(verifyToken);

router.post('/', ticketController.createTicket);
router.get('/my', ticketController.getUserTickets);
router.get('/', requireAgentOrAdmin, ticketController.getAllTickets);
router.patch('/:ticketId/assign', requireAdmin, ticketController.assignTicketToAgent);
router.patch('/:ticketId/status', requireAgentOrAdmin, ticketController.updateTicketStatus);
router.post('/:ticketId/communications', ticketController.addCommunication);
router.post('/:ticketId/comments', ticketController.addCommunication);

export default router;
