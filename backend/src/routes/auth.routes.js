import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import {
  verifyToken,
  requireAdmin,
  requireAgent,
  requireUser,
  requireAgentOrAdmin
} from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/change-password', verifyToken, authController.changePassword);

router.get('/me', verifyToken, (req, res) => {
  res.status(200).json({ success: true, data: req.user });
});

router.get('/agents', verifyToken, requireAdmin, authController.getAgents);

router.get('/admin-only', verifyToken, requireAdmin, (req, res) => {
  res.status(200).json({ success: true, message: 'Admin access granted' });
});

router.get('/agent-only', verifyToken, requireAgent, (req, res) => {
  res.status(200).json({ success: true, message: 'Agent access granted' });
});

router.get('/user-only', verifyToken, requireUser, (req, res) => {
  res.status(200).json({ success: true, message: 'User access granted' });
});

router.get('/agent-or-admin', verifyToken, requireAgentOrAdmin, (req, res) => {
  res.status(200).json({ success: true, message: 'Agent/Admin access granted' });
});

router.post('/google-login', authController.googleLogin);
router.post('/refresh-token', authController.refreshToken);

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.post('/logout', verifyToken, authController.logout);


export default router;
