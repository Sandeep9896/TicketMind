import express from 'express';
import * as analyticsController from '../controllers/analytics.controller.js';
import { verifyToken, requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(verifyToken, requireAdmin);

router.get('/overview', analyticsController.getOverview);
router.get('/categories', analyticsController.getTicketsPerCategory);
router.get('/agent-performance', analyticsController.getAgentPerformance);

export default router;
