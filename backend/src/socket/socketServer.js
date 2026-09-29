import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import env from '../config/env.js';
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';
import SOCKET_EVENTS from './socketEvents.js';

let io;

const userRoom = (userId) => `user:${userId}`;
const roleRoom = (role) => `role:${role}`;
const ticketRoom = (ticketId) => `ticket:${ticketId}`;

const isUserOnline = (userId) => Boolean(io?.sockets.adapter.rooms.get(userRoom(userId.toString()))?.size);

const flushUnsentNotifications = async (userId, socket) => {
  const user = await User.findOneAndUpdate(
    { _id: userId, unsentNotifications: { $exists: true, $ne: [] } },
    { $set: { unsentNotifications: [] } },
    { new: false }
  ).select('unsentNotifications');

  if (!user?.unsentNotifications?.length) {
    return;
  }

  const notifications = await Notification.find({ _id: { $in: user.unsentNotifications } }).lean();

  notifications.forEach((notification) => {
    socket.emit(notification.eventName, notification.payload);
  });

  await Notification.deleteMany({ _id: { $in: user.unsentNotifications } });
};

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
    console.log( connectedUser);

    if (connectedUser) {
      socket.join(userRoom(connectedUser._id.toString()));
      socket.join(roleRoom(connectedUser.role));
      flushUnsentNotifications(connectedUser._id, socket).catch((error) => {
        console.error('[SOCKET] failed to flush unsent notifications:', error?.message || error);
      });
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

const emitNotificationToRoles = async (roles, eventName, payload) => {
  if (!io || !roles?.length) {
    return;
  }

  const recipients = await User.find({ role: { $in: roles } }).select('_id role').lean();
  const offlineRecipients = recipients.filter(({ _id }) => !isUserOnline(_id));

  roles.forEach((role) => emitToRole(role, eventName, payload));

  if (!offlineRecipients.length) {
    return;
  }

  const notifications = await Notification.insertMany(
    offlineRecipients.map(({ _id }) => ({
      recipient: _id,
      eventName,
      payload: {
        ...payload,
        ticket: payload.ticket?.toObject?.() || payload.ticket
      }
    }))
  );

  await User.bulkWrite(
    notifications.map(({ _id, recipient }) => ({
      updateOne: {
        filter: { _id: recipient },
        update: { $push: { unsentNotifications: _id } }
      }
    }))
  );
};

const emitNotificationToUsers = async (userIds, eventName, payload) => {
  if (!io || !userIds?.length) {
    return;
  }

  const uniqueUserIds = [...new Set(userIds.map((userId) => userId.toString()))];
  const offlineUserIds = uniqueUserIds.filter((userId) => !isUserOnline(userId));

  uniqueUserIds.forEach((userId) => emitToUser(userId, eventName, payload));

  if (!offlineUserIds.length) {
    return;
  }

  const notifications = await Notification.insertMany(
    offlineUserIds.map((userId) => ({
      recipient: userId,
      eventName,
      payload: {
        ...payload,
        ticket: payload.ticket?.toObject?.() || payload.ticket
      }
    }))
  );

  await User.bulkWrite(
    notifications.map(({ _id, recipient }) => ({
      updateOne: {
        filter: { _id: recipient },
        update: { $push: { unsentNotifications: _id } }
      }
    }))
  );
};

const emitToTicket = (ticketId, eventName, payload) => {
  if (!io || !ticketId) {
    return;
  }

  io.to(ticketRoom(ticketId.toString())).emit(eventName, payload);
};

const rooms = { userRoom, roleRoom, ticketRoom };

export {
  initSocket,
  getIO,
  emitToUser,
  emitToRole,
  emitToTicket,
  emitNotificationToRoles,
  emitNotificationToUsers,
  rooms
};
