import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/ApiError.js';
import User from '../models/user.model.js';
import env from '../config/env.js';

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication token missing'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.jwtAccessSecret);
    const user = await User.findById(decoded.sub).select('-password');

    if (!user) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid authentication token'));
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid or expired token'));
  }
};

const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required'));
  }

  if (!allowedRoles.includes(req.user.role)) {
    return next(new ApiError(StatusCodes.FORBIDDEN, 'Insufficient permissions'));
  }

  return next();
};

const requireAdmin = authorizeRoles('admin');
const requireAgent = authorizeRoles('agent');
const requireUser = authorizeRoles('user');
const requireAgentOrAdmin = authorizeRoles('admin', 'agent');

export {
  verifyToken,
  authorizeRoles,
  requireAdmin,
  requireAgent,
  requireUser,
  requireAgentOrAdmin
};
