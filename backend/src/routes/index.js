import express from 'express';
import authRoutes from './auth.routes.js';
import ticketRoutes from './ticket.routes.js';
import aiTicketRoutes from './ai-ticket.routes.js';
import analyticsRoutes from './analytics.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/tickets', ticketRoutes);
router.use('/ai', aiTicketRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
