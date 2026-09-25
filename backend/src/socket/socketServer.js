import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import env from '../config/env.js';
import User from '../models/user.model.js';
import SOCKET_EVENTS from './socketEvents.js';

let io;

const userRoom = (userId) => `user:${userId}`;
const roleRoom = (role) => `role:${role}`;
const ticketRoom = (ticketId) => `ticket:${ticketId}`;

const extractToken = (socket) => {
  const authHeader = socket.handshake?.headers?.authorization;
  const authToken = socket.handshake?.auth?.token;

  if (authToken) {
    return authToken.startsWith('Bearer ') ? authToken.split(' ')[1] : authToken;
  }

  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

  return null;
};

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.corsOrigin,
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = extractToken(socket);

      if (!token) {
        return next();
      }

      const decoded = jwt.verify(token, env.jwtAccessSecret);
      const user = await User.findById(decoded.sub).select('name email role');

      if (user) {
        socket.data.user = user;
      }

      return next();
    } catch (error) {
      return next();
    }
  });

  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    const connectedUser = socket.data.user;

    if (connectedUser) {
      socket.join(userRoom(connectedUser._id.toString()));
      socket.join(roleRoom(connectedUser.role));
    }

    socket.on(SOCKET_EVENTS.JOIN_TICKET_ROOM, ({ ticketId }) => {
      if (ticketId && mongoose.Types.ObjectId.isValid(ticketId)) {
        socket.join(ticketRoom(ticketId));
      }
    });

    socket.on(SOCKET_EVENTS.LEAVE_TICKET_ROOM, ({ ticketId }) => {
      if (ticketId && mongoose.Types.ObjectId.isValid(ticketId)) {
        socket.leave(ticketRoom(ticketId));
      }
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      // no-op
    });
  });

  return io;
};

const getIO = () => io;

const emitToUser = (userId, eventName, payload) => {
  if (!io || !userId) {
    return;
  }

  io.to(userRoom(userId.toString())).emit(eventName, payload);
};

const emitToRole = (role, eventName, payload) => {
  if (!io || !role) {
    return;
  }

  io.to(roleRoom(role)).emit(eventName, payload);
};

const emitToTicket = (ticketId, eventName, payload) => {
  if (!io || !ticketId) {
    return;
  }

  io.to(ticketRoom(ticketId.toString())).emit(eventName, payload);
};

const rooms = { userRoom, roleRoom, ticketRoom };

export { initSocket, getIO, emitToUser, emitToRole, emitToTicket, rooms };
